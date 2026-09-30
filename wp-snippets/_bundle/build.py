"""Rebuild homepage.css / homepage.js from the snippet folders. Run: python3 wp-snippets/_bundle/build.py"""
import pathlib, datetime
W = pathlib.Path(__file__).resolve().parent.parent
ORDER = ["sfhm-desktop-dropdowns", "sfhm-why-santa-fe", "sfhm-race-cards-calm", "sfhm-kids-fun-run", "sfhm-photo-gallery"]
stamp = "SFHM HOMEPAGE BUNDLE " + datetime.date.today().isoformat()
note = "Do not edit here; edit the source folder and rebuild (wp-snippets/_bundle/build.py)."
css = [f"/* {stamp} -- built from each snippet folder style.css. {note} */\n"]
js = [f"/* {stamp} -- built from each snippet folder script.js. {note} Each part below is self-contained. */\n"]
for n in ORDER:
    c, j = W / n / "style.css", W / n / "script.js"
    if c.exists(): css.append(f"\n/* ===== {n} ===== */\n" + c.read_text())
    if j.exists(): js.append(f"\n/* ===== {n} ===== */\n" + j.read_text())
(W / "_bundle/homepage.css").write_text("".join(css))
(W / "_bundle/homepage.js").write_text("".join(js))
print("built", len("".join(css)), "bytes css,", len("".join(js)), "bytes js")

# One-paste version for Elementor > Custom Code (location: </body> end, condition: Front Page).
el = (f"<!-- {stamp}: Elementor Custom Code, location </body> end, condition Front Page. {note} -->\n"
      "<style id=\"sfhm-homepage-bundle\">\n" + "".join(css) + "\n</style>\n"
      "<script id=\"sfhm-homepage-bundle-js\">\n" + "".join(js) + "\n</script>\n")
(W / "_bundle/homepage-elementor.html").write_text(el)
print("built homepage-elementor.html", len(el), "bytes")
