# RAREFIED INDEX - Plate I
# A study of attenuation: density of a medium against displacement.
import math, random, os
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.lib.colors import Color
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")
OUT = r"C:\Users\info\OneDrive\Desktop\SantaFeMarathonWeb\design\rarefied-index-plate-I.pdf"

pdfmetrics.registerFont(TTFont("Italiana", os.path.join(FONTS, "Italiana-Regular.ttf")))
pdfmetrics.registerFont(TTFont("JuraL",    os.path.join(FONTS, "Jura-Light.ttf")))
pdfmetrics.registerFont(TTFont("JuraM",    os.path.join(FONTS, "Jura-Medium.ttf")))
pdfmetrics.registerFont(TTFont("Geist",    os.path.join(FONTS, "GeistMono-Regular.ttf")))

W, H = 648.0, 864.0                      # 9 x 12 in
PAPER  = Color(0.949, 0.933, 0.906)      # #F2EEE7 warm laid ground
INK    = Color(0.118, 0.110, 0.102)      # #1E1C1A
SOFT   = Color(0.549, 0.522, 0.482)      # #8C857B
FAINT  = Color(0.784, 0.761, 0.722)      # #C8C2B8
ACCENT = Color(0.678, 0.290, 0.180)      # #AD4A2E

# ---- field geometry -------------------------------------------------------
FX0, FX1 = 96.0, 552.0                   # field left / right
FY0, FY1 = 300.0, 662.0                  # field bottom / top
FW, FH = FX1 - FX0, FY1 - FY0

c = rl_canvas.Canvas(OUT, pagesize=(W, H))
c.setTitle("Rarefied Index - Plate I")
c.setAuthor("Rarefied Index")

# ground
c.setFillColor(PAPER); c.rect(0, 0, W, H, stroke=0, fill=1)

# ---- the observed trace ---------------------------------------------------
# displacement 0..13.10 ; medium-datum 6567..6900
CTRL = [(0.00,6600),(0.60,6596),(1.20,6613),(2.00,6606),(2.60,6621),(3.10,6634),
        (3.70,6625),(4.00,6629),(4.50,6640),(4.90,6652),(5.50,6663),(6.00,6671),
        (6.60,6688),(7.00,6703),(7.60,6731),(8.00,6769),(8.50,6837),(8.78,6866),
        (9.00,6883),(9.30,6849),(9.60,6812),(10.00,6755),(10.60,6716),(11.00,6689),
        (11.60,6655),(12.00,6631),(12.50,6614),(13.10,6602)]
DMIN, DMAX = 0.0, 13.10
EMIN, EMAX = 6572.0, 6906.0
TRACE_TOP = 0.885                        # the trace fills the field

def px(d): return FX0 + (d - DMIN) / (DMAX - DMIN) * FW
def py(e): return FY0 + (e - EMIN) / (EMAX - EMIN) * FH * TRACE_TOP

def resample(ctrl, n=900):
    """dense piecewise-linear resample, then light smoothing -> drafted curve"""
    xs = [p[0] for p in ctrl]; ys = [p[1] for p in ctrl]
    out = []
    for i in range(n + 1):
        d = DMIN + (DMAX - DMIN) * i / n
        for j in range(len(xs) - 1):
            if xs[j] <= d <= xs[j + 1]:
                t = (d - xs[j]) / (xs[j + 1] - xs[j]) if xs[j + 1] != xs[j] else 0
                t = t * t * (3 - 2 * t)          # smoothstep
                out.append((d, ys[j] + (ys[j + 1] - ys[j]) * t)); break
        else:
            out.append((d, ys[-1]))
    for _ in range(3):                            # gentle moving average
        sm = [out[0]]
        for k in range(1, len(out) - 1):
            sm.append((out[k][0], (out[k-1][1] + out[k][1]*2 + out[k+1][1]) / 4.0))
        sm.append(out[-1]); out = sm
    return out

CURVE = resample(CTRL)
def elev_at(d):
    i = int(max(0, min(len(CURVE) - 1, round(d / DMAX * (len(CURVE) - 1)))))
    return CURVE[i][1]

