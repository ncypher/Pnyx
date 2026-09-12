from pathlib import Path
from copy import deepcopy
import html
import streamlit as st
import streamlit.components.v1 as components
from engine import DEFAULTS, TOPICS, new_debate, add_reply, moderate, demo_reply, export_debate, transcript, idea_thread
from dialogue import reply, check
from profiles import PROFILES, DEBATES

ROOT = Path(__file__).parent
garden = components.declare_component("pnyx_garden", path=str(ROOT / "scene"))
st.set_page_config(page_title="Pnyx · A garden of arguments", page_icon="🏛️", layout="wide")
st.markdown('''<style>
.block-container{max-width:1500px;padding:4.5rem 2rem 2rem}
[data-testid="stAppViewContainer"]{background:radial-gradient(ellipse at 15% 0%,#59464d65,transparent 50%),radial-gradient(ellipse at 95% 80%,#1c55564d,transparent 55%),#111827}
[data-testid="stHeader"]{background:#111827dd}[data-testid="stSidebar"]{background:#172131}
h1{font-family:Georgia,serif!important;font-size:4rem!important;letter-spacing:-.08em}h3{font-family:Georgia,serif!important}
.eyebrow{color:#e9b86c;font-size:.72rem;letter-spacing:.24em;font-weight:700}.intro{color:#bbc6cd;font-size:1.05rem;margin-top:-14px}
.topic{border-left:3px solid #e9b86c;background:linear-gradient(110deg,#3d3541,#1c2c38);padding:18px 22px;border-radius:0 14px 14px 0;font:1.2rem/1.5 Georgia,serif;margin:10px 0 22px}
.argument{padding:16px 18px;border:1px solid #364454;border-left:3px solid var(--ink);border-radius:12px;background:#1a2536;margin:0 0 12px}.argument p{line-height:1.65;margin:8px 0}.argument small{color:#aebbc6}.argument strong{color:var(--ink)}
.person{border-top:2px solid var(--ink);padding:12px 0;color:#b9c5ce}.person b{color:var(--ink)}
@media(max-width:1000px){[data-testid="stMainBlockContainer"] [data-testid="stHorizontalBlock"]{flex-wrap:wrap}[data-testid="stMainBlockContainer"] [data-testid="stColumn"]{min-width:0!important;flex:1 1 100%!important}.block-container{padding:3rem 1rem 1rem}}
</style>''', unsafe_allow_html=True)
esc = html.escape
if "debate" not in st.session_state:
    st.session_state.debate = new_debate()
state = st.session_state.debate

def receipt(text):
    st.session_state.receipt = text

def invalidate(cid):
    st.session_state.pop(f"checked_{cid}", None)
    if cid == "a":
        st.session_state.pop("checked_b", None)

def load_profile(cid, profile):
    person = next(c for c in state["cast"] if c["id"] == cid)
    person.update(deepcopy(PROFILES[profile]))
    for field in ("name", "position", "style", "color", "robe"):
        st.session_state.pop(f"{field}_{cid}", None)
    receipt(f"{profile} applied. You can edit the interpretation below.")

def load_debate():
    topic, left, right = DEBATES[st.session_state["debate_template"]]
    load_profile("a", left)
    load_profile("b", right)
    replacement = new_debate(topic, state["cast"])
    replacement["revision"] = state["revision"] + 1
    st.session_state.debate = replacement
    receipt("Debate template loaded. Characters and question are ready; connection settings were kept.")

