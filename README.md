# Pnyx

**A garden of arguments. Two orators. Room to change your mind.**

A miniature Athenian-inspired debate garden built with Streamlit and Three.js. Two fictional orators take turns responding to each other's arguments while you set the question, shape their perspectives, or step up to the moderator's lectern.

## In the garden

- A floating terrace, olive tree, ruined columns, torchlight, and two animated orators.
- Small speaker cues with full subtitles below the scene, replay, pause, and optional synthesized mumbling.
- Separate OpenAI API keys and model names for each orator. Use the same model or compare two different text models available to your accounts.
- Connection tests with clear success/error feedback. Changing a key or model clears its previous result.
- Editable starting positions and speaking styles with save confirmation.
- One argument or one two-turn exchange at a time. The next orator receives the preceding argument, the complete current debate, and moderator interventions.
- Scripted demo mode requiring no key. This demonstrates the flow; it is not generative reasoning.
- Moderator questions, redirects, and requests for closing statements.
- Markdown transcript and JSON data downloads. No automatic winner or scoring.

## Run locally

Python 3.11 or later:

```sh
python -m venv .venv
# Activate the environment, then:
pip install -r requirements.txt
streamlit run app.py
```

On Windows, activate with `.venv\Scripts\Activate.ps1`. On macOS/Linux, use `source .venv/bin/activate`.

Start in **Demo**, choose a question, and click **One exchange · 2 turns**. Edit the characters under **Shape the orators**. In **Live AI**, enter each orator's key/model in the sidebar and test them independently. Tests and live turns incur API usage charges. The default model name is `gpt-4.1-mini`; you can enter another compatible OpenAI text model.

For Streamlit Community Cloud, select this repository, branch `main`, and entrypoint `app.py`. No hosted app URL has been assigned in this repository yet.

## How dialogue works

Each model call plays exactly one speaker. Its instructions require a specific response to the opponent's latest argument, followed by a reason, counterexample, concession, or question. Characters can change their minds. Moderator interventions enter the shared transcript without consuming either speaker's turn. A batch stops after two calls; nothing runs in the background. A failed call leaves that turn unconsumed. The model's adherence is not guaranteed, and arguments are not fact-checked or web-researched.

Debates stop at 60 entries so the full discussion remains bounded. Begin a new debate to reset the discussion while keeping your character settings. Download first if you want to keep the old discussion.

## Session and privacy

API keys stay in Streamlit's server session. They are never passed to the Three.js component, logs, or downloads. Character settings and conversation text are sent to OpenAI during live turns, with `store=False`. Connection tests send only a short test prompt. Pnyx adds no automatic disk saves or analytics. State may be lost when the session disconnects or reloads. Downloads preserve the discussion, but importing a saved debate is not yet supported. Do not enter sensitive information into a public demo.

The characters are fictional and the environment is stylized, not a historical reconstruction.

## Checks

```sh
python -m unittest discover -s tests -v
node --check scene/scene.js
```

Tests cover speaker order, moderator context, independent connection routing, secret-safe failures, and the Streamlit demo/settings flow. Mocked API tests do not establish live account access.

Three.js r170 and OrbitControls are vendored under `scene/vendor` with their MIT license. Pnyx code is MIT licensed.

## Nearby worlds

- [Office Hours](https://office-simulator.streamlit.app/) — a tiny workplace drama that inspired this garden.
- [More experiments from ncypher](https://github.com/ncypher/ncypher)
