import unittest
from pathlib import Path
from streamlit.testing.v1 import AppTest
from sequence import start_sequence, wait_for_reading, acknowledge

class SequenceTests(unittest.TestCase):
    def test_matching_completion_consumed_once_and_old_events_ignored(self):
        seq = start_sequence(1)
        wait_for_reading(seq, 0)
        event = dict(seq['waiting'])
        self.assertFalse(acknowledge(seq, {'token':'stale','line_id':0}))
        self.assertEqual(seq['remaining'], 1)
        self.assertTrue(acknowledge(seq, event))
        self.assertFalse(acknowledge(seq, event))
        wait_for_reading(seq, 1)
        self.assertFalse(acknowledge(seq, event))
        self.assertTrue(acknowledge(seq, dict(seq['waiting'])))
        self.assertEqual(seq['remaining'], 0)
        self.assertIsNone(seq['waiting'])

    def test_start_produces_only_one_turn_and_rerun_does_not_advance(self):
        app = AppTest.from_file(str(Path(__file__).resolve().parents[1] / 'app.py'), default_timeout=30).run()
        next(b for b in app.button if b.label == 'Start conversation').click().run()
        self.assertEqual(len(app.session_state['debate']['log']), 1)
        self.assertEqual(app.session_state['sequence']['remaining'], 3)
        app.run()
        self.assertEqual(len(app.session_state['debate']['log']), 1)
        next(b for b in app.button if b.label == 'Stop conversation').click().run()
        self.assertNotIn('sequence', app.session_state)
        app.run()
        self.assertEqual(len(app.session_state['debate']['log']), 1)
        self.assertEqual(len(app.exception), 0)
