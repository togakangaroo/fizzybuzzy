# fizzybuzzy

Fun and unusual FizzBuzz implementations, collected for the talk
*Ranking FizzBuzz for Fun and Not Profit*.

## Approaches

- [`with-fonts/`](with-fonts/) — FizzBuzz as an OpenType font: the "program" is
  a `.ttf` and the "runtime" is your text renderer. GSUB substitution tables run
  a mod-3 state machine during text layout.
- [`with-waves/`](with-waves/) — FizzBuzz from zero crossings of two sine waves:
  sin(πn/3) and sin(πn/5) are zero exactly on multiples of 3 and 5. An animated
  page draws the curves and fills in a truth table as they cross each tick.
- [`with-turing-machine/`](with-turing-machine/) — FizzBuzz on a genuine
  single-tape Turing machine: 34 states, 421 rules. Counts in decimal on the
  tape, does mod 3 via the digit-sum trick and mod 5 via the last digit, and
  writes the answers to its own tape. Animated in-browser simulator with the
  head, state, and firing rules.
- [`with-css/`](with-css/) — FizzBuzz in pure CSS, two ways:
  [`css-counters/`](with-css/css-counters/) uses a CSS counter as the loop
  variable, `nth-child(3n)`/`nth-child(5n)` as the modulo, and selector
  specificity as the branch; [`ol-markers/`](with-css/ol-markers/) lets an
  `<ol>` do the counting and composes FizzBuzz from a ::before "Fizz" meeting an
  ::after "Buzz" — the word is never spelled out. The browser's style engine is
  the runtime.
- [`with-regex/`](with-regex/) — FizzBuzz as one regular expression with three
  named groups; whichever group matches is the answer, and the whole 1..100 run
  is a single `.replace()` call. Divisibility by 3 is a regular language — a
  3-state DFA over digit classes tracks the digit sum mod 3 — and state
  elimination flattens that DFA into the monster fizz branch. Animated demo
  walks the DFA digit by digit.
- [`with-x86/`](with-x86/) — FizzBuzz as a 512-byte x86 boot sector, no
  operating system anywhere: the BIOS jumps straight into it and it prints via
  the BIOS teletype interrupt. The "computer" is
  [v86](https://github.com/copy/v86), a PC emulator compiled to WebAssembly — so
  the demo page boots a whole machine in the tab.
- [`with-term-rewriting/`](with-term-rewriting/) — FizzBuzz written in C but
  executed by no C compiler: rewrite rules turn the source into legal EDN, the
  Clojure reader parses it for free, and tree rewrites run to a fixed point
  whose normal form is a Clojure program — which then evals. After aphyr's
  [Rewriting the Technical
  Interview](https://aphyr.com/posts/353-rewriting-the-technical-interview),
  ported to run entirely in-browser as ClojureScript via
  [Scittle](https://github.com/babashka/scittle). Animated demo steps through
  every rewrite.
- [`with-circuits/`](with-circuits/) — FizzBuzz on bare circuitry: no processor,
  no memory, no clock — 8 input wires, 10 LEDs, and 92 logic gates. Since 16 ≡ 1
  mod 3 and mod 5, one 4-bit adder folds the byte and two little gate clouds
  test divisibility; the number LEDs blank out whenever fizz or buzz fires, so
  the LEDs spell the full answer. Written in Verilog, synthesized by yosys,
  drawn by netlistsvg; the demo page re-evaluates the real netlist on every
  input and paints the live signal values onto the schematic.
- [`with-cycles/`](with-cycles/) — FizzBuzz with no modulo, no division, and no
  `if`: two free-running cycles of period 3 and 5 (`["", "", "fizz"]` and
  `["", "", "", "", "buzz"]`) are pulled once per tick, and
  `(fizz + buzz) || n` does the rest — the words collide into "fizzbuzz" every
  15 on their own. The whole program is a 3-line `cycle` generator and a
  one-line `yield`; the demo animates both cycles ticking in lockstep.
- [`with-racket-2d/`](with-racket-2d/) — FizzBuzz as a literal 2D table: Racket's
  `2d` language reads a decision table drawn in Unicode box characters, and
  `#2dmatch` dispatches on `(modulo n 5)` × `(modulo n 3)` — the program's
  decision table *is* its decision table. Runs for real via a 188 MB Alpine +
  Minimal Racket Docker image (`docker build -t fizzbuzz-racket-2d . && docker
  run --rm fizzbuzz-racket-2d`); the page shows the table and the captured run.
- [`with-lambda-calculus/`](with-lambda-calculus/) — FizzBuzz from
  single-argument arrow functions and nothing else, a JS translation of Tom
  Stuart's [Programming with
  Nothing](https://tomstu.art/programming-with-nothing). Church numerals, the Z
  combinator, and one ~11KB inlined expression.
- [`with-rockstar/`](with-rockstar/) — FizzBuzz as heavy-metal lyrics: Dylan
  Beattie's [Rockstar](https://codewithrockstar.com/) language, where "a
  lovestruck ladykiller" is the number 100 and modulo is a power ballad about
  repeated subtraction. The runtime is Rockstar's real interpreter — the .NET
  CLR compiled to WebAssembly — vendored gzipped (3.2 MB, down from 9.7) and
  inflated in-browser by a DecompressionStream as it loads.
- [`honorable-mentions/`](honorable-mentions/) — three from the collection that
  never got a from-scratch demo because they already live in someone else's
  runtime: FizzBuzz [encoded in TypeScript's type
  system](https://gal.hagever.com/posts/typing-the-technical-interview-in-typescript/),
  FizzBuzz [learned by a neural
  net](https://joelgrus.com/2016/05/23/fizz-buzz-in-tensorflow/), and the
  cursed [Enterprise
  Edition](https://github.com/EnterpriseQualityCoding/FizzBuzzEnterpriseEdition).
