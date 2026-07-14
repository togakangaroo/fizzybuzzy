# FizzBuzz with Term Rewriting

FizzBuzz written in C and executed by no C compiler: a stack of rewrite
rules is applied to the source until no rule fires, and the **normal
form** happens to be a Clojure program. Evaluate that.

The approach is lovingly stolen from Kyle Kingsbury (aphyr)'s
[Rewriting the Technical Interview](https://aphyr.com/posts/353-rewriting-the-technical-interview),
which does it in Clojure on the JVM. This is a browser port: the whole
rewriter runs as ClojureScript interpreted in the page by
[Scittle](https://github.com/babashka/scittle) (SCI compiled to JS) —
no build step, no server, one HTML file.

## How it works

The trick is that C syntax is *almost* readable EDN. Three
character-level rewrites close the gap:

- `;` → `,` — the reader thinks `;` starts a comment, but commas are
  whitespace, so statement terminators cost nothing
- `{` `}` → `[` `]` — braces would read as map literals (even element
  counts, unique keys); vectors accept anything, so blocks become data

Then the Clojure reader parses the whole thing for free — `i++` is just
a funny symbol, `==` and `%` are symbols too — and tree-level rules
take over, applied leftmost-innermost to a fixed point:

1. `println(x)` → `(println x)` — symbol-followed-by-list is a C call
2. `i++` → `(++ i)` — crack open the funny symbol
3. `a ⊕ b` → `(⊕ a b)` — infix goes prefix
4. `else if` / `else` fold into pending `cond`s
5. `if` seeds a `cond`; `for` becomes `loop`/`recur`
6. vocabulary: `%` is `mod`, `==` is `=`, `++` is `inc`

No rule fires ⇒ normal form ⇒ it's Clojure now ⇒ eval. The rewriting
itself *is* the compiler.

Differences from the original post: aphyr does the rewriting at
macroexpansion time with `clojure.walk` inside a `c` macro, and leans
on JVM array-map ordering for the `else if` chains. Here the rewriter
is an ordinary function over quoted forms (so every intermediate term
can be rendered), the reader step works on a string instead of reader
syntax, and the `cond` folding uses explicit `elif`/`else*` nodes
instead of ordered maps.

## Files

- `index.html` — the demo: step or animate through all ~37 rewrite
  steps, with the firing rule explained, the rewritten subterm
  highlighted, and the final normal form evaluated into the usual
  1..100 grid. Everything, including the rewriter, is ClojureScript in
  a `<script type="application/x-scittle">` tag. Just open it in a
  browser (Scittle loads from cdnjs).
