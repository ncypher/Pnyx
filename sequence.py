"""A bounded conversation advances only after the displayed turn is acknowledged."""
from uuid import uuid4

def start_sequence(exchanges):
    if exchanges not in range(1, 6):
        raise ValueError("Choose between one and five exchanges.")
    return dict(id=uuid4().hex, remaining=int(exchanges)*2, total=int(exchanges)*2, waiting=None)

def wait_for_reading(sequence, line_id):
    sequence["remaining"] -= 1
    sequence["waiting"] = dict(token=uuid4().hex, line_id=line_id)

def acknowledge(sequence, event):
    waiting = sequence.get("waiting")
    if not waiting or not isinstance(event, dict) or event != waiting:
        return False
    sequence["waiting"] = None
    return True
