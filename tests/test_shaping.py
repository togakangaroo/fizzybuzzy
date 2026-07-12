"""Shape strings through the built fonts with HarfBuzz and check the fonts
actually compute FizzBuzz. Run `uv run python real/build.py` and
`uv run python cheat/build.py` first (or rely on the session fixture below).
"""

import subprocess
import sys
from functools import cache
from pathlib import Path

import pytest
import uharfbuzz as hb

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
DIGIT_NAMES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"]
NAME_TO_DIGIT = {name: str(i) for i, name in enumerate(DIGIT_NAMES)}


def fizzbuzz(n: int) -> str:
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return str(n)


@pytest.fixture(scope="session", autouse=True)
def built_fonts():
    for script in ("cheat/build.py", "real/build.py"):
        subprocess.run([sys.executable, ROOT / script], check=True, cwd=ROOT)


@cache
def load_font(basename: str) -> hb.Font:
    blob = hb.Blob.from_file_path(DIST / f"{basename}.ttf")
    return hb.Font(hb.Face(blob))


def shape(basename: str, text: str, features: dict | None = None) -> list[str]:
    """Return the shaped glyph-name sequence for text."""
    font = load_font(basename)
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, features)
    return [font.glyph_to_string(info.codepoint) for info in buf.glyph_infos]


def decode(glyph_names: list[str]) -> str:
    """Turn shaped glyph names back into the text a reader would see."""
    out = []
    for name in glyph_names:
        if name == "blank":
            continue
        if name == "space":
            out.append(" ")
        elif name.endswith(".word"):
            out.append(name.removesuffix(".word"))
        else:
            base = name.split(".")[0]  # strip .s0/.s1/.s2 state suffixes
            out.append(NAME_TO_DIGIT.get(base, name))
    return "".join(out)


# ---------------------------------------------------------------- real font


def test_real_exhaustive_sweep():
    for n in range(0, 1001):
        assert decode(shape("FizzBuzz", str(n))) == fizzbuzz(n), f"n={n}"


def test_real_multiple_numbers_space_separated():
    text = " ".join(str(n) for n in range(1, 101))
    expected = " ".join(fizzbuzz(n) for n in range(1, 101))
    assert decode(shape("FizzBuzz", text)) == expected


def test_real_newline_separated():
    # newlines split shaping runs anyway; shape line by line like a renderer
    for line in ["3", "5", "14", "15"]:
        assert decode(shape("FizzBuzz", line)) == fizzbuzz(int(line))


def test_real_leading_zeros():
    assert decode(shape("FizzBuzz", "03")) == "Fizz"
    assert decode(shape("FizzBuzz", "015")) == "FizzBuzz"
    assert decode(shape("FizzBuzz", "007")) == "007"


def test_real_big_numbers():
    for n in [999999999999, 999999999990, 123456789012, 314159265358]:
        assert decode(shape("FizzBuzz", str(n))) == fizzbuzz(n), f"n={n}"


def test_real_13_digit_cap():
    # beyond 12 digits the BLANK pass runs out of rules: verdict is still
    # correct but leading digits survive. Documented limitation.
    got = decode(shape("FizzBuzz", "9999999999995"))  # 13 digits, div by 5
    assert got.endswith("Buzz")


def test_real_blanks_are_zero_width():
    font = load_font("FizzBuzz")
    buf = hb.Buffer()
    buf.add_str("15")
    buf.guess_segment_properties()
    hb.shape(font, buf)
    widths = {
        font.glyph_to_string(i.codepoint): p.x_advance
        for i, p in zip(buf.glyph_infos, buf.glyph_positions)
    }
    assert widths["blank"] == 0


def test_real_calt_off_leaves_plain_digits():
    assert shape("FizzBuzz", "15", {"calt": False}) == ["one", "five"]


# --------------------------------------------------------------- cheat font


def test_cheat_sweep_1_to_100():
    for n in range(1, 101):
        assert decode(shape("FizzBuzzCheat", str(n))) == fizzbuzz(n), f"n={n}"


def test_cheat_gives_up_past_100():
    for n in [105, 115, 150, 210, 3000]:
        assert decode(shape("FizzBuzzCheat", str(n))) == str(n), f"n={n}"


def test_cheat_multiple_numbers():
    text = " ".join(str(n) for n in range(1, 21))
    expected = " ".join(fizzbuzz(n) for n in range(1, 21))
    assert decode(shape("FizzBuzzCheat", text)) == expected
