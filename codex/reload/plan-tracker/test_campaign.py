import copy
import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('campaign', Path(__file__).with_name('campaign.py'))
campaign = importlib.util.module_from_spec(spec)
spec.loader.exec_module(campaign)


class CampaignReceipts(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.ledger = {'versions': [{'id': 'V' + str(i), 'status': 'planned', 'generation': None,
                                   'requiredProofs': ['geometry'], 'evidence': []} for i in range(1, 6)]}

    def test_empty_slots_are_pending_not_accepted(self):
        self.assertEqual([], campaign.validate(self.ledger, self.root))
        self.ledger['versions'][0]['status'] = 'accepted'
        errors = campaign.validate(self.ledger, self.root)
        self.assertTrue(any('missing exact served-byte' in e for e in errors))
        self.assertTrue(any('missing real app' in e for e in errors))

    def test_same_generation_wrong_engine_proof_rejected(self):
        slot = self.ledger['versions'][0]
        slot.update(status='built', generation='202609051844', sourceCommit='a' * 40,
                    engineCommit='b' * 40, buildSha256='c' * 64)
        artifact = self.root / 'proof.json'
        artifact.write_text('{"ok":true}')
        identity = {key: slot[key] for key in ('generation', 'sourceCommit', 'engineCommit', 'buildSha256')}
        identity['engineCommit'] = 'd' * 40
        slot['evidence'] = [{'path': artifact.name, 'sha256': campaign.sha(artifact),
                            'kind': 'geometry', 'result': 'pass', 'generation': slot['generation'], 'release': identity}]
        self.assertTrue(any('identity mismatch' in e for e in campaign.validate(self.ledger, self.root)))


if __name__ == '__main__':
    unittest.main()