# ---- I. the medium: stipple whose density falls away with elevation -------
random.seed(1883)
COLS, ROWS = 304, 272
c.setFillColor(INK)
for i in range(COLS):
    for j in range(ROWS):
        x = FX0 + (i + 0.5) / COLS * FW + random.uniform(-1.05, 1.05)
        y = FY0 + (j + 0.5) / ROWS * FH + random.uniform(-1.05, 1.05)
        if not (FX0 + 0.6 < x < FX1 - 0.6 and FY0 + 0.6 < y < FY1 - 0.6):
            continue
        surface = py(elev_at((x - FX0) / FW * DMAX))
        if y < surface:                           # the settled medium
            depth = (surface - y) / max(1.0, surface - FY0)
            p = 0.42 + 0.50 * (depth ** 0.78)
        else:                                     # the rarefied zone
            h = (y - surface) / max(1.0, FY1 - surface)
            p = 0.44 * ((1.0 - h) ** 3.15)
        if random.random() < p:
            r = 0.255 if random.random() < 0.86 else 0.355
            c.circle(x, y, r, stroke=0, fill=1)

# ---- II. gradation rules (felt before seen) -------------------------------
c.setStrokeColor(FAINT); c.setLineWidth(0.28)
for e in range(6600, 6901, 100):
    y = py(e)
    if FY0 < y < FY1:
        c.setDash(1, 3); c.line(FX0, y, FX1, y); c.setDash()
        c.setFillColor(SOFT); c.setFont("Geist", 5.1)
        c.drawRightString(FX0 - 9, y - 1.7, str(e))

# ---- III. the trace: outbound solid, return finely dashed -----------------
APEX_D, APEX_E = 9.00, 6883.0
c.setStrokeColor(ACCENT); c.setLineCap(1); c.setLineJoin(1)
c.setLineWidth(1.15)
p = c.beginPath(); started = False
for d, e in CURVE:
    if d > APEX_D: break
    (p.lineTo if started else p.moveTo)(px(d), py(e)); started = True
c.drawPath(p, stroke=1, fill=0)

c.setLineWidth(0.95); c.setDash(1.6, 2.0)
p = c.beginPath(); started = False
for d, e in CURVE:
    if d < APEX_D: continue
    (p.lineTo if started else p.moveTo)(px(d), py(e)); started = True
c.drawPath(p, stroke=1, fill=0); c.setDash()

# ---- IV. stations: measured, irregular, exact ----------------------------
STATIONS = [2.0, 4.0, 6.0, 8.0, 9.0, 10.0, 12.0]
AXIS = FY0 - 17.0
c.setStrokeColor(INK); c.setLineWidth(0.5)
c.line(FX0, AXIS, FX1, AXIS)
for s in STATIONS:
    x = px(s)
    c.setStrokeColor(INK); c.setLineWidth(0.55)
    c.line(x, AXIS, x, AXIS - 5.2)
    c.setFillColor(INK); c.setFont("Geist", 5.6)
    c.drawCentredString(x, AXIS - 13.4, "%04.1f" % s)
    c.setStrokeColor(FAINT); c.setLineWidth(0.26); c.setDash(0.8, 3.4)
    c.line(x, AXIS + 1.5, x, py(elev_at(s)) - 2.2); c.setDash()
    c.setFillColor(PAPER); c.circle(x, py(elev_at(s)), 2.85, stroke=0, fill=1)
    c.setStrokeColor(ACCENT); c.setLineWidth(0.62)
    c.circle(x, py(elev_at(s)), 2.15, stroke=1, fill=0)

# terminal ticks
for d in (DMIN, DMAX):
    c.setStrokeColor(SOFT); c.setLineWidth(0.45)
    c.line(px(d), AXIS, px(d), AXIS - 3.0)
c.setFillColor(SOFT); c.setFont("Geist", 5.2)
c.drawCentredString(px(DMIN), AXIS - 13.4, "00.0")
c.drawCentredString(px(DMAX), AXIS - 13.4, "13.1")

# ---- V. apex annotation --------------------------------------------------
ax, ay = px(APEX_D), py(APEX_E)
c.setStrokeColor(ACCENT); c.setLineWidth(0.38); c.setDash(1.0, 2.4)
c.line(ax, ay + 4.4, ax, FY1 - 1.0); c.setDash()
c.setFillColor(PAPER); c.circle(ax, ay, 2.9, stroke=0, fill=1)
c.setFillColor(ACCENT); c.circle(ax, ay, 1.55, stroke=0, fill=1)
c.setFont("JuraL", 5.0); c.setFillColor(SOFT)
c.drawCentredString(ax, FY1 + 30.0, "A P E X")
c.setFont("Geist", 13.0); c.setFillColor(INK)
c.drawCentredString(ax, FY1 + 12.0, "6883")

