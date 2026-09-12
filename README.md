# Pnyx

**A garden of arguments. Two orators. Room to change your mind.**

[Enter the floating garden](https://pnyx-floating-garden.streamlit.app/)

### Profiles and ready-made debates

Open **Debates across time** to load a question and a pair of profiles: Athens meets the machine, Freedom across the centuries, A letter from 2400, The automated newsroom, or The city under watch. Loading a template replaces the discussion; download it first to keep it. Connection settings remain intact.

Under **Shape the orators**, apply Socratic, Stoic, Mill-inspired, care-ethics, or speculative future profiles. Edit their prompts, robe color, and sash color. These are creative interpretations, not authentic quotations or historical reconstructions. Modern topics are evergreen prompts, not live news reports.

### If live dialogue does not start

Select **Live AI**. Both key fields are always editable. Leave the second blank to reuse the first key, or enter a second key to use a separate account. Choose each model independently. Test each connection: the test checks the same JSON dialogue format used by actual turns. The app distinguishes missing settings, authentication/access problems, timeouts, incomplete output, and invalid reply format. Tests and turns use API credits.

Browser-extension messages and iframe feature warnings do not report the server-side API result. If a turn fails, use the message shown inside Pnyx to diagnose it. No raw API error text or key is shown. JSON output is requested explicitly; a model supporting the Responses API and JSON mode is required.

A miniature Athenian-inspired debate garden built with Streamlit and Three.js. Two fictional orators take turns responding to each other's arguments while you set the question, shape their perspectives, or step up to the moderator's lectern.

## In the garden

- An inlaid astronomical mosaic, carved column capitals, swaying banners, flowers, distant islands, and two orators with draped robes and detailed faces.
- Small speaker cues with full subtitles below the scene, replay, pause, manual subtitle advance, and relaxed/standard reading pace.
- Optional soft two-note chimes distinguish the orators at a handoff. No continuous mumbling; sound starts off and has a volume control.
- Separate OpenAI API keys and model names for each orator. Use the same model or compare two different text models available to your accounts.
- Connection tests with clear success/error feedback. Changing a key or model clears its previous result.
- Editable starting positions and speaking styles with save confirmation.
- One manual argument or an automatic conversation of 1–5 exchanges (2–10 turns). Each reply is displayed and given reading time before the next API request begins.
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

Start in **Demo**, choose a question and conversation length, and click **Start conversation**. Use **Pause** below the garden to hold the current turn, or **Stop conversation** to end the sequence. **Next argument** remains available for manual turns when no sequence is running. Edit the characters under **Shape the orators**. In **Live AI**, enter each orator's key/model in the sidebar and test them independently. Tests and live turns incur API usage charges. The default model name is `gpt-4.1-mini`; you can enter another compatible OpenAI text model.

For Streamlit Community Cloud, select this repository, branch `main`, and entrypoint `app.py`.

## How dialogue works

Each model call plays exactly one speaker. Its instructions require a specific response to the opponent's latest argument, followed by a reason, counterexample, concession, or question. Fresh analogies and thought experiments are encouraged. Characters can change their minds. Moderator interventions enter the shared transcript without consuming either speaker's turn.

Automatic conversations are bounded by the chosen cycle length. The browser acknowledges completion of each displayed subtitle before the server requests another reply; duplicate and stale acknowledgments are ignored. Pausing or hiding the tab holds the reading phase. Stop prevents subsequent requests, though an in-flight request may finish. Changing connections, mode, profiles, question, or adding a moderator intervention stops the sequence. No unattended scheduled job is created. A failed call stops the sequence and leaves that turn unconsumed. The model's adherence is not guaranteed, and arguments are not fact-checked or web-researched.

Debates stop at 60 entries so the full discussion remains bounded. Begin a new debate to reset the discussion while keeping your character settings. Download first if you want to keep the old discussion.

**The thread of ideas** displays each saved claim, its link to the opponent's preceding turn, and any open question. This attributed chain is appended to every live prompt alongside the full transcript. It is a record of the speakers' claims, not an independent factual summary. Moderator directions remain in the chain. It does not persist beyond the current debate unless downloaded.

Subtitles allow at least ten seconds and scale with word count (150 words/minute in Relaxed mode, 195 in Standard). New replies append to the playback queue rather than interrupting the current subtitle. Pause preserves remaining reading time. Switching away from the tab pauses playback; resume when ready. **Next subtitle** skips forward without making an API call.

## Session and privacy

API keys stay in Streamlit's server session. They are never passed to the Three.js component, logs, or downloads. Character settings and conversation text are sent to OpenAI during live turns, with `store=False`. Connection tests send only a short test prompt. Pnyx adds no automatic disk saves or analytics. State may be lost when the session disconnects or reloads. Downloads preserve the discussion, but importing a saved debate is not yet supported. Do not enter sensitive information into a public demo.

The characters are fictional and the environment is stylized, not a historical reconstruction.

## Checks

```sh
python -m unittest discover -s tests -v
node --check scene/scene.js
node --test tests/playback.test.mjs
```

Tests cover speaker order, moderator context, independent connection routing, secret-safe failures, and the Streamlit demo/settings flow. Mocked API tests do not establish live account access.

Three.js r170 and OrbitControls are vendored under `scene/vendor` with their MIT license. Pnyx code is MIT licensed.

## Nearby worlds

- [Office Hours](https://office-simulator.streamlit.app/) — a tiny workplace drama that inspired this garden.
- [More experiments from ncypher](https://github.com/ncypher/ncypher)