connections = {}
with st.sidebar:
    st.markdown("### The director’s chair")
    mode = st.radio("Voices", ["Demo", "Live AI"], help="Demo uses scripted exchanges. Live AI uses each orator's own OpenAI connection.")
    st.caption("Two minds. Two connections. Use the same model or give each a different one.")
    st.caption("Both key fields are editable. Leave the second key blank to reuse the first; enter a second key to use a separate account. Models are always independent.")
    for c in state["cast"]:
        cid = c["id"]
        with st.expander(f'{c["name"]} · connection', expanded=mode == "Live AI"):
            entered = st.text_input("OpenAI API key", type="password", key=f"key_{cid}", on_change=invalidate, args=(cid,))
            key = connections["a"][0] if cid == "b" and not entered.strip() else entered
            if cid == "b":
                st.caption("Using this orator's separate key." if entered.strip() else "Using the first orator's key when available. Enter a key here to override it.")
            model = st.text_input("Model", value="gpt-4.1-mini", key=f"model_{cid}", on_change=invalidate, args=(cid,))
            connections[cid] = (key.strip(), model.strip())
            if st.button("Test connection", key=f"test_{cid}", disabled=not key.strip() or not model.strip()):
                with st.spinner("Asking for a tiny reply…"):
                    st.session_state[f"checked_{cid}"] = check(key.strip(), model.strip())
            result = st.session_state.get(f"checked_{cid}")
            if result:
                (st.success if result[0] else st.error)(result[1])
            else:
                st.caption("Not tested" if key else "No key entered · demo is ready")
    st.caption("Keys stay in the server session and are never sent to the 3D view or included in downloads. Live turns share the topic, character settings, and debate with OpenAI. Tests and turns use your API credits.")
    st.divider()
    st.markdown("### Keep this conversation")
    st.download_button("Download transcript", transcript(state), "pnyx-debate.md", "text/markdown")
    st.download_button("Download debate data", export_debate(state), "pnyx-debate.json", "application/json")
    st.caption("Changes stay in this session. Download before refreshing or starting a new debate. Downloads preserve the discussion; importing saved debates is not yet supported.")

st.markdown('<div class="eyebrow">A SMALL STAGE FOR LARGE QUESTIONS</div>', unsafe_allow_html=True)
st.title("Pnyx")
st.markdown('<p class="intro">A garden of arguments. Two orators. Room to change your mind.</p>', unsafe_allow_html=True)
if mode == "Live AI":
    missing = [c["name"] for c in state["cast"] if not all(connections[c["id"]])]
    if missing:
        st.warning("Connection setup needed for: " + ", ".join(missing) + ". Open the sidebar to enter a key and model.")
    else:
        st.caption("Live AI selected · both orators have connection settings. Use Test connection to verify each model.")
if "receipt" in st.session_state:
    st.success(st.session_state.receipt)
debate_tab, cast_tab = st.tabs(["The gathering", "Shape the orators"])
with cast_tab:
    st.caption("Philosopher-inspired interpretations and imagined future voices—not authentic quotations or historical reconstructions.")
    for col, c in zip(st.columns(2), state["cast"]):
        with col:
            profile = st.selectbox(f'Profile for {c["name"]}', list(PROFILES), key=f'profile_{c["id"]}')
            st.button("Apply profile", key=f'apply_{c["id"]}', on_click=load_profile, args=(c["id"], profile))
    with st.form("characters"):
        edits = []
        for col, c in zip(st.columns(2), state["cast"]):
            with col:
                st.markdown(f'### {c["name"]}')
                edits.append(dict(c, name=st.text_input("Name", c["name"], max_chars=30, key=f'name_{c["id"]}'),
                                  position=st.text_area("Starting position / convictions", c["position"], max_chars=1200, key=f'position_{c["id"]}'),
                                  style=st.text_area("Speaking style", c["style"], max_chars=700, key=f'style_{c["id"]}'),
                                  color=st.color_picker("Sash and speaker color", c["color"], key=f'color_{c["id"]}'),
                                  robe=st.color_picker("Robe color", c.get("robe", "#ece3cb"), key=f'robe_{c["id"]}')))
        if st.form_submit_button("Save orators", type="primary"):
            if all(c["name"].strip() and c["position"].strip() for c in edits):
                state["cast"] = edits
                receipt("Orators saved. Their next turns will use these settings.")
                st.rerun()
            else:
                st.error("Give both orators a name and a starting position.")

