"""v5 DRAFT patch 3 -- fix the presented-by line colliding with the CTA on phones.

Renaming .hero3-sponsor to .hero3-presented orphaned the phone breakpoint's override, which
still read `.hero3-sponsor{position:static;margin-top:1.75rem}`. With nothing resetting it, the
desktop rule's `position:absolute;bottom:5.5rem` stayed in force at 390px and the line landed on
top of the Register button.

This is exactly why the mobile screenshot is not optional: every structural check passed and the
desktop render was correct. A renamed class silently breaks any breakpoint that still refers to
the old name -- grep the old name across ALL breakpoints when renaming, not just the rule you
meant to change.

usage: python patch_v5_phone.py
"""
import io, sys

SRC = "run-santa-fe-2026.src.html"
s = io.open(SRC, encoding="utf-8").read()
orig = len(s)

# Nothing should still reference the retired class name.
stale = s.count(".hero3-sponsor")
print(f"stale '.hero3-sponsor' references: {stale}")
if stale != 1:
    sys.exit(f"FATAL: expected exactly 1 stale reference (the phone override), found {stale}")

OLD = "  .hero3-sponsor{position:static;margin-top:1.75rem}"
NEW = "  html body #root p.hero3-presented{position:static;margin-top:1.5rem;bottom:auto;left:auto}"
if s.count(OLD) != 1:
    sys.exit("FATAL: phone override not found in the expected form")
s = s.replace(OLD, NEW)

assert ".hero3-sponsor" not in s, "a stale reference survived"
io.open(SRC, "w", encoding="utf-8", newline="").write(s)
print(f"{SRC}: {orig} -> {len(s)} chars  ({len(NEW)-len(OLD):+d})")
print("phone override now targets .hero3-presented; no stale class references remain")
