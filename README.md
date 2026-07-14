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
- [`with-css/`](with-css/) — FizzBuzz in pure CSS, two ways:
  [`css-counters/`](with-css/css-counters/) uses a CSS counter as the
  loop variable, `nth-child(3n)`/`nth-child(5n)` as the modulo, and
  selector specificity as the branch;
  [`ol-markers/`](with-css/ol-markers/) lets an `<ol>` do the counting
  and composes FizzBuzz from a ::before "Fizz" meeting an ::after
  "Buzz" — the word is never spelled out. The browser's style engine is
  the runtime.
- [`with-regex/`](with-regex/) — FizzBuzz as one regular expression
  with three named groups; whichever group matches is the answer, and
  the whole 1..100 run is a single `.replace()` call. Divisibility by 3
  is a regular language — a 3-state DFA over digit classes tracks the
  digit sum mod 3 — and state elimination flattens that DFA into the
  monster fizz branch. Animated demo walks the DFA digit by digit.
- [`with-lambda-calculus/`](with-lambda-calculus/) — FizzBuzz from
  single-argument arrow functions and nothing else, a JS translation of
  Tom Stuart's [Programming with Nothing](https://tomstu.art/programming-with-nothing).
  Church numerals, the Z combinator, and one ~11KB inlined expression.
