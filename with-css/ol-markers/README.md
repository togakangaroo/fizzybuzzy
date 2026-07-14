# FizzBuzz with an Ordered List

The markup is an `<ol>` of 100 empty `<li>`s — the browser numbers them
for free — and the whole program is three rules:

```css
.fizz-buzz > li:nth-child(3n)::before {
    content: "Fizz";
}
.fizz-buzz > li:nth-child(5n)::after {
    content: "Buzz";
}
.fizz-buzz > li:nth-child(3n),
.fizz-buzz > li:nth-child(5n) {
    list-style: none;
}
```

What makes this variant charming:

- **The `<ol>` is the loop.** No counter to declare — ordered lists have
  numbered themselves since HTML 2.0. `list-style: none` hides the number
  on matches (it hides the marker, not the count — numbering continues).
- **`nth-child(3n)` / `nth-child(5n)` are the modulo**, same as the
  counter variant.
- **"FizzBuzz" is never written anywhere.** Fizz goes in `::before`,
  Buzz in `::after`, and on multiples of 15 both rules match the same
  empty `<li>`, so the two pseudo-elements sit adjacent and read
  "FizzBuzz". Composition instead of a third branch.

The demo page (`index.html`) keeps the FizzBuzz rules in their own
`<style id="fizzbuzz-css">` block and mirrors it into a visible `<code>`
element with three lines of presentation-only JavaScript, so the slide
shows exactly the CSS that is running.

Based on [Trys Mudford's FizzBuzz in CSS](https://www.trysmudford.com/blog/fizzbuzz-in-css/);
the sibling [`css-counters/`](../css-counters/) demo implements the
counter-and-override variant from
[Lindsor's codepen](https://codepen.io/Lindsor/pen/qdJMwK).

## Run it

Open `index.html` in a browser. That's it — there's nothing to build
and nothing executes but the stylesheet.
