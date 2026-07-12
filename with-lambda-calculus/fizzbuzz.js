// FizzBuzz in the lambda calculus — a JavaScript translation of Tom Stuart's
// "Programming with Nothing" (https://tomstu.art/programming-with-nothing).
//
// The rules: every value in this file is built from single-argument arrow
// functions and nothing else. No numbers, no strings, no booleans, no arrays,
// no operators, no recursion by name. `const NAME = ...` is only an
// abbreviation — inline.js mechanically substitutes every name away to prove
// it (see dist/fizzbuzz-nothing.js).
//
// JS's `x => y` is a direct analog of Ruby's `-> x { y }`, so the translation
// is nearly one-to-one with the article.

// ---------------------------------------------------------------------------
// Numbers (Church numerals): the number n is "apply f to x, n times"
// ---------------------------------------------------------------------------

export const ZERO = f => x => x;
export const ONE = f => x => f(x);
export const TWO = f => x => f(f(x));
export const THREE = f => x => f(f(f(x)));

export const INCREMENT = n => f => x => f(n(f)(x));

// The famous "wisdom tooth trick": counts n applications but drops the first.
export const DECREMENT = n => f => x =>
  n(g => h => h(g(f)))(y => x)(y => y);

export const ADD = m => n => n(INCREMENT)(m);
export const SUBTRACT = m => n => n(DECREMENT)(m);
export const MULTIPLY = m => n => n(ADD(m))(ZERO);
export const POWER = m => n => n(MULTIPLY(m))(ONE);

export const FIVE = ADD(TWO)(THREE);
export const NINE = MULTIPLY(THREE)(THREE);
export const TEN = MULTIPLY(TWO)(FIVE);
export const FIFTEEN = MULTIPLY(THREE)(FIVE);
export const HUNDRED = MULTIPLY(TEN)(TEN);

// ---------------------------------------------------------------------------
// Booleans: a boolean is a function that chooses between two options
// ---------------------------------------------------------------------------

export const TRUE = x => y => x;
export const FALSE = x => y => y;

// A Church boolean already does the choosing, so IF is just identity.
export const IF = b => b;

export const IS_ZERO = n => n(x => FALSE)(TRUE);
export const IS_LESS_OR_EQUAL = m => n => IS_ZERO(SUBTRACT(m)(n));

// ---------------------------------------------------------------------------
// Pairs
// ---------------------------------------------------------------------------

export const PAIR = x => y => f => f(x)(y);
export const LEFT = p => p(x => y => x);
export const RIGHT = p => p(x => y => y);

// ---------------------------------------------------------------------------
// Recursion: the Z combinator (Y's strict-evaluation cousin)
// ---------------------------------------------------------------------------

export const Z = f =>
  (x => f(y => x(x)(y)))(x => f(y => x(x)(y)));

// MOD and DIV by repeated subtraction. The `x => ...(x)` wrappers delay
// evaluation of the recursive branch — JS, like Ruby, is eagerly evaluated,
// so without them IF would evaluate both branches and never terminate.
export const MOD = Z(f => m => n =>
  IF(IS_LESS_OR_EQUAL(n)(m))(x =>
    f(SUBTRACT(m)(n))(n)(x)
  )(
    m
  ));

export const DIV = Z(f => m => n =>
  IF(IS_LESS_OR_EQUAL(n)(m))(x =>
    INCREMENT(f(SUBTRACT(m)(n))(n))(x)
  )(
    ZERO
  ));

// ---------------------------------------------------------------------------
// Lists: nested pairs [is_empty, [first, rest]]
// ---------------------------------------------------------------------------

export const EMPTY = PAIR(TRUE)(TRUE);
export const UNSHIFT = l => x => PAIR(FALSE)(PAIR(x)(l));
export const IS_EMPTY = LEFT;
export const FIRST = l => LEFT(RIGHT(l));
export const REST = l => RIGHT(RIGHT(l));

export const RANGE = Z(f => m => n =>
  IF(IS_LESS_OR_EQUAL(m)(n))(x =>
    UNSHIFT(f(INCREMENT(m))(n))(m)(x)
  )(
    EMPTY
  ));

export const FOLD = Z(f => l => x => g =>
  IF(IS_EMPTY(l))(
    x
  )(y =>
    g(f(REST(l))(x)(g))(FIRST(l))(y)
  ));

export const MAP = k => f =>
  FOLD(k)(EMPTY)(l => x => UNSHIFT(l)(f(x)));

export const PUSH = l => x =>
  FOLD(l)(UNSHIFT(EMPTY)(x))(UNSHIFT);

// ---------------------------------------------------------------------------
// Strings: lists of characters, with the 15-character alphabet
// "0123456789BFiuz" — a character is just its Church-numeral index
// ---------------------------------------------------------------------------

export const B = TEN;
export const F = INCREMENT(B);
export const I = INCREMENT(F);
export const U = INCREMENT(I);
export const ZED = INCREMENT(U);

export const FIZZ =
  UNSHIFT(UNSHIFT(UNSHIFT(UNSHIFT(EMPTY)(ZED))(ZED))(I))(F);
export const BUZZ =
  UNSHIFT(UNSHIFT(UNSHIFT(UNSHIFT(EMPTY)(ZED))(ZED))(U))(B);
export const FIZZBUZZ_WORD =
  UNSHIFT(UNSHIFT(UNSHIFT(UNSHIFT(BUZZ)(ZED))(ZED))(I))(F);

// A number's decimal digits, most significant first.
export const TO_DIGITS = Z(f => n =>
  PUSH(
    IF(IS_LESS_OR_EQUAL(n)(NINE))(
      EMPTY
    )(x =>
      f(DIV(n)(TEN))(x)
    )
  )(MOD(n)(TEN)));

// ---------------------------------------------------------------------------
// The program: a list of one hundred strings
// ---------------------------------------------------------------------------

export const FIZZBUZZ =
  MAP(RANGE(ONE)(HUNDRED))(n =>
    IF(IS_ZERO(MOD(n)(FIFTEEN)))(
      FIZZBUZZ_WORD
    )(IF(IS_ZERO(MOD(n)(THREE)))(
      FIZZ
    )(IF(IS_ZERO(MOD(n)(FIVE)))(
      BUZZ
    )(
      TO_DIGITS(n)
    ))));
