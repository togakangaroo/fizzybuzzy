# FizzBuzz with nothing

FizzBuzz built from **single-argument arrow functions and nothing else** — a
JavaScript translation of Tom Stuart's
[Programming with Nothing](https://tomstu.art/programming-with-nothing)
(originally Ruby procs). No numbers, strings, booleans, arrays, operators,
`if`, or named recursion appear anywhere in the program: they are all encoded
as functions.

## The encodings

| Concept | Encoding |
|---|---|
| number *n* | Church numeral: `f => x => f(f(…f(x)))` — apply `f` to `x`, *n* times |
| true / false | `x => y => x` / `x => y => y` — a boolean *is* the choice, so `IF = b => b` |
| pair | `x => y => f => f(x)(y)` |
| list | nested pairs `[is_empty, [first, rest]]` |
| string | list of characters; a character is a numeral indexing `"0123456789BFiuz"` |
| recursion | the Z combinator (the eager-evaluation variant of Y) |

Arithmetic falls out of the numeral encoding (`ADD(m)(n) = n(INCREMENT)(m)`),
`MOD`/`DIV` are repeated subtraction via Z, lists get `RANGE`, `FOLD`, `MAP`,
and number-to-string conversion is `TO_DIGITS` (recursive div-10/mod-10).
The finished program is a Church-encoded list of one hundred Church-encoded
strings.

## Files

- `fizzbuzz.js` — the program, with named definitions for readability
- `decode.js` — the escape hatch: converts Church-encoded values back to real
  JS integers/booleans/arrays/strings so we can look at them (used only by
  tests and the demo, never by the program)
- `inline.js` — mechanically substitutes every name away, proving the
  `const`s are mere abbreviation; writes `dist/fizzbuzz-nothing.js`, the
  whole program as **one ~11KB expression** you can paste into a console
- `demo/index.html` — demo page for the talk
- `test.js` — verifies the numerals, arithmetic, and the full 1–100 sweep
  against a reference FizzBuzz, for both the named and inlined versions

## Running it

```sh
node --test test.js        # everything, incl. regenerating the inlined version
node inline.js             # just regenerate dist/fizzbuzz-nothing.js
python3 -m http.server     # then open http://localhost:8000/demo/
```

Or in a Node REPL:

```js
const { FIZZBUZZ } = await import('./fizzbuzz.js');
const { toArray, toString } = await import('./decode.js');
toArray(FIZZBUZZ).map(toString).join('\n');
```

## Talk notes

- Ruby's `-> x { … }` maps one-to-one onto JS's `x => …`, so this stays
  faithful to the article — same definitions, same names, same
  wisdom-tooth-trick `DECREMENT`.
- Both Ruby and JS are eagerly evaluated, so the recursive branches of
  `MOD`/`DIV`/`RANGE`/`FOLD` are wrapped in `x => …(x)` (eta-expansion) to
  delay them; in a lazy language the plain Y combinator would do.
- JS is actually a *nicer* host than Ruby here: currying is the default
  calling convention, so it's `ADD(TWO)(THREE)` instead of
  `ADD[TWO][THREE]`.
