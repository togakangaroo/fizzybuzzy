# fizzybuzzy

Fun and unusual FizzBuzz implementations, collected for the talk
*Ranking FizzBuzz for Fun and Not Profit*.

## Approaches

- [`with-fonts/`](with-fonts/) — FizzBuzz as an OpenType font: the
  "program" is a `.ttf` and the "runtime" is your text renderer. GSUB
  substitution tables run a mod-3 state machine during text layout.
