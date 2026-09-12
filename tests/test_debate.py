import json
import unittest
from pathlib import Path
from unittest.mock import patch
from engine import new_debate, context_for, add_reply, moderate, demo_reply, export_debate
from streamlit.testing.v1 import AppTest

class DebateTests(unittest.TestCase):
    def test_reply_receives_opponent_and_moderator(self):
        s = new_debate()
        add_reply(s, 'a', demo_reply(s, 'a'), 'Demo')
        moderate(s, 'Give a concrete example.')
        ctx = context_for(s, 'b')
        self.assertEqual(ctx['opponent_latest_argument']['speaker'], 'a')
        self.assertEqual(ctx['debate'][-1]['speaker'], 'moderator')
        self.assertIn(s['log'][0]['claim'], demo_reply(s, 'b')['text'])
        self.assertEqual(s['next'], 'b')

    def test_invalid_turn_and_empty_moderation_are_atomic(self):
        s = new_debate()
        with self.assertRaises(ValueError):
            add_reply(s, 'b', demo_reply(s, 'b'), 'Demo')
        with self.assertRaises(ValueError):
            moderate(s, '   ')
        self.assertEqual(s['log'], [])

    def test_connections_route_independently(self):
        from dialogue import reply
        s = new_debate()
        with patch('dialogue.connect') as connect:
            connect.return_value.output_text = json.dumps(dict(text='A point.', claim='A claim.', move='opening'))
            add_reply(s, 'a', reply(s, 'a', 'fake-a', 'model-a'), 'model-a')
            reply(s, 'b', 'fake-b', 'model-b')
            self.assertEqual(connect.call_args_list[0].args[:2], ('fake-a', 'model-a'))
            self.assertEqual(connect.call_args_list[1].args[:2], ('fake-b', 'model-b'))
            ctx = json.loads(connect.call_args_list[1].args[2])
            self.assertEqual(ctx['opponent_latest_argument']['text'], 'A point.')
            self.assertNotIn('fake-a', export_debate(s))

    def test_app_demo_settings_and_missing_live_key(self):
        app = AppTest.from_file(str(Path(__file__).resolve().parents[1] / 'app.py'), default_timeout=30).run()
        button = lambda label: next(b for b in app.button if b.label == label)
        self.assertEqual(len(app.exception), 0)
        button('One exchange · 2 turns').click().run()
        self.assertEqual([e['speaker'] for e in app.session_state['debate']['log']], ['a', 'b'])
        app.text_input(key='name_a').input('Thea')
        button('Save orators').click().run()
        self.assertEqual(app.session_state['debate']['cast'][0]['name'], 'Thea')
        app.radio[0].set_value('Live AI').run()
        button('Next argument').click().run()
        self.assertEqual(len(app.session_state['debate']['log']), 2)
        self.assertTrue(any('key' in x.value for x in app.error))
        self.assertEqual(len(app.exception), 0)

    def test_failed_live_reply_does_not_leak_errors(self):
        from dialogue import reply
        with patch('dialogue.connect', side_effect=RuntimeError('secret-value')):
            with self.assertRaises(ValueError) as error:
                reply(new_debate(), 'a', 'fake', 'model')
            self.assertNotIn('secret-value', str(error.exception))

if __name__ == '__main__':
    unittest.main()
