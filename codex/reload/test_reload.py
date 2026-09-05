"""Negative controls: wrong/missing checkouts and changes must stay visible."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("reload_observer", Path(__file__).with_name("reload.py"))
observer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(observer)


class ReloadProof(unittest.TestCase):
    def test_checkout_and_uncommitted_anchor_drift(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            for command in [["init", "-q"], ["config", "user.name", "fixture"],
                            ["config", "user.email", "fixture@example.invalid"],
                            ["remote", "add", "origin", "https://github.com/Ventusltd/fixture.git"]]:
                subprocess.run(["git", "-C", name, *command], check=True, capture_output=True)
            (root / "README.md").write_text("first")
            subprocess.run(["git", "-C", name, "add", "README.md"], check=True, capture_output=True)
            subprocess.run(["git", "-C", name, "commit", "-qm", "fixture"], check=True, capture_output=True)
            entry = {"id": "fixture", "path": ".", "repo": "fixture", "anchors": ["README.md"]}
            first = observer.inspect(entry, root)
            self.assertFalse(first["errors"])
            (root / "README.md").write_text("second")
            second = observer.inspect(entry, root)
            self.assertEqual(first["head"], second["head"])
            delta = observer.compare({"repositories": [first]}, {"repositories": [second]})
            self.assertIn("anchorRecords", delta["changed"][0]["fields"])
            self.assertIn("dirty", delta["changed"][0]["fields"])
            self.assertEqual(observer.compare({"repositories": [second]}, {"repositories": [second]})["changed"], [])
            wrong = observer.inspect({**entry, "repo": "wrong-owner"}, root)
            self.assertTrue(wrong["errors"])
            wrong_owner = observer.inspect({**entry, "origin": "https://github.com/other/fixture.git"}, root)
            self.assertTrue(wrong_owner["errors"])

    def test_origin_identity_includes_host_and_owner(self):
        identity = observer.origin_identity
        self.assertEqual(identity("https://github.com/Ventusltd/fixture.git"), identity("git@github.com:Ventusltd/fixture.git"))
        self.assertNotEqual(identity("https://github.com/another-owner/fixture.git"), identity("https://github.com/Ventusltd/fixture.git"))
        self.assertNotEqual(identity("https://elsewhere.invalid/Ventusltd/fixture.git"), identity("https://github.com/Ventusltd/fixture.git"))

    def test_missing_repository_is_an_error(self):
        with tempfile.TemporaryDirectory() as name:
            result = observer.inspect({"id": "missing", "path": "absent", "repo": "absent", "anchors": []}, Path(name))
            self.assertTrue(result["errors"])
            self.assertNotIn("head", result)

    def test_partial_evidence_changes_are_detected(self):
        old = {"repositories": [], "evidence": {"files": [{"path": "handover.json", "bytes": 10}, {"path": "old.json", "bytes": 2}]}}
        new = {"repositories": [], "evidence": {"files": [{"path": "handover.json", "bytes": 20}, {"path": "new.json", "bytes": 3}]}}
        result = observer.compare(old, new)["evidence"]
        self.assertEqual(result["modified"], ["handover.json"])
        self.assertEqual(result["added"], ["new.json"])
        self.assertEqual(result["removed"], ["old.json"])

    def test_evidence_is_not_executed_or_copied(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            (root / "captured.py").write_text("raise Exception('captured source must never run')")
            out = root / "output"
            out.mkdir()
            (out / "prior.json").write_text("{}")
            result = observer.evidence_inventory(root, out)
            self.assertEqual(result["count"], 1)
            self.assertEqual(result["files"][0]["path"], "captured.py")
            self.assertNotIn("content", result["files"][0])

    def test_output_outside_evidence_is_rejected(self):
        with tempfile.TemporaryDirectory() as name:
            root = Path(name)
            evidence = root / "evidence"
            evidence.mkdir()
            result = subprocess.run([sys.executable, str(Path(__file__).with_name("reload.py")),
                                     "--evidence", str(evidence), "--out", str(root / "outside")],
                                    capture_output=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertFalse((root / "outside").exists())


if __name__ == "__main__":
    unittest.main()
