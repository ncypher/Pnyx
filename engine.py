"""Debate state and turn rules. No credentials belong in this module's state."""
import json
from copy import deepcopy

TOPICS = {
    "The good life": "Is a good life built more on personal freedom or responsibility to others?",
    "The thinking machine": "Should an AI ever have a vote in decisions that affect people?",
    "The city and the wild": "Should a city prioritize human prosperity or the flourishing of all living things?",
    "The price of truth": "Is it ever right to hide a truth for the public good?",
}
DEFAULTS = [
    dict(id="a", name="Lysandra", color="#e9b86c", position="Defend personal agency, curiosity, and the freedom to experiment.", style="Warm, incisive, concrete examples; concede a good point."),
    dict(id="b", name="Damon", color="#78c8bc", position="Defend mutual responsibility, collective wisdom, and care for the vulnerable.", style="Socratic, thoughtful, ask precise questions; avoid easy answers."),
]

def new_debate(topic=None, cast=None):
    return dict(topic=topic or TOPICS["The good life"], cast=deepcopy(cast or DEFAULTS), log=[], next="a", revision=0)

def context_for(state, speaker):
    person = next(c for c in state["cast"] if c["id"] == speaker)
    opponent = next(c for c in state["cast"] if c["id"] != speaker)
    latest = next((x for x in reversed(state["log"]) if x["speaker"] == opponent["id"]), None)
    return dict(topic=state["topic"], your_character=person, opponent=opponent,
                opponent_latest_argument=latest, debate=deepcopy(state["log"]))

def validate_reply(raw):
    obj = json.loads(raw)
    if not isinstance(obj, dict):
        raise ValueError("The orator returned an unreadable reply. Try again.")
    for field in ("text", "claim"):
        if not isinstance(obj.get(field), str) or not obj[field].strip():
            raise ValueError("The reply was missing its argument. Try again.")
    return dict(text=obj["text"].strip()[:1800], claim=obj["claim"].strip()[:180],
                move=obj.get("move") if obj.get("move") in ("opening", "challenge", "concession", "question", "synthesis") else "challenge")

def add_reply(state, speaker, reply, source):
    if speaker != state["next"]:
        raise ValueError("It is the other orator's turn.")
    if len(state["log"]) >= 60:
        raise ValueError("This debate has reached 60 entries. Download it and begin a new debate.")
    person = next(c for c in state["cast"] if c["id"] == speaker)
    state["log"].append(dict(id=len(state["log"]), speaker=speaker, name=person["name"], source=source, **reply))
    state["next"] = "b" if speaker == "a" else "a"

def moderate(state, text):
    if not text.strip():
        raise ValueError("Write a question or direction first.")
    if len(state["log"]) >= 60:
        raise ValueError("Download this debate and begin a new one.")
    state["log"].append(dict(id=len(state["log"]), speaker="moderator", name="Moderator", text=text.strip()[:2000], source="You", claim="", move="moderation"))

def demo_reply(state, speaker):
    ctx = context_for(state, speaker)
    last = ctx["opponent_latest_argument"]
    intervention = next((e for e in reversed(state["log"]) if e["speaker"] == "moderator"), None)
    intro = f'On “{state["topic"]}”, my starting position is: {ctx["your_character"]["position"]}'
    if last:
        intro = f'{ctx["opponent"]["name"]}, your point was “{last["claim"]}”. '
        intro += ["I accept the intention, but who carries the cost when it fails?", "That is a fair objection. Can we test it against a case where the individual and the city disagree?", "Then we share a concern about harm. Our disagreement is who should decide what counts as harm."][len(state["log"]) % 3]
    if intervention:
        intro += f' The moderator asks: “{intervention["text"][:200]}”. That gives us a useful test for the next exchange.'
    claims = ["Freedom needs room for experiments and mistakes.", "A choice is not fully free when others carry its costs.", "Good rules should leave room for exceptions.", "Shared responsibility needs limits on who holds power."]
    return dict(text=intro, claim=claims[len(state["log"]) % 4], move="opening" if not last else "question")

def export_debate(state):
    return json.dumps(dict(version=1, **state), ensure_ascii=False, indent=2)

def transcript(state):
    lines = ["# Pnyx", "", state["topic"], ""]
    for item in state["log"]:
        lines.extend([f'## {item["name"]} · {item["source"]}', "", item["text"], ""])
    return "\n".join(lines)
