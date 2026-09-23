# RAREFIED INDEX - Plate I  (raster master, supersampled)
import math, random, os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
FONTS = os.path.join(HERE, "fonts")
OUT = os.path.join(HERE, "rarefied-index-plate-I.png")

W_PT, H_PT = 648.0, 864.0          # 9 x 12 in
DPI = 300
SS = 2                             # supersample factor
S = (DPI / 72.0) * SS              # px per point while drawing
PX_W, PX_H = int(W_PT * S), int(H_PT * S)

PAPER  = (242, 238, 231)
INK    = (30, 28, 26)
SOFT   = (140, 133, 123)
FAINT  = (200, 194, 184)
ACCENT = (173, 74, 46)

def F(name, pt): return ImageFont.truetype(os.path.join(FONTS, name), int(round(pt * S)))
ITAL = lambda p: F("Italiana-Regular.ttf", p)
JURA = lambda p: F("Jura-Light.ttf", p)
GEIS = lambda p: F("GeistMono-Regular.ttf", p)

img = Image.new("RGB", (PX_W, PX_H), PAPER)
d = ImageDraw.Draw(img)

def X(x): return x * S
def Y(y): return (H_PT - y) * S          # flip to top-left origin

def line(x0, y0, x1, y1, col, w=0.4):
    d.line([(X(x0), Y(y0)), (X(x1), Y(y1))], fill=col, width=max(1, int(round(w * S))))

def dline(x0, y0, x1, y1, col, w=0.3, on=1.2, off=2.6):
    L = math.hypot(x1 - x0, y1 - y0)
    if L <= 0: return
    ux, uy, t = (x1 - x0) / L, (y1 - y0) / L, 0.0
    while t < L:
        a, b = t, min(L, t + on)
        line(x0 + ux * a, y0 + uy * a, x0 + ux * b, y0 + uy * b, col, w)
        t += on + off

PIX = img.load()
_DISC = {}
def _disc(r_px):
    key = round(r_px, 3)
    if key not in _DISC:
        R = int(math.ceil(r_px)); o = []
        for dx in range(-R, R + 1):
            for dy in range(-R, R + 1):
                if dx * dx + dy * dy <= r_px * r_px + 0.25: o.append((dx, dy))
        _DISC[key] = o
    return _DISC[key]

def dot(x, y, r, col):
    """direct pixel writes - ~40x faster than ImageDraw.ellipse at this count"""
    cx, cy = int(X(x)), int(Y(y))
    for dx, dy in _disc(r * S):
        ix, iy = cx + dx, cy + dy
        if 0 <= ix < PX_W and 0 <= iy < PX_H: PIX[ix, iy] = col

def ring(x, y, r, col, w=0.7):
    R = r * S
    d.ellipse([X(x) - R, Y(y) - R, X(x) + R, Y(y) + R], outline=col,
              width=max(1, int(round(w * S))))

def text(x, y, s, font, col, anchor="l"):
    wpx = d.textlength(s, font=font)
    px = X(x) - (wpx if anchor == "r" else wpx / 2 if anchor == "c" else 0)
    d.text((px, Y(y) - font.size * 0.78), s, font=font, fill=col)

# ---- geometry -------------------------------------------------------------
FX0, FX1, FY0, FY1 = 96.0, 552.0, 300.0, 662.0
FW, FH = FX1 - FX0, FY1 - FY0
DMIN, DMAX, EMIN, EMAX, TOP = 0.0, 13.10, 6572.0, 6906.0, 0.885
CTRL = [(0.00,6600),(0.60,6596),(1.20,6613),(2.00,6606),(2.60,6621),(3.10,6634),
        (3.70,6625),(4.00,6629),(4.50,6640),(4.90,6652),(5.50,6663),(6.00,6671),
        (6.60,6688),(7.00,6703),(7.60,6731),(8.00,6769),(8.50,6837),(8.78,6866),
        (9.00,6883),(9.30,6849),(9.60,6812),(10.00,6755),(10.60,6716),(11.00,6689),
        (11.60,6655),(12.00,6631),(12.50,6614),(13.10,6602)]
def px_(dd): return FX0 + (dd - DMIN) / (DMAX - DMIN) * FW
def py_(e):  return FY0 + (e - EMIN) / (EMAX - EMIN) * FH * TOP

