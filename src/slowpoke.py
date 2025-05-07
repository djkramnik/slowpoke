#!/usr/bin/env python3
"""
slowpoke_v1.py
  • foundation triples come from a TSV  (subj \t rel \t obj)
  • passage text comes from a plain‑text file
  • builds one combined in‑memory graph   (edges = [(s,r,o)])
  • supports interactive Q&A for:
        – where is X?
        – what color is X?
        – what lives in X?
        – what does the child like to do under X?
  This is intentionally minimal (~150 LOC) so you can iterate.
"""
import re, sys, itertools, pathlib, readline

# ─────────────────────────────  basic graph helpers ────────────────────────────
def canon(txt: str) -> str:
    return re.sub(r"[^\w\s]", "", txt.lower()).strip()

def add_edge(edges: list, s: str, r: str, o: str | None):
    edges.append((canon(s), r, canon(o) if o else None))

def load_foundation(path: str) -> list[tuple[str, str, str | None]]:
    edges = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            parts = [p.strip() for p in line.split("\t")]
            if len(parts) >= 3:
                add_edge(edges, *parts[:3])
    return edges

# ─────────────────────────────  naive passage ingest ──────────────────────────
_PAT_IN_LOC   = re.compile(r"(\b\w+\b)[^.]*\bin (?:my |the )?(\b\w+\b)")
_PAT_IS_ADJ   = re.compile(r"(\b\w+\b)\s+is\s+(?:very\s+)?(\b\w+\b)")
_PAT_LIVE_IN  = re.compile(r"(\b\w+\b)s?\s+live[s]?\s+in\s+the\s+(\b\w+\b)")
_PAT_LIKE_UND = re.compile(r"(?:i|the child)\s+like[s]?\s+to\s+(\w+)\s+under\s+the\s+(\w+)")

def ingest_passage(text: str) -> list[tuple[str,str,str|None]]:
    edges: list[tuple[str,str,str|None]] = []
    current_subject: str | None = None
    for sent in re.split(r"[.!?]\s*", text.strip()):
        if not sent:
            continue
        # 1) location  e.g. "tree ... in my yard"
        if m := _PAT_IN_LOC.search(sent):
            subj, place = m.groups()
            current_subject = subj
            add_edge(edges, subj, "located_in", place)
            continue
        # 2) X is adj  ("tree is green" / "tree is tall")
        if m := _PAT_IS_ADJ.search(sent):
            subj, adj = m.groups()
            current_subject = subj
            add_edge(edges, subj, "attr", adj)
            continue
        # pronoun "it is ..." using running subject
        if current_subject and (m := re.match(r"it\s+is\s+(?:very\s+)?(\w+)", sent, re.I)):
            adj = m.group(1)
            add_edge(edges, current_subject, "attr", adj)
            continue
        # 3) birds live in the tree
        if m := _PAT_LIVE_IN.search(sent):
            animal, where = m.groups()
            add_edge(edges, animal, "lives_in", where)
            continue
        # 4) I like to sit under the tree
        if m := _PAT_LIKE_UND.search(sent):
            verb, obj = m.groups()
            add_edge(edges, "child", f"likes_to_{verb}_under", obj)
            continue
        # 5) fallback for "I see them fly." (not handled)
    return edges

# ─────────────────────────────  query dispatcher  ─────────────────────────────
def answer(edges: list[tuple[str,str,str|None]], q: str) -> str:
    q = q.strip().lower()
    # where is the X ?
    if m := re.match(r"where is (?:the |a |an )?([\w\s]+)\?", q):
        subj = canon(m.group(1))
        for s, r, o in edges:
            if s == subj and r == "located_in":
                return o
        return "I don't know."
    # what color is the X ?
    if m := re.match(r"what color is (?:the |a )?([\w\s]+)\?", q):
        subj = canon(m.group(1))
        for s, r, o in edges:
            if s == subj and r == "attr":
                return o
        return "I don't know."
    # what lives in the X ?
    if m := re.match(r"what lives in (?:the |a )?([\w\s]+)\?", q):
        loc = canon(m.group(1))
        things = [s for s,r,o in edges if r == "lives_in" and o == loc]
        return ", ".join(things) if things else "I don't know."
    # what does the child like to do under the X ?
    if m := re.match(r"what does (?:the )?child like to do under (?:the )?([\w\s]+)\?", q):
        obj = canon(m.group(1))
        for s,r,o in edges:
            if s == "child" and o == obj and r.startswith("likes_to_"):
                return r.removeprefix("likes_to_").removesuffix("_under")
        return "I don't know."
    return "Query type not recognised."

# ─────────────────────────────  main CLI  ─────────────────────────────────────
def main():
    if len(sys.argv) != 3:
        print("Usage: slowpoke_v1.py foundation.tsv passage.txt")
        sys.exit(1)

    foundation_path, passage_path = sys.argv[1:3]
    edges = load_foundation(foundation_path)

    passage_text = pathlib.Path(passage_path).read_text(encoding="utf-8")
    edges += ingest_passage(passage_text)

    print("Ask me questions (empty line to quit)…")
    while True:
        try:
            q = input("> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break
        if q == "":
            break
        print(answer(edges, q))

if __name__ == "__main__":
    main()