# ---- VI. field frame + corner registration -------------------------------
c.setStrokeColor(INK); c.setLineWidth(0.42)
c.rect(FX0, FY0, FW, FH, stroke=1, fill=0)
c.setLineWidth(0.4); c.setStrokeColor(INK)
for (cx, cy) in ((FX0, FY0), (FX1, FY0), (FX0, FY1), (FX1, FY1)):
    c.line(cx - 5.4, cy, cx + 5.4, cy); c.line(cx, cy - 5.4, cx, cy + 5.4)

# ---- VII. typography -----------------------------------------------------
c.setFillColor(INK); c.setFont("Italiana", 38)
c.drawString(FX0, 754, "RAREFIED INDEX")
c.setFillColor(SOFT); c.setFont("JuraL", 7.0)
c.drawString(FX0 + 1.5, 739, "A T T E N U A T I O N   O F   A   M E D I U M   W I T H   D I S P L A C E M E N T")

c.setStrokeColor(INK); c.setLineWidth(0.5)
c.line(FX0, 727, FX1, 727)
c.setFillColor(SOFT); c.setFont("Geist", 5.8)
c.drawRightString(FX1, 757, "PLATE  I")
c.drawRightString(FX1, 747, "SER. 06883")

# left vertical caption
c.saveState(); c.translate(FX0 - 34, FY0); c.rotate(90)
c.setFillColor(SOFT); c.setFont("JuraL", 5.6)
c.drawString(0, 0, "D E N S I T Y   O F   M E D I U M   ( R E L A T I V E )")
c.restoreState()
c.saveState(); c.translate(FX1 + 13, FY0); c.rotate(90)
c.setFillColor(SOFT); c.setFont("Geist", 5.2)
c.drawString(0, 0, "OBS. 13.10 / STATIONS 07 / DELTA +651")
c.restoreState()

# ---- VIII. notation block ------------------------------------------------
NY = 214.0
c.setStrokeColor(INK); c.setLineWidth(0.5); c.line(FX0, NY + 34, FX1, NY + 34)
cols = [("DISPLACEMENT", "13.10"), ("APEX", "6883"), ("NET RISE", "+651"), ("STATIONS", "07")]
step = FW / 4.0
for k, (lab, val) in enumerate(cols):
    x = FX0 + k * step
    c.setFillColor(SOFT); c.setFont("JuraL", 5.4)
    c.drawString(x, NY + 22, " ".join(lab))
    c.setFillColor(ACCENT if k == 1 else INK); c.setFont("Geist", 15.5)
    c.drawString(x, NY, val)
    if k:
        c.setStrokeColor(FAINT); c.setLineWidth(0.3)
        c.line(x - 15, NY - 4, x - 15, NY + 27)

# ---- IX. the caption -----------------------------------------------------
c.setFillColor(INK); c.setFont("JuraL", 8.4)
c.drawCentredString(W / 2.0, 168, "A T T E N U A T I O N   I S   N O T   A B S E N C E")

# ---- X. foot register ----------------------------------------------------
c.setStrokeColor(FAINT); c.setLineWidth(0.35); c.line(FX0, 104, FX1, 104)
c.setFillColor(SOFT); c.setFont("Geist", 4.9)
c.drawString(FX0, 94, "R.I. / I")
c.drawCentredString(W / 2.0, 94, "GROUND \u00b7 INK \u00b7 ONE ACCENT")
c.drawRightString(FX1, 94, "SHEET 01 OF 01")
for k in range(41):
    x = FX0 + k * (FW / 40.0)
    h = 4.6 if k % 5 == 0 else 2.4
    c.setStrokeColor(SOFT if k % 5 == 0 else FAINT); c.setLineWidth(0.3)
    c.line(x, 104, x, 104 + h)

c.showPage(); c.save()
print("written:", OUT, os.path.getsize(OUT), "bytes")
