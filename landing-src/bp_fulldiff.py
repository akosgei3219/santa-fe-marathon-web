# Whole-file oracle: decode escape forms, neutralise the 3 known pipeline artifacts,
# then region-diff. Catches identifier/key/structure changes the literal diff cannot see.
import io, re, sys
BS = chr(92)
ESC = re.compile(BS + BS + '(?:u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2}))')
CDN = "https://santafehalfmarathon.com/wp-content/uploads/2026/09/"
HERO = CDN + "sfi-2026-landing-startline.jpg"
ADV  = CDN + "sfhm-sponsor-advanced-prosthetics-logo.png"
BIGSKY = CDN + "sfi-2026-hero-big-sky.jpg"
def norm(p, is_good):
    s = io.open(p, encoding="utf-8").read()
    s = ESC.sub(lambda m: chr(int(m.group(1) or m.group(2), 16)), s)
    s = s.replace("%%IMG_HERO%%", HERO).replace("%%IMG_ADVANCED%%", ADV)
    if is_good:                       # drop the dead in-place-patch const
        s = re.sub(r'[A-Za-z$_][A-Za-z0-9$_]{0,3}="' + re.escape(BIGSKY) + r'",', "", s, count=1)
    return s
A, B = norm(sys.argv[1], False), norm(sys.argv[2], True)
print("mine %d   good %d   delta %d" % (len(A), len(B), len(B) - len(A)))
if A == B:
    print("\nIDENTICAL after normalisation")
    sys.exit(0)
i = j = n = 0
while i < len(A) and j < len(B) and n < 100000:
    if A[i] == B[j]: i += 1; j += 1; continue
    back = 0
    while back < 50 and i - back > 0 and A[i-back-1] not in ' >";,': back += 1
    si, sj = i - back, j - back
    bi = bj = -1
    for d in range(1, 8000):
        for x, y in ((i+d, j), (i, j+d), (i+d, j+d)):
            if x+30 <= len(A) and y+30 <= len(B) and A[x:x+30] == B[y:y+30]:
                bi, bj = x, y; break
        if bi >= 0: break
    n += 1
    if bi < 0:
        print("\n--- region %d @%d NO RESYNC\n  MINE: %r\n  GOOD: %r" % (n, si, A[si:si+300], B[sj:sj+300])); break
    print("\n--- region %d @mine %d ---\n  MINE: %r\n  GOOD: %r" % (n, si, A[si:bi][:300], B[sj:bj][:300]))
    i, j = bi, bj
print("\n%d region(s)" % n)
