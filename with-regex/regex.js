// FizzBuzz as a single regular expression, from
// https://gist.github.com/quackbarc/a24d5f7473cee2e44a4fef83288d0f45
//
// Divisibility by 3 of a decimal string is a regular language: a 3-state
// DFA tracks the digit sum mod 3 ([0369] stays put, [147] advances one,
// [258] advances two). State-eliminating that DFA yields the fizz group.
// The fizzbuzz group is the same construction on the product automaton
// for "divisible by 3 AND ends in 0 or 5". Buzz is just \d*[05].
//
// Alternation order matters: fizzbuzz must be tried first, and the
// trailing \b forces each branch to consume the whole number.

const FIZZBUZZ_SRC =
  "(?<fizzbuzz>(?:(?:[369]|[258][0369]*[147]|(?:[147]|[258][0369]*[258])(?:[0369]|[147][0369]*[258])*(?:[28]|[147][0369]*[147]))*(?:0|(?:[147]|[258][0369]*[258])(?:[0369]|[147][0369]*[258])*5))+)";
const BUZZ_SRC = "(?<buzz>\\d*[05])";
const FIZZ_SRC =
  "(?<fizz>(?:[0369]|[258][0369]*[147]|(?:[147]|[258][0369]*[258])(?:[0369]|[147][0369]*[258])*(?:[258]|[147][0369]*[147]))+)";

const SRC = `\\b(?:${FIZZBUZZ_SRC}|${BUZZ_SRC}|${FIZZ_SRC})\\b`;

// The entire FizzBuzz "program": one call to String.prototype.replace.
const fizzbuzz = (s) =>
  s.replace(new RegExp(SRC, "g"), (match, ...rest) => {
    const g = rest.at(-1); // named-groups object is the replacer's last arg
    return g.fizzbuzz !== undefined ? "FizzBuzz"
         : g.buzz     !== undefined ? "Buzz"
         : "Fizz";
  });

const parts = { FIZZBUZZ_SRC, BUZZ_SRC, FIZZ_SRC, SRC };

if (typeof module !== "undefined") module.exports = { fizzbuzz, parts };