with debate_tab:
    with st.expander("Debates across time"):
        st.selectbox("Choose a ready-made gathering", list(DEBATES), key="debate_template")
        st.caption("Loads the question and both profiles, replacing the current discussion. Download it first to keep it. Modern topics are evergreen prompts, not live news briefings.")
        st.button("Load debate template", on_click=load_debate)
    st.markdown(f'<div class="topic">{esc(state["topic"])}</div>', unsafe_allow_html=True)
    stage, discussion = st.columns([1.45, 1], gap="large")
    with stage:
        turns = [x for x in state["log"] if x["speaker"] != "moderator"]
        garden(cast=state["cast"], lines=turns[-4:], revision=state["revision"], key="garden", default=None)
        st.caption("Drag to orbit · Scroll to explore · Home returns to the gathering · Sound is optional")
        for col, c in zip(st.columns(2), state["cast"]):
            with col:
                st.markdown(f'<div class="person" style="--ink:{c["color"]}"><b>{esc(c["name"])}</b><br>{esc(c["position"])}</div>', unsafe_allow_html=True)
        with st.expander("Set the question", expanded=not state["log"]):
            preset = st.selectbox("A place to begin", list(TOPICS) + ["My own question"])
            with st.form("topic"):
                topic = st.text_area("The question before the gathering", TOPICS.get(preset, ""), max_chars=2000, key=f"topic_{preset}")
                st.caption("Beginning a new debate clears the current discussion. Download it first if you want to keep it.")
                if st.form_submit_button("Begin new debate"):
                    if topic.strip():
                        replacement = new_debate(topic.strip(), state["cast"])
                        replacement["revision"] = state["revision"] + 1
                        st.session_state.debate = replacement
                        receipt("New question set. The gathering is ready.")
                        st.rerun()
                    else:
                        st.error("Give the gathering a question first.")
    with discussion:
        st.markdown("### The exchange")
        st.caption(f'{len(turns)} turns · {"Scripted demonstration" if mode == "Demo" else "Live dialogue"} · No automatic winner')
        with st.container(height=420):
            if not state["log"]:
                st.info("The floor is open. Invite the first argument, or shape your orators before they begin.")
            for item in state["log"]:
                color = next((c["color"] for c in state["cast"] if c["id"] == item["speaker"]), "#c0afd9")
                st.markdown(f'<div class="argument" style="--ink:{color}"><strong>{esc(item["name"])}</strong> <small>· {esc(item["move"])} · {esc(item["source"])}</small><p>{esc(item["text"])}</p></div>', unsafe_allow_html=True)
        next_name = next(c["name"] for c in state["cast"] if c["id"] == state["next"])
        with st.expander("The thread of ideas"):
            st.caption("Each turn carries these attributed claims and open questions into the next prompt, along with the full discussion. Memory lasts for this debate (up to 60 entries).")
            for idea in idea_thread(state):
                link = f' → replying to #{idea["responds_to"] + 1}' if idea["responds_to"] is not None else ""
                st.markdown(f'**#{idea["id"] + 1} · {esc(idea["name"])}{link}**')
                st.text(idea["idea"])
                if idea["open_question"]:
                    st.caption("Still open: " + idea["open_question"])
        st.caption(f'Next to speak: {next_name}. Every batch stops after two turns, giving you the floor.')
        if "turn_error" in st.session_state:
            st.error(st.session_state.pop("turn_error"))
        a, b = st.columns(2)
        one = a.button("Next argument", type="primary", disabled=len(state["log"]) >= 60, use_container_width=True)
        two = b.button("One exchange · 2 turns", disabled=len(state["log"]) >= 60, use_container_width=True)
        if one or two:
            for _ in range(2 if two else 1):
                if len(state["log"]) >= 60:
                    break
                cid = state["next"]
                key, model = connections[cid]
                name = next(c["name"] for c in state["cast"] if c["id"] == cid)
                try:
                    if mode == "Live AI" and (not key or not model):
                        raise ValueError(f"Enter {name}'s key and model in the sidebar, or switch to Demo.")
                    with st.spinner(f"{name} is considering the argument…"):
                        answer = reply(state, cid, key, model) if mode == "Live AI" else demo_reply(state, cid)
                    add_reply(state, cid, answer, model if mode == "Live AI" else "Demo")
                except ValueError as exc:
                    st.session_state.turn_error = str(exc)
                    break
            st.rerun()
        with st.expander("The moderator’s lectern"):
            st.caption("Ask for an example, challenge an assumption, redirect the discussion, or invite a closing statement. Both orators see your intervention on their next turn.")
            with st.form("moderate", clear_on_submit=True):
                direction = st.text_area("Your question or direction", max_chars=2000)
                if st.form_submit_button("Address the gathering"):
                    try:
                        moderate(state, direction)
                        receipt("Moderator intervention added. Both orators will see it on their next turn.")
                        st.rerun()
                    except ValueError as exc:
                        st.error(str(exc))
st.caption("Pnyx is a creative dialogue experiment. Arguments may be mistaken; no web research or fact-checking is performed. Inspired by a place of assembly, built for the pleasure of thinking together.")
