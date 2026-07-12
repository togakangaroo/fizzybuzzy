"""The 'cheat' FizzBuzz font: one hardcoded rule per number from 1 to 100.

No computation whatsoever -- just a 47-entry lookup table baked into GSUB
substitutions. A contextual wrapper keeps rules from firing mid-number
(so "16" stays "16" instead of becoming "1Fizz"), which means numbers
over 100 simply... stop working. That's the joke.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from common.glyphbuild import DIGITS, build_font, save


def fizzbuzz_word(n: int) -> str | None:
    if n % 15 == 0:
        return "FizzBuzz"
    if n % 3 == 0:
        return "Fizz"
    if n % 5 == 0:
        return "Buzz"
    return None


def make_fea() -> str:
    by_length: dict[int, list[str]] = {1: [], 2: [], 3: []}
    for n in range(1, 101):
        word = fizzbuzz_word(n)
        if word:
            glyph_seq = " ".join(DIGITS[int(d)] for d in str(n))
            by_length[len(str(n))].append(f"    sub {glyph_seq} by {word}.word;")

    lig_lookups = "\n".join(
        f"lookup LIG{length} {{\n" + "\n".join(rules) + f"\n}} LIG{length};"
        for length, rules in by_length.items()
    )

    return f"""\
@digit = [{' '.join(DIGITS)}];

{lig_lookups}

feature calt {{
  lookup CHEAT {{
    # a digit preceded by a digit is mid-number: never start a match there
    ignore sub @digit @digit';
    # 4+ digit numbers: not in the table, leave untouched
    ignore sub @digit' @digit @digit @digit;
    sub one' lookup LIG3 zero zero;
    ignore sub @digit' @digit @digit;
    sub @digit' lookup LIG2 @digit;
    ignore sub @digit' @digit;
    sub @digit' lookup LIG1;
  }} CHEAT;
}} calt;
"""


if __name__ == "__main__":
    font = build_font("FizzBuzz Cheat", make_fea())
    save(font, "FizzBuzzCheat")
