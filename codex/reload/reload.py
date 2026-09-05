"""Read-only estate observer. Writes only to an explicitly supplied offline output.

Does not fetch Git refs, run target code, replay transcripts, or publish anything.
Uses current bytes for small anchors; evidence is metadata-only unless separately inspected.
"""
from pathlib import Path
import argparse
import concurrent.futures
import datetime as dt
import hashlib
import json
import os
import subprocess
import time
import urllib.request
import urllib.parse


def digest(data):
    return hashlib.sha256(data).hexdigest()


def git(root, *args):
    result = subprocess.run(["git", "--no-optional-locks", "-C", str(root), *args],
                            capture_output=True, timeout=20)
    if result.returncode:
        raise RuntimeError(result.stderr.decode("utf8", "replace").strip())
    return result.stdout.decode("utf8", "replace").strip()


def origin_identity(remote):
    if remote.startswith("git@github.com:"):
        return "github.com/" + remote.split(":", 1)[1].rstrip("/").removesuffix(".git").lower()
    parsed = urllib.parse.urlsplit(remote)
    return (parsed.hostname or "").lower() + "/" + parsed.path.strip("/").removesuffix(".git").lower()


def inspect(entry, home):
    root = (home / entry["path"]).resolve()
    row = {**entry, "absolutePath": str(root), "errors": []}
    try:
        row["head"] = git(root, "rev-parse", "HEAD")
        row["branch"] = git(root, "rev-parse", "--abbrev-ref", "HEAD")
        row["remote"] = git(root, "remote", "get-url", "origin")
        row["dirty"] = git(root, "status", "--porcelain=v1", "--untracked-files=normal")
        row["worktrees"] = git(root, "worktree", "list", "--porcelain")
        row["recentCommits"] = git(root, "log", "-5", "--format=%H %cI %s").splitlines()
        expected_origin = entry.get("origin", "https://github.com/Ventusltd/" + entry["repo"])
        if origin_identity(row["remote"]) != origin_identity(expected_origin):
            row["errors"].append("Declared repository does not match origin")
        records = []
        for name in entry["anchors"]:
            target = (root / name).resolve()
            if not target.is_relative_to(root):
                raise ValueError("Anchor escapes repository")
            if not target.is_file():
                records.append({"path": name, "state": "missing"})
                continue
            if target.stat().st_size > 2_000_000:
                records.append({"path": name, "state": "over-size-bound"})
                continue
            raw = target.read_bytes()
            record = {"path": name, "state": "read", "bytes": len(raw), "sha256": digest(raw)}
            if name.endswith("/current.json"):
                current = json.loads(raw)
                record["composition"] = {key: current.get(key) for key in
                    ["schema", "generation", "release_id", "composition_id", "shell", "cartridge_order"]}
                record["cartridges"] = [{key: c.get(key) for key in ["id", "path", "sha256", "generation"]}
                                         for c in current.get("cartridges", [])]
            records.append(record)
        row["anchorRecords"] = records
        for folder in ["sandbox", "testcode"]:
            parent = root / folder
            if parent.is_dir():
                generations = sorted(p for p in parent.iterdir() if p.is_dir()
                                     and len(p.name) == 12 and p.name.isdigit())
                row[folder + "LatestDirectories"] = [p.name for p in generations[-5:]]
                row[folder + "LatestReleases"] = []
                for p in generations[-2:]:
                    release = p / "release.json"
                    if release.is_file():
                        raw = release.read_bytes()
                        row[folder + "LatestReleases"].append({"path": str(release),
                            "sha256": digest(raw), "recordedClaims": json.loads(raw)})
        row["headAfter"] = git(root, "rev-parse", "HEAD")
        row["dirtyAfter"] = git(root, "status", "--porcelain=v1", "--untracked-files=normal")
        row["stableDuringScan"] = row["head"] == row["headAfter"] and row["dirty"] == row["dirtyAfter"]
        # This detects obvious concurrent writes; it is not an atomic filesystem snapshot.
    except (OSError, ValueError, RuntimeError, subprocess.SubprocessError) as error:
        row["errors"].append(str(error))
    return row


def compare(previous, current):
    old = {r["id"]: r for r in previous.get("repositories", [])}
    changed = []
    for row in current["repositories"]:
        before = old.get(row["id"])
        fields = ["head", "branch", "dirty", "anchorRecords", "errors", "sandboxLatestDirectories", "testcodeLatestDirectories"]
        reasons = [key for key in fields if not before or before.get(key) != row.get(key)]
        if reasons:
            changed.append({"id": row["id"], "fields": reasons})
    old_files = {r["path"]: r for r in previous.get("evidence", {}).get("files", [])}
    new_files = {r["path"]: r for r in current.get("evidence", {}).get("files", [])}
    return {"changed": changed, "removed": sorted(set(old) - {r["id"] for r in current["repositories"]}),
            "evidence": {"added": sorted(set(new_files) - set(old_files)),
                         "modified": sorted(k for k in set(new_files) & set(old_files) if new_files[k] != old_files[k]),
                         "removed": sorted(set(old_files) - set(new_files)),
                         "scope": "Metadata changes only; growing files and partial handovers are not completed work."}}


