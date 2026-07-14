# FizzBuzz with Pure CSS

The markup is 100 empty `<li>`s. All of the computation happens in the
CSS engine during layout:

```css
.fizz-buzz {
    counter-reset: fizzbuzz;
}
.fizz-buzz > li::before {
    counter-increment: fizzbuzz;
    content: counter(fizzbuzz);
}
.fizz-buzz > li:nth-child(3n)::before {
    content: "Fizz";
}
.fizz-buzz > li:nth-child(5n)::before {
    content: "Buzz";
}
.fizz-buzz > li:nth-child(3n):nth-child(5n)::before {
    content: "FizzBuzz";
}
```

Three tricks stacked together:

- **A CSS counter is the loop variable.** Every `::before` increments
  `fizzbuzz` and renders it, so the empty list items number themselves.
- **`nth-child(3n)` / `nth-child(5n)` are the modulo.** The selector
  engine does the divisibility test; `:nth-child(3n):nth-child(5n)`
  is n % 15 == 0 by intersection.
- **Specificity is the branch.** All four rules match a multiple of 15,
  but the two-pseudo-class selector is most specific, so its `content`
  wins. Crucially the cascade resolves *per property*: the override rules
  only replace `content`, so `counter-increment` from the base rule still
  applies and the numbering doesn't skip.

The demo page (`index.html`) keeps the FizzBuzz rules in their own
`<style id="fizzbuzz-css">` block and mirrors it into a visible `<code>`
element with three lines of presentation-only JavaScript, so the slide
shows exactly the CSS that is running.

Based on [Lindsor's Pure CSS FizzBuzz codepen](https://codepen.io/Lindsor/pen/qdJMwK);
see also the [`ol` + `::before`/`::after` variant](https://www.trysmudford.com/blog/fizzbuzz-in-css/)
where FizzBuzz composes from separate Fizz and Buzz pseudo-elements.

## Run it

Open `index.html` in a browser. That's it — there's nothing to build
and nothing executes but the stylesheet.
