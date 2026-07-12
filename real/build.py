"""The real FizzBuzz font: a mod-3 state machine in GSUB chained contextual
substitution. See features.fea -- that's where FizzBuzz actually happens.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from common.glyphbuild import DIGITS, build_font, save

HERE = Path(__file__).resolve().parent

# 30 state-carrying digit variants; visually identical composites of the
# base digits, so non-qualifying numbers render unchanged.
STATE_DIGITS = {f"{d}.s{k}": d for d in DIGITS for k in range(3)}

if __name__ == "__main__":
    fea = (HERE / "features.fea").read_text()
    font = build_font("FizzBuzz", fea, extra_composites=STATE_DIGITS)
    save(font, "FizzBuzz")