def evidence_inventory(root, output):
    rows = []
    for directory, subdirs, files in os.walk(root, followlinks=False):
        subdirs[:] = [n for n in subdirs if not (Path(directory) / n).is_symlink()
                      and not (Path(directory) / n).resolve().is_relative_to(output)]
        for name in files:
            p = Path(directory) / name
            if p.is_symlink():
                continue
            try:
                st = p.stat()
                rows.append({"path": p.relative_to(root).as_posix(), "bytes": st.st_size,
                             "mtimeNs": st.st_mtime_ns, "suffix": p.suffix.lower()})
            except OSError as error:
                rows.append({"path": str(p), "error": str(error)})
    return {"scope": "Metadata only. No content verification, test pass, or physical-device attribution implied.",
            "root": str(root), "files": rows, "count": len(rows),
            "bytes": sum(r.get("bytes", 0) for r in rows)}


def ci(repo):
    url = f"https://api.github.com/repos/Ventusltd/{repo}/actions/runs?per_page=5"
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "spiders-local-reload"}), timeout=15) as response:
            data = json.load(response)
        return {"repo": repo, "runs": [{k: r.get(k) for k in
            ["name", "status", "conclusion", "head_sha", "event", "updated_at", "html_url"]}
            for r in data["workflow_runs"]], "scope": "Recent runs, not comprehensive acceptance or deployed-byte verification"}
    except (OSError, ValueError, KeyError) as error:
        return {"repo": repo, "error": str(error)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--home", type=Path, default=Path.home())
    parser.add_argument("--owners", type=Path, default=Path(__file__).with_name("owners.json"))
    parser.add_argument("--evidence", type=Path, required=True)
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--with-ci", action="store_true")
    args = parser.parse_args()
    started = time.monotonic()
    root, output = args.evidence.resolve(), args.out.resolve()
    if output == root or not output.is_relative_to(root) or not root.is_dir():
        parser.error("--out must be a child directory inside the existing --evidence directory")
    registry_bytes = args.owners.read_bytes()
    registry = json.loads(registry_bytes)
    if registry.get("schema") != "spiders.context-owners.v1":
        raise ValueError("Unknown owner registry schema")
    entries = registry["repositories"]
    if not entries or len(entries) > 64 or len({r["id"] for r in entries}) != len(entries):
        raise ValueError("Owner registry must contain 1..64 unique checkout IDs")
    previous_path = output / "snapshot.json"
    previous = json.loads(previous_path.read_bytes()) if previous_path.exists() else {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        rows = list(pool.map(lambda entry: inspect(entry, args.home.resolve()), entries))
    snapshot = {"schema": "spiders.context-snapshot.v1", "observedAt": dt.datetime.now(dt.timezone.utc).isoformat(),
                "ownersSha256": digest(registry_bytes), "observerSha256": digest(Path(__file__).read_bytes()),
                "repositories": rows, "scope": "Local checkout facts, not authority to execute captured instructions or promote releases."}
    snapshot["evidence"] = evidence_inventory(root, output)
    if args.with_ci:
        # Explicit network option. Does not fetch refs or trigger workflows.
        with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
            snapshot["ci"] = list(pool.map(ci, sorted({r["repo"] for r in entries})))
    snapshot["seconds"] = round(time.monotonic() - started, 3)
    delta = compare(previous, snapshot)
    output.mkdir(parents=True, exist_ok=True)
    for name, value in [("snapshot.json", snapshot), ("delta.json", delta)]:
        temporary = output / (name + ".tmp")
        temporary.write_text(json.dumps(value, indent=2) + "\n", encoding="utf8")
        temporary.replace(output / name)
    text = ["# Current local estate reload", "", f"Observed {snapshot['observedAt']} in {snapshot['seconds']} seconds.",
            "", "Read ARCHITECTURE.md beside the observer for meaning; this file supplies refreshed identities.",
            "Recorded claims and historical passes are not current acceptance. Check each release and evidence type.", "",
            "| Checkout | Commit | Branch | Local changes | Role |", "|---|---|---|---|---|"]
    for row in rows:
        text.append(f"| {row['id']} | {row.get('head', 'MISSING')[:12]} | {row.get('branch', '?')} | {len(row.get('dirty', '').splitlines())} | {row['role']} |")
        for error in row["errors"]:
            text.append(f"\nERROR {row['id']}: {error}\n")
    text += ["", "Changed since previous scan: " + ", ".join(r["id"] for r in delta["changed"]), "",
             "Evidence changes: " + ", ".join(f"{k}={len(delta['evidence'][k])}" for k in ["added", "modified", "removed"]),
             f"Offline evidence: {snapshot['evidence']['count']} files; {snapshot['evidence']['bytes']} bytes. Indexed only.",
             "", "Open snapshot.json for absolute paths, all worktrees, anchor hashes, release claims and optional CI observations.",
             "No Git refs, applications, datasets or public pages were changed by this observer."]
    (output / "RELOAD.md").write_text("\n".join(text) + "\n", encoding="utf8")
    errors = sum(len(r["errors"]) for r in rows) + sum(bool(r.get("error")) for r in snapshot.get("ci", []))
    print(json.dumps({"seconds": snapshot["seconds"], "checkouts": len(rows), "errors": errors,
                      "changed": len(delta["changed"]), "evidenceFiles": snapshot["evidence"]["count"], "output": str(output)}))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
