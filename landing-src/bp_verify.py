# Back-port oracle: build-from-JSX vs the known-good artifact, escape-normalised,
# with the two permanent pipeline artifacts excluded.
#   usage: python bp_verify.py <built.html> <good.html> [-v]
import io, re, sys, difflib, json
BS = chr(92)
LIT = re.compile('"((?:[^"' + BS + BS + ']|' + BS + BS + '.)*)"')
ESC = re.compile(BS + BS + '(?:u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2})|(.))')
CDN = "https://santafehalfmarathon.com/wp-content/uploads/2026/09/"
# Never converge, by construction -- see CLAUDE.md:
#  HERO: JSX holds the raw URL that %%IMG_HERO%% maps to; backport.js tokenised live's copy.
#  ADVANCED: JSX holds the token; live holds the PNG URL (the base64 is not in live).
EXCLUDE = [
    ([CDN + "sfi-2026-landing-startline.jpg"], ["%%IMG_HERO%%"]),
    # (IMG_ADVANCED removed 2026-09-22: the token now resolves to that same PNG URL
    #  via urlMap, so the two sides agree and no exclusion is needed.)
    # HERO_IMG: live still declares it, unused, because the in-place patch swapped the
    # array's src:HERO_IMG for a literal URL and left the dead const behind. A clean
    # build tree-shakes it; correct source must NOT resurrect it.
    ([], [CDN + "sfi-2026-hero-big-sky.jpg"]),
]
def unesc(t):
    def r(m):
        if m.group(1): return chr(int(m.group(1), 16))
        if m.group(2): return chr(int(m.group(2), 16))
        return {"n": "\n", "t": "\t", "r": "\r"}.get(m.group(3), m.group(3))
    return ESC.sub(r, t)
def lits(p):
    return [unesc(m.group(1)) for m in LIT.finditer(io.open(p, encoding="utf-8").read())]
A, B = lits(sys.argv[1]), lits(sys.argv[2])
blocks, skipped = [], 0
for t, i1, i2, j1, j2 in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes():
    if t == "equal":
        continue
    st, gd = A[i1:i2], B[j1:j2]
    if (st, gd) in [(list(a), list(b)) for a, b in EXCLUDE]:
        skipped += 1
        continue
    blocks.append({"tag": t, "stale": st, "good": gd})
verbose = "-v" in sys.argv
for n, o in enumerate(blocks, 1):
    print("\n--- block %d [%s] ---" % (n, o["tag"]))
    lim = 100000 if verbose else 600
    for x in o["stale"]: print("  - " + json.dumps(x)[:lim])
    for x in o["good"]:  print("  + " + json.dumps(x)[:lim])
io.open("bp_blocks.json","w",encoding="utf-8").write(json.dumps(blocks, ensure_ascii=False, indent=1))
print("\n%d OUTSTANDING block(s)   (%d pipeline artifact(s) excluded)" % (len(blocks), skipped))
