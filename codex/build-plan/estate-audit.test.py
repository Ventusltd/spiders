import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('audit', Path(__file__).with_name('estate-audit.py'))
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class AuditTest(unittest.TestCase):
    def test_reference_evidence(self):
        self.assertEqual(audit.references('uses: actions/checkout@abc\nnode scripts/run.mjs\nhttps://github.com/Ventusltd/gridatlas'), [
            ('action-reference', 'actions/checkout@abc'), ('repository-reference', 'Ventusltd/gridatlas'), ('script-reference', 'scripts/run.mjs')])

    def test_prewrite_budget(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            receipt = audit.save(root, 'small.json', {'key': 'a'})
            self.assertEqual(receipt['bytes'], len((root / 'small.json').read_bytes()))
            with self.assertRaises(ValueError):
                audit.save(root, 'large.json', {'value': 'x' * audit.MAX_PART})
            self.assertFalse((root / 'large.json').exists())


if __name__ == '__main__':
    unittest.main()
