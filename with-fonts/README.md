# FizzBuzz as a Font

FizzBuzz where the "program" is a `.ttf` and the "runtime" is your text
renderer. Type `1 2 3 4 5 ... 15` in this font and the text engine renders
`1 2 Fizz 4 Buzz ... FizzBuzz`. No JavaScript, no preprocessing — the
computation happens inside OpenType glyph substitution (GSUB) during layout.

Inspired by [Litherum's addition font](https://litherum.blogspot.com/2019/03/addition-font.html),
which showed GSUB contextual lookups can do real computation. The addition
font needed a patched HarfBuzz (addition requires unbounded carry
propagation, i.e. recursion). FizzBuzz has a nicer property: **it's a
regular language**, so it runs in stock, unmodified renderers — every
browser, TextEdit, Keynote.

## Why FizzBuzz is font-computable

- **Divisible by 5** ⇔ the last digit is `0` or `5`. Trivial.
- **Divisible by 3** ⇔ the digit sum ≡ 0 (mod 3). That's a 3-state
  finite-state machine reading digits left to right.

A DFA is exactly what GSUB chained contextual substitution (lookup type 6)
can express: within a lookup, the *backtrack* context matches glyphs that
have **already been substituted**, so state written at position *i−1* is
readable at position *i*.

## The two fonts

### `cheat/` — FizzBuzz Cheat

47 hardcoded substitutions, one per qualifying number from 1–100
(`sub one five by FizzBuzz.word;`). A contextual wrapper keeps rules from
firing mid-number, which means anything over 100 simply stops working.
It's a lookup table wearing a font's clothing. Show this one first.

### `real/` — FizzBuzz

The genuine article. Three lookups run in sequence in the `calt` feature
(see [`real/features.fea`](real/features.fea)):

1. **STATE** — each digit is replaced by one of 30 variants
   `zero.s0 … nine.s2`, where `.sK` means "running digit sum ≡ K (mod 3),
   including this digit". Nine transition rules key on the previous digit's
   state variant in the backtrack; three fallback rules start a new number.
   The variants are composite glyphs of the plain digits, so they render
   identically — a number divisible by neither 3 nor 5 just *is* its digits.
2. **CLASSIFY** — a state digit not followed by another state digit is the
   last digit of its number, and its glyph alone holds the verdict:
   `zero.s0`/`five.s0` → `FizzBuzz.word`, other `.s0` → `Fizz.word`,
   `zero`/`five` with `.s1`/`.s2` → `Buzz.word`.
3. **BLANK** — the remaining digits of any converted number are replaced
   with a zero-width blank glyph. OpenType contexts are fixed-length, so
   there's one rule per distance-to-word, capping numbers at 12 digits
   (FizzBuzz up to 999,999,999,999 — beyond that the verdict is still
   right but leading digits survive).

An unbounded alternative exists — reverse chaining substitution (GSUB
type 8) processed right-to-left would blank arbitrarily long numbers —
but it's the one lookup type with meaningful cross-renderer risk, so this
repo ships the bounded version.

## Building

Requires [uv](https://docs.astral.sh/uv/). Outlines are subset from the
vendored [Fira Sans](https://github.com/mozilla/Fira) (SIL OFL, see
`assets/OFL.txt`).

```sh
uv run cheat/build.py   # dist/FizzBuzzCheat.{ttf,woff2}
uv run real/build.py    # dist/FizzBuzz.{ttf,woff2}
uv run pytest           # shapes 0–1000 through HarfBuzz and checks the math
```

## Demo

```sh
# from this directory (with-fonts/)
uv run python -m http.server
# open http://localhost:8000/demo/ligatures.html and /demo/opentype.html
```

One live-editable page per font ([`demo/ligatures.html`](demo/ligatures.html),
[`demo/opentype.html`](demo/opentype.html)), each with a checkbox that sets
`font-feature-settings: "calt" 0` to reveal the plain digits underneath
and a "Count to 100" button for the talk.

[`demo/opentype.html`](demo/opentype.html) also has a "How it works" section
below the live editor that animates the real font's computation: it steps a
JavaScript re-implementation of the three lookups over the glyph buffer,
showing each rule as it fires — the digit tiles pick up their
`.s0`/`.s1`/`.s2` state colors (with the backtrack glyph highlighted, since
reading already-substituted state is the whole trick), the last digit turns
into the word glyph, and the leftovers blank out — alongside a live DFA
diagram.
The `.ttf` files also install fine in Font Book for a TextEdit/Keynote demo.

## Debugging tricks

```sh
hb-shape dist/FizzBuzz.ttf "15"            # [blank|FizzBuzz.word]
hb-shape dist/FizzBuzz.ttf "16"            # [one.s1|six.s1] — state visible!
hb-shape --debug dist/FizzBuzz.ttf "15"    # watch the lookups fire
ttx -t GSUB -o - dist/FizzBuzz.ttf         # dump the compiled tables
```
