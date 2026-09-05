import copy
import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('plan_validator', Path(__file__).with_name('validate.py'))
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)


class CheckpointProofs(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.release = {'generation': '202609051820', 'sourceCommit': 'a' * 40,
                        'engineCommit': 'b' * 40, 'buildSha256': 'c' * 64}
        self.plan = {'schema': 'spiders.build-plan.v1', 'baselineRelease': self.release,
                     'tasks': [{'id': 'P2', 'status': 'completed', 'owner': 'teleprinter',
                                'nextAction': 'retained acceptance', 'acceptance': 'actual app path',
                                'dependsOn': [], 'requiredProofs': ['app-pdf'],
                                'targetRelease': self.release, 'targetCommits': {'teleprinter': 'b' * 40},
                                'targetEnvironments': {'app-pdf': 'Chrome desktop'}, 'proofs': []}]}
        artifact = self.root / 'actual-test.json'
        artifact.write_text('{"ok":true,"forbiddenCalls":0}')
        self.proof = {'schema': 'spiders.build-proof.v1', 'taskId': 'P2', 'kind': 'app-pdf',
                      'result': 'pass', 'verification': 'measured', 'checkedAt': '2026-09-05T18:00:00Z',
                      'environment': 'Chrome desktop', 'release': copy.deepcopy(self.release),
                      'commits': {'teleprinter': 'b' * 40},
                      'artifacts': [{'path': artifact.name, 'sha256': validator.digest(artifact)}]}

    def save_proof(self):
        path = self.root / 'proof.json'
        path.write_text(json.dumps(self.proof))
        self.plan['tasks'][0]['proofs'] = [{'path': path.name, 'sha256': validator.digest(path)}]

    def test_completed_without_proof_fails(self):
        self.assertTrue(any('missing proof categories' in e for e in validator.validate(self.plan, self.root)))

    def test_wrong_release_fails_even_with_correct_hash(self):
        self.proof['release']['generation'] = '202609051623'
        self.save_proof()
        self.assertTrue(any('wrong release identity' in e for e in validator.validate(self.plan, self.root)))

    def test_valid_receipt_then_underlying_tamper(self):
        self.save_proof()
        self.assertEqual([], validator.validate(self.plan, self.root))
        (self.root / 'actual-test.json').write_text('{"ok":false}')
        self.assertTrue(any('underlying artifact changed' in e for e in validator.validate(self.plan, self.root)))

    def test_claim_and_incomplete_dependency_cannot_complete(self):
        self.proof['verification'] = 'recorded-claim'
        self.save_proof()
        self.plan['tasks'].append({'id': 'P1', 'status': 'in_progress', 'owner': 'testcode',
                                   'nextAction': 'inspect', 'acceptance': 'pass', 'dependsOn': []})
        self.plan['tasks'][0]['dependsOn'] = ['P1']
        errors = validator.validate(self.plan, self.root)
        self.assertTrue(any('incomplete prerequisite' in e for e in errors))
        self.assertTrue(any('recorded claim' in e for e in errors))

    def test_cycle_and_escaping_path_fail(self):
        self.save_proof()
        self.plan['tasks'][0]['dependsOn'] = ['P2']
        self.plan['tasks'][0]['proofs'][0]['path'] = '../outside.json'
        errors = validator.validate(self.plan, self.root)
        self.assertTrue(any('dependency cycle' in e for e in errors))
        self.assertTrue(any('beneath' in e for e in errors))

    def test_completion_not_validated_without_offline_evidence(self):
        self.save_proof()
        self.assertTrue(any('local evidence' in e for e in validator.validate(self.plan)))

    def test_wrong_owning_commit_rejected(self):
        self.proof['commits']['teleprinter'] = 'd' * 40
        self.save_proof()
        self.assertTrue(any('wrong owning commit' in e for e in validator.validate(self.plan, self.root)))

    def test_wrong_environment_rejected(self):
        self.proof['environment'] = 'Plain static localhost server'
        self.save_proof()
        self.assertTrue(any('wrong environment identity' in e for e in validator.validate(self.plan, self.root)))


if __name__ == '__main__':
    unittest.main()
