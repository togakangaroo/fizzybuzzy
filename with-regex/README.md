# FizzBuzz with a Regex

FizzBuzz as a single regular expression with three named groups —
whichever group matches *is* the answer. The whole program is one
`.replace()` call: `"1 2 3 … 100"` goes in, FizzBuzz comes out.

Regex by [quackbarc](https://gist.github.com/quackbarc/a24d5f7473cee2e44a4fef83288d0f45).

## Why this is even possible

"Is this decimal string divisible by 3?" is a *regular language*. A
3-state DFA reads the digits left to right and tracks the digit sum
mod 3:

- `[0369]` — stay in the current state (+0)
- `[147]` — advance one state (+1)
- `[258]` — advance two states (+2)

Accept if the walk ends back at ≡0. Kleene's theorem says every DFA can
be flattened into a regular expression by **state elimination** (rip out
a state, splice its in-edges to its out-edges, and the loop on it
becomes a `*`). Do that and you get the `fizz` group.

The three branches:

- `(?<fizzbuzz>…)` — the same construction on the product automaton for
  "divisible by 3 AND ends in `[05]`", i.e. divisible by 15
- `(?<buzz>\d*[05])` — divisibility by 5 is just the last digit
- `(?<fizz>…)` — the state-eliminated mod-3 DFA

Two load-bearing details: regex alternation is *ordered*, so `fizzbuzz`
gets first refusal before the other branches can claim a multiple of 15;
and the trailing `\b` means a branch can't quietly match a prefix — it
swallows the whole number or fails.

## Files

- `regex.js` — the regex (split into its three branches) and the
  one-`.replace()` driver. Works from both the browser and node.
- `index.html` — animated demo: the color-coded regex with the winning
  branch highlighted, the mod-3 DFA walking the digits of each number,
  the last-digit check, and the output grid. Just open it in a browser.
- `test.js` — `node test.js` checks 1..10,000 through the single
  `.replace()` call, plus each branch anchored on its own against
  1..1,000.
