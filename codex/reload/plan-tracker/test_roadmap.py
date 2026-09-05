import copy
import json
from pathlib import Path
import unittest
from validate_roadmap import validate


class RoadmapProof(unittest.TestCase):
    def setUp(self):
        self.plan = json.loads(Path(__file__).with_name('NEXT-50.json').read_bytes())

    def test_real_queue_and_duplicate(self):
        self.assertEqual(validate(self.plan), [])
        self.plan['items'][1]['id'] = 'N01'
        self.assertTrue(validate(self.plan))

    def test_cycle_cannot_be_scheduled(self):
        self.plan['items'][0]['dependsOn'] = ['N02']
        self.assertIn('dependency cycle', validate(self.plan))

    def test_roadmap_cannot_invent_completion_or_receipts(self):
        row = self.plan['items'][0]
        row['status'] = 'accepted'
        self.assertTrue(validate(self.plan))
        row['status'] = 'linked'
        self.assertTrue(validate(self.plan))


if __name__ == '__main__':
    unittest.main()
