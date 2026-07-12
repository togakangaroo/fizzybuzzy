# fizzybuzzy

Fun and unusual FizzBuzz implementations, collected for the talk
*Ranking FizzBuzz for Fun and Not Profit*.

## Approaches

- [`with-fonts/`](with-fonts/) — FizzBuzz as an OpenType font: the
  "program" is a `.ttf` and the "runtime" is your text renderer. GSUB
  substitution tables run a mod-3 state machine during text layout.
- [`with-waves/`](with-waves/) — FizzBuzz from zero crossings of two
  sine waves: sin(πn/3) and sin(πn/5) are zero exactly on multiples of
  3 and 5. An animated page draws the curves and fills in a truth
  table as they cross each tick.
- [`with-turing-machine/`](with-turing-machine/) — FizzBuzz on a genuine
  single-tape Turing machine: 34 states, 421 rules. Counts in decimal on
  the tape, does mod 3 via the digit-sum trick and mod 5 via the last
  digit, and writes the answers to its own tape. Animated in-browser
  simulator with the head, state, and firing rules.
- [`with-lambda-calculus/`](with-lambda-calculus/) — FizzBuzz from
  single-argument arrow functions and nothing else, a JS translation of
  Tom Stuart's [Programming with Nothing](https://tomstu.art/programming-with-nothing).
  Church numerals, the Z combinator, and one ~11KB inlined expression.
