# This is a script to process the PGN file of chess games into a JSON object opening tree that contains all the
# attributes I need for my visualization

import json
import chess.pgn
import io
import sys

# total arguments
n = len(sys.argv)

filename = sys.argv[1]
min = float(sys.argv[2])
max = float(sys.argv[3])
stop = float(sys.argv[4])


# where to load from
# this will only work on my machine because source data file is too large to upload to github (250+ GB)
# filepath = r"C:\Users\ethan\OneDrive\Desktop\Fall 22\CS 5630\project\code\data\lichess_db_standard_rated_2022-09.pgn\lichess_db_standard_rated_2022-09.pgn"
filepath = r"./data/raw/lichess_db_standard_rated_2022-09.pgn"

# the root node of the tree to be generated out of source data
root = {
    "move": None,
    "turn": "w",
    "n": 0,
    "wins": 0,
    "children": {}
}

# helper that determines winner based on result string and which player has the next move
def won(result, turn):
    if result == "1-0":
        return turn == "w"
    elif result == "0-1":
        return turn == "b"
    else:
        return False

# ternary to get next turn
def next(turn):
    return "w" if turn == "b" else "b"


def process_chunk(chunk):
    pgn = io.StringIO(chunk)
    game = chess.pgn.read_game(pgn)


    level = (float(game.headers["BlackElo"]) + float(game.headers["WhiteElo"]))/2
    if level < min or level > max:
        return False

    result = game.headers["Result"]
    node = root

    node["n"] += 1
    if won(result, node["turn"]):
        node["wins"] += 1

    for m in game.mainline_moves():
        move = str(m)
        if move in node["children"]:
            node = node["children"][move]
            node["n"] += 1
            if won(result, node["turn"]):
                node["wins"] += 1
        else:
            node["children"][move] = {
                "move": move,
                "turn": next(node["turn"]),
                "n": 1,
                "wins": 1 if won(result, next(node["turn"])) else 0,
                "children": {}
            }
            node = node["children"][move]
    return True


# DFS to prune all branches that have only been played one time
# Otherwise, the tree would have ~100000 paths of length 20+ that do not represent aggregate data
def trim(node, newRoot):
    for childMove, childNode in node["children"].items():
        if childNode["n"] > 1:
            newRoot["children"][childMove] = {
                "move": childMove,
                "n": childNode["n"],
                "wins": childNode["wins"],
                "children": {}
            }
            trim(childNode, newRoot["children"][childMove])


# read and process individual games from the file, then write the results to another file
with open(filepath, "r") as r, open("./data/processed/" + filename, "w") as w:
    chunk = ""
    count = 0
    for line in r:
        chunk += line
        if "1. " in line:
            processed = process_chunk(chunk)
            chunk = ""
            if count > stop:
                break
            if processed:
                count += 1
    newRoot = {
        "move" : None,
        "n" : root["n"],
        "wins" : root["wins"],
        "children" : {}
    }
    trim(root, newRoot)

    w.write(json.dumps(newRoot))