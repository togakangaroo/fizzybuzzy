"""Shared glyph assembly for the FizzBuzz fonts.

Copies digit/letter outlines out of the vendored Fira Sans (OFL), builds the
Fizz/Buzz/FizzBuzz word glyphs as composites, and assembles a font with
fontTools FontBuilder. The GSUB logic is supplied per-font as FEA text.
"""

from pathlib import Path

from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SOURCE_FONT = ROOT / "assets" / "FiraSans-Regular.ttf"
DIST = ROOT / "dist"

DIGITS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
# printable ASCII, so the demo page can set whole sentences in the font
CHARSET = [chr(c) for c in range(0x20, 0x7F)]
WORDS = {
    "Fizz.word": ["F", "i", "z", "z"],
    "Buzz.word": ["B", "u", "z", "z"],
    "FizzBuzz.word": ["F", "i", "z", "z", "B", "u", "z", "z"],
}


def _copy_glyph(source: TTFont, name: str) -> tuple:
    """Return (glyph, advance) with the source outline decomposed to a simple glyph."""
    glyph_set = source.getGlyphSet()
    recording = DecomposingRecordingPen(glyph_set)
    glyph_set[name].draw(recording)
    pen = TTGlyphPen(None)
    recording.replay(pen)
    return pen.glyph(), source["hmtx"][name][0]


def _component(glyph_set, base: str, x_offset: int = 0):
    pen = TTGlyphPen(glyph_set)
    pen.addComponent(base, (1, 0, 0, 1, x_offset, 0))
    return pen.glyph()


def build_font(
    family_name: str,
    fea_text: str,
    extra_composites: dict[str, str] | None = None,
) -> TTFont:
    """Assemble a font.

    extra_composites maps new glyph names to the base glyph they alias
    (used by the real font for its 30 state-digit variants).
    """
    source = TTFont(SOURCE_FONT)
    upem = source["head"].unitsPerEm

    glyphs: dict = {}
    metrics: dict[str, tuple[int, int]] = {}

    # .notdef: empty box is fine for a demo font
    pen = TTGlyphPen(None)
    glyphs[".notdef"] = pen.glyph()
    metrics[".notdef"] = (500, 0)

    source_cmap = source.getBestCmap()
    char_to_glyph = {ch: source_cmap[ord(ch)] for ch in CHARSET if ord(ch) in source_cmap}
    for name in dict.fromkeys(char_to_glyph.values()):
        glyph, advance = _copy_glyph(source, name)
        glyphs[name] = glyph
        lsb = source["hmtx"][name][1]
        metrics[name] = (advance, lsb)

    for word, parts in WORDS.items():
        pen = TTGlyphPen(glyphs)
        x = 0
        for part in parts:
            pen.addComponent(part, (1, 0, 0, 1, x, 0))
            x += metrics[part][0]
        glyphs[word] = pen.glyph()
        metrics[word] = (x, metrics[parts[0]][1])

    # zero-width, zero-contour glyph used to erase interior digits
    pen = TTGlyphPen(None)
    glyphs["blank"] = pen.glyph()
    metrics["blank"] = (0, 0)

    for name, base in (extra_composites or {}).items():
        glyphs[name] = _component(glyphs, base)
        metrics[name] = metrics[base]

    glyph_order = list(glyphs.keys())

    fb = FontBuilder(upem, isTTF=True)
    fb.setupGlyphOrder(glyph_order)
    fb.setupCharacterMap({ord(ch): name for ch, name in char_to_glyph.items()})
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)

    hhea = source["hhea"]
    os2 = source["OS/2"]
    fb.setupHorizontalHeader(ascent=hhea.ascent, descent=hhea.descent)
    fb.setupOS2(
        sTypoAscender=os2.sTypoAscender,
        sTypoDescender=os2.sTypoDescender,
        sTypoLineGap=os2.sTypoLineGap,
        usWinAscent=os2.usWinAscent,
        usWinDescent=os2.usWinDescent,
    )
    fb.setupNameTable(
        {
            "familyName": family_name,
            "styleName": "Regular",
            "fullName": family_name,
            "psName": family_name.replace(" ", ""),
            "licenseDescription": (
                "Outlines derived from Fira Sans (c) The Mozilla Foundation "
                "and Telefonica S.A., licensed under the SIL Open Font License 1.1. "
                "See assets/OFL.txt."
            ),
        }
    )
    fb.setupPost()

    addOpenTypeFeaturesFromString(fb.font, fea_text)
    return fb.font


def save(font: TTFont, basename: str) -> None:
    DIST.mkdir(exist_ok=True)
    ttf = DIST / f"{basename}.ttf"
    font.save(ttf)
    font.flavor = "woff2"
    font.save(DIST / f"{basename}.woff2")
    font.flavor = None
    print(f"wrote {ttf} and {ttf.with_suffix('.woff2')}")
