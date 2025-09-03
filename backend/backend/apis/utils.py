# utils.py

def get_delta(actions: list[str]) -> int:
    valid_actions = {"like", "undo_like", "dislike", "undo_dislike", "save", "undo_save"}
    """
    This function takes an action:
    ("save", "unsave", "like", "undo_like", "dislike", "undo_dislike")
    and returns (delta) "change that will take place in the score of the genre"
    """
    delta: int = 0
    for action in actions:
        if action not in valid_actions:
            continue
        elif action == "like":
            delta += 1
        elif action == "undo_like":
            delta -= 1
        elif action == "dislike":
            delta -= 2
        elif action == "undo_dislike":
            delta += 2
        elif action == "save":
            delta += 3
        elif action == "undo_save":
            delta -= 3

    return delta