"""v5 DRAFT patch 2 -- two defects found by measuring the first build, not by eyeballing it.

1. The relocated facts band was invisible. It rendered at y=808..887, but .quick-bar carries
   margin-top:-60px and z-index:3 by design (it deliberately overlaps the hero's bottom edge),
   so it covered the band. Moving HeroFacts below QuickBar is the fix; fighting it with z-index
   would break the overlap the quick bar was built for.

2. The sub-headline had a zero gap from the tagline: .hero3-date still carried the margins it
   needed when it sat ABOVE the title (margin:0 0 1.1rem). In the three-element order it sits
   below the tagline, so the margin belongs on top.

usage: python patch_v5_fixes.py
"""
import io, sys

SRC = "run-santa-fe-2026.src.html"
s = io.open(SRC, encoding="utf-8").read()
orig = len(s)
edits = []


def sub(label, old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f"FATAL [{label}]: expected {count}, found {n}")
    s = s.replace(old, new)
    edits.append((label, len(new) - len(old)))


sub("move facts band below the quick bar",
    "      <Hero t={t}/>\n      <HeroFacts t={t}/>\n      <QuickBar t={t}/>\n",
    "      <Hero t={t}/>\n      <QuickBar t={t}/>\n      <HeroFacts t={t}/>\n")

sub("sub-headline gap",
    "html body #root p.hero3-date{margin:0 0 1.1rem;",
    "html body #root p.hero3-date{margin:1.15rem 0 0;")

io.open(SRC, "w", encoding="utf-8", newline="").write(s)
print(f"{SRC}: {orig} -> {len(s)} chars")
for label, d in edits:
    print(f"  {d:+6d}  {label}")
