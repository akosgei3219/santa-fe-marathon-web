# Pair equal-length diff blocks into (old -> new) literal edits and apply them to the JSX.
# Matches COMPLETE double-quoted literals, and copes with the JSX storing some strings
# raw (ñ) and others escaped (\u00f1).
#   python bp_apply.py <src.html> [--write]
import io, json, sys
Q = '"'
BS = chr(92)
def esc(t):                      # non-ASCII -> \uXXXX, lowercase, as the JSX writes it
    return "".join(c if ord(c) < 128 else BS + "u%04x" % ord(c) for c in t)

blocks = json.load(io.open("bp_blocks.json", encoding="utf-8"))
src_path = sys.argv[1]
s = io.open(src_path, encoding="utf-8").read()

edits, deferred = {}, []
for n, o in enumerate(blocks, 1):
    st, gd = o["stale"], o["good"]
    if o["tag"] == "replace" and len(st) == len(gd):
        for a, b in zip(st, gd):
            if a == b:
                continue
            if a in edits and edits[a][0] != b:
                sys.exit("CONFLICT: %r -> %r and %r" % (a, edits[a][0], b))
            edits.setdefault(a, (b, []))[1].append(n)
    else:
        deferred.append(n)

rows, bad = [], []
for a, (b, ns) in sorted(edits.items(), key=lambda kv: -len(kv[0])):
    hit = None
    for form in ("raw", "esc"):
        oq = Q + (a if form == "raw" else esc(a)) + Q
        if s.count(oq) > 0:
            hit = (form, oq, s.count(oq)); break
    if not hit:
        bad.append((ns, 0, a)); continue
    form, oq, cnt = hit
    nq = Q + (b if form == "raw" else esc(b)) + Q
    rows.append((ns, cnt, form, oq, nq))

print("%d distinct edit(s): %d locatable, %d missing" % (len(edits), len(rows), len(bad)))
multi = [r for r in rows if r[1] > 1]
print("  %d edit(s) match >1 literal (all occurrences change):" % len(multi))
for ns, cnt, form, oq, nq in multi:
    print("    x%-2d %s  ->  %s" % (cnt, oq[:60], nq[:60]))
if bad:
    print("\n=== MISSING ===")
    for ns, c, a in bad:
        print("  blocks %s: %s" % (ns, json.dumps(a)[:170]))
print("\nDEFERRED structural blocks: %s" % ", ".join(map(str, deferred)))

if "--write" in sys.argv:
    if bad:
        sys.exit("refusing to write: %d missing" % len(bad))
    total = 0
    for ns, cnt, form, oq, nq in rows:
        s = s.replace(oq, nq); total += cnt
    io.open(src_path, "w", encoding="utf-8", newline="\n").write(s)
    print("\nWROTE %s  (%d literal replacement(s))" % (src_path, total))