def resample(ctrl, n=1200):
    xs = [p[0] for p in ctrl]; ys = [p[1] for p in ctrl]; out = []
    for i in range(n + 1):
        dd = DMIN + (DMAX - DMIN) * i / n
        for j in range(len(xs) - 1):
            if xs[j] <= dd <= xs[j + 1]:
                t = (dd - xs[j]) / (xs[j + 1] - xs[j]) if xs[j + 1] != xs[j] else 0
                t = t * t * (3 - 2 * t)
                out.append((dd, ys[j] + (ys[j + 1] - ys[j]) * t)); break
        else:
            out.append((dd, ys[-1]))
    for _ in range(3):
        sm = [out[0]]
        for k in range(1, len(out) - 1):
            sm.append((out[k][0], (out[k-1][1] + out[k][1]*2 + out[k+1][1]) / 4.0))
        sm.append(out[-1]); out = sm
    return out
CURVE = resample(CTRL)
def elev(dd):
    i = int(max(0, min(len(CURVE) - 1, round(dd / DMAX * (len(CURVE) - 1)))))
    return CURVE[i][1]

# ---- I. the medium --------------------------------------------------------
random.seed(1883)
COLS, ROWS = 304, 272
for i in range(COLS):
    for j in range(ROWS):
        x = FX0 + (i + 0.5) / COLS * FW + random.uniform(-1.0, 1.0)
        y = FY0 + (j + 0.5) / ROWS * FH + random.uniform(-1.0, 1.0)
        if not (FX0 + 0.8 < x < FX1 - 0.8 and FY0 + 0.8 < y < FY1 - 0.8): continue
        surface = py_(elev((x - FX0) / FW * DMAX))
        if y < surface:                                   # the settled medium
            depth = (surface - y) / max(1.0, surface - FY0)
            p = 0.42 + 0.50 * (depth ** 0.78)
            col = INK
        else:                                             # the rarefied zone
            h = (y - surface) / max(1.0, FY1 - surface)
            p = 0.44 * ((1.0 - h) ** 3.15)
            col = INK if random.random() < 0.62 else SOFT
        if random.random() < p:
            dot(x, y, 0.255 if random.random() < 0.86 else 0.355, col)

# ---- II. gradation --------------------------------------------------------
for e in range(6600, 6901, 100):
    y = py_(e)
    if FY0 < y < FY1:
        dline(FX0, y, FX1, y, FAINT, 0.28, 1.0, 3.2)
        text(FX0 - 9, y - 1.8, str(e), GEIS(5.1), SOFT, "r")

# ---- III. the trace -------------------------------------------------------
APEX_D, APEX_E = 9.00, 6883.0
pts_out = [(px_(dd), py_(e)) for dd, e in CURVE if dd <= APEX_D]
d.line([(X(a), Y(b)) for a, b in pts_out], fill=ACCENT,
       width=max(1, int(round(1.15 * S))), joint="curve")
# dashed return leg: segments are ~0.5pt and the dash period is 5pt, so decide
# on/off per whole segment by its midpoint phase. No inner loop, cannot stall.
ret = [(px_(dd), py_(e)) for dd, e in CURVE if dd >= APEX_D]
ON, OFF, acc = 2.6, 2.4, 0.0
for i in range(len(ret) - 1):
    (x0, y0), (x1, y1) = ret[i], ret[i + 1]
    seg = math.hypot(x1 - x0, y1 - y0)
    if seg <= 1e-9: continue
    if ((acc + seg * 0.5) % (ON + OFF)) < ON:
        line(x0, y0, x1, y1, ACCENT, 0.95)
    acc += seg

# ---- IV. stations ---------------------------------------------------------
STATIONS = [2.0, 4.0, 6.0, 8.0, 9.0, 10.0, 12.0]
AXIS = FY0 - 17.0
line(FX0, AXIS, FX1, AXIS, INK, 0.5)
for s in STATIONS:
    x = px_(s)
    line(x, AXIS, x, AXIS - 5.2, INK, 0.55)
    text(x, AXIS - 13.6, "%04.1f" % s, GEIS(5.6), INK, "c")
    dline(x, AXIS + 1.6, x, py_(elev(s)) - 2.4, FAINT, 0.26, 0.8, 3.4)
    dot(x, py_(elev(s)), 2.85, PAPER)
    ring(x, py_(elev(s)), 2.15, ACCENT, 0.62)
for dd in (DMIN, DMAX):
    line(px_(dd), AXIS, px_(dd), AXIS - 3.0, SOFT, 0.45)
