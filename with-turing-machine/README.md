# FizzBuzz with a Turing Machine

A genuine single-tape Turing machine — 34 states, 421 rules of
`(state, symbol) → (write, move, state)` — that counts upward in decimal
and writes FizzBuzz to its own tape.

(The blog post that inspired this — code-cop's [von Neumann Turing
machine](https://blog.code-cop.org/2025/09/von-neumann-turing-machine.html)
— builds the primitives but never published the actual FizzBuzz machine,
so this one is designed from scratch.)

## Tape layout

```
_ <counter digits, decimal> # <output entries, separated by .>
```

e.g. after a while the tape reads
`16#1.2.Fizz.4.Buzz.Fizz.7.8.Fizz.Buzz.11.Fizz.13.14.FizzBuzz.`

## How it works

Each iteration:

1. **Increment** — `carry` walks left from the last counter digit doing
   decimal carry; a carry past the left end writes a new leading `1`.
2. **Divisible by 3?** — the digit-sum trick. The head scans the digits
   left-to-right while the *state* cycles mod 3 (`m0 → m1 → m2 → m0…`,
   advancing by each digit's value). Whichever state it's in at the `#`
   is `n mod 3`.
3. **Divisible by 5?** — only the last digit matters: `0` or `5`.
4. **Branch** — Fizz/Buzz/FizzBuzz runs to the right end of the tape and
   writes the letters one state at a time. Otherwise the counter is copied
   to the output digit-by-digit: each copied digit gets marked (`3 → 3'`)
   so the machine can find its place when it comes back, carrying the
   digit's value in the state (`cp0`–`cp9`). The marks are erased by the
   next increment pass.
5. Write a `.` separator, walk back to the counter, go to 1.

The machine never halts — it will happily FizzBuzz forever. Stopping at
100 is a decision the *simulator* makes, which is the closest FizzBuzz
gets to a Halting Problem joke.

## Files

- `machine.js` — the transition table and a ~20-line simulator. Works
  from both the browser and node.
- `index.html` — animated demo: the tape with the head, the current
  state, the full program with each firing rule highlighted, and the
  decoded output. Just open it in a browser.
- `test.js` — `node test.js` runs the machine until 100 entries are on
  the tape (~84,000 steps) and checks them against reference FizzBuzz.