text(px_(DMIN), AXIS - 13.6, "00.0", GEIS(5.2), SOFT, "c")
text(px_(DMAX), AXIS - 13.6, "13.1", GEIS(5.2), SOFT, "c")

# ---- V. apex --------------------------------------------------------------
ax, ay = px_(APEX_D), py_(APEX_E)
dline(ax, ay + 4.4, ax, FY1 - 1.0, ACCENT, 0.38, 1.0, 2.4)
dot(ax, ay, 2.9, PAPER); dot(ax, ay, 1.55, ACCENT)
text(ax, FY1 + 30.0, "A P E X", JURA(5.0), SOFT, "c")
text(ax, FY1 + 12.0, "6883", GEIS(13.0), INK, "c")

# ---- VI. frame + registration --------------------------------------------
for (x0, y0, x1, y1) in ((FX0, FY0, FX1, FY0), (FX0, FY1, FX1, FY1),
                         (FX0, FY0, FX0, FY1), (FX1, FY0, FX1, FY1)):
    line(x0, y0, x1, y1, INK, 0.42)
for (cx, cy) in ((FX0, FY0), (FX1, FY0), (FX0, FY1), (FX1, FY1)):
    line(cx - 5.4, cy, cx + 5.4, cy, INK, 0.4)
    line(cx, cy - 5.4, cx, cy + 5.4, INK, 0.4)

# ---- VII. typography ------------------------------------------------------
text(FX0, 754, "RAREFIED INDEX", ITAL(38), INK)
text(FX0 + 1.5, 739, "A T T E N U A T I O N   O F   A   M E D I U M   W I T H   D I S P L A C E M E N T",
     JURA(7.0), SOFT)
line(FX0, 727, FX1, 727, INK, 0.5)
text(FX1, 757, "PLATE  I", GEIS(5.8), SOFT, "r")
text(FX1, 747, "SER. 06883", GEIS(5.8), SOFT, "r")

def vtext(x, y, s, font, col):
    wpx = int(d.textlength(s, font=font)) + int(font.size * 0.9)
    hpx = int(font.size * 1.7)
    strip = Image.new("RGBA", (wpx, hpx), (0, 0, 0, 0))
    ImageDraw.Draw(strip).text((0, 0), s, font=font, fill=col)
    strip = strip.rotate(90, expand=True)
    img.paste(strip, (int(X(x)), int(Y(y)) - strip.size[1]), strip)

vtext(FX0 - 34, FY0, "D E N S I T Y   O F   M E D I U M   ( R E L A T I V E )", JURA(5.6), SOFT)
vtext(FX1 + 13, FY0, "OBS. 13.10 / STATIONS 07 / DELTA +651", GEIS(5.2), SOFT)

# ---- VIII. notation -------------------------------------------------------
NY = 214.0
line(FX0, NY + 34, FX1, NY + 34, INK, 0.5)
cols = [("DISPLACEMENT", "13.10"), ("APEX", "6883"), ("NET RISE", "+651"), ("STATIONS", "07")]
step = FW / 4.0
for k, (lab, val) in enumerate(cols):
    x = FX0 + k * step
    text(x, NY + 22, " ".join(lab), JURA(5.4), SOFT)
    text(x, NY, val, GEIS(15.5), ACCENT if k == 1 else INK)
    if k: line(x - 15, NY - 4, x - 15, NY + 27, FAINT, 0.3)

# ---- IX. caption ----------------------------------------------------------
text(W_PT / 2.0, 168, "A T T E N U A T I O N   I S   N O T   A B S E N C E", JURA(8.4), INK, "c")

# ---- X. foot register -----------------------------------------------------
line(FX0, 104, FX1, 104, FAINT, 0.35)
text(FX0, 93, "R.I. / I", GEIS(4.9), SOFT)
text(W_PT / 2.0, 93, "GROUND · INK · ONE ACCENT", GEIS(4.9), SOFT, "c")
text(FX1, 93, "SHEET 01 OF 01", GEIS(4.9), SOFT, "r")
for k in range(41):
    x = FX0 + k * (FW / 40.0)
    h = 4.6 if k % 5 == 0 else 2.4
    line(x, 104, x, 104 + h, SOFT if k % 5 == 0 else FAINT, 0.3)

# ---- downsample -----------------------------------------------------------
final = img.resize((int(W_PT * DPI / 72.0), int(H_PT * DPI / 72.0)), Image.LANCZOS)
final.save(OUT, "PNG", optimize=True)
print("written:", OUT, final.size, os.path.getsize(OUT), "bytes")
