// Run with: node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  ZERO, ONE, TWO, THREE, FIVE, NINE, TEN, FIFTEEN, HUNDRED,
  INCREMENT, DECREMENT, ADD, SUBTRACT, MULTIPLY, POWER,
  TRUE, FALSE, IS_ZERO, IS_LESS_OR_EQUAL,
  MOD, DIV, RANGE, TO_DIGITS, FIZZBUZZ,
} from './fizzbuzz.js';
import { toInteger, toBoolean, toArray, toString } from './decode.js';

const here = dirname(fileURLToPath(import.meta.url));

const referenceFizzBuzz = n =>
  n % 15 === 0 ? 'FizzBuzz'
  : n % 3 === 0 ? 'Fizz'
  : n % 5 === 0 ? 'Buzz'
  : String(n);

const expected = Array.from({ length: 100 }, (_, i) =>
  referenceFizzBuzz(i + 1)
);

test('church numerals decode to the right integers', () => {
  assert.equal(toInteger(ZERO), 0);
  assert.equal(toInteger(ONE), 1);
  assert.equal(toInteger(TWO), 2);
  assert.equal(toInteger(THREE), 3);
  assert.equal(toInteger(FIVE), 5);
  assert.equal(toInteger(NINE), 9);
  assert.equal(toInteger(TEN), 10);
  assert.equal(toInteger(FIFTEEN), 15);
  assert.equal(toInteger(HUNDRED), 100);
});

test('arithmetic', () => {
  assert.equal(toInteger(INCREMENT(FIVE)), 6);
  assert.equal(toInteger(DECREMENT(FIVE)), 4);
  assert.equal(toInteger(DECREMENT(ZERO)), 0);
  assert.equal(toInteger(ADD(NINE)(FIVE)), 14);
  assert.equal(toInteger(SUBTRACT(NINE)(FIVE)), 4);
  assert.equal(toInteger(SUBTRACT(FIVE)(NINE)), 0);
  assert.equal(toInteger(MULTIPLY(NINE)(FIVE)), 45);
  assert.equal(toInteger(POWER(THREE)(THREE)), 27);
});

test('booleans and comparison', () => {
  assert.equal(toBoolean(TRUE), true);
  assert.equal(toBoolean(FALSE), false);
  assert.equal(toBoolean(IS_ZERO(ZERO)), true);
  assert.equal(toBoolean(IS_ZERO(THREE)), false);
  assert.equal(toBoolean(IS_LESS_OR_EQUAL(THREE)(FIVE)), true);
  assert.equal(toBoolean(IS_LESS_OR_EQUAL(FIVE)(FIVE)), true);
  assert.equal(toBoolean(IS_LESS_OR_EQUAL(NINE)(FIVE)), false);
});

test('mod and div', () => {
  assert.equal(toInteger(MOD(FIFTEEN)(TEN)), 5);
  assert.equal(toInteger(MOD(FIFTEEN)(THREE)), 0);
  assert.equal(toInteger(DIV(FIFTEEN)(TEN)), 1);
  assert.equal(toInteger(DIV(HUNDRED)(TEN)), 10);
});

test('range and digits', () => {
  assert.deepEqual(
    toArray(RANGE(ONE)(FIVE)).map(toInteger),
    [1, 2, 3, 4, 5]
  );
  assert.equal(toString(TO_DIGITS(FIVE)), '5');
  assert.equal(toString(TO_DIGITS(HUNDRED)), '100');
});

test('FIZZBUZZ matches the reference for 1..100', () => {
  assert.deepEqual(toArray(FIZZBUZZ).map(toString), expected);
});

test('the fully inlined expression also works', async () => {
  execFileSync(process.execPath, [join(here, 'inline.js')]);
  const { default: result } = await import('./dist/fizzbuzz-nothing.js');
  assert.deepEqual(toArray(result).map(toString), expected);
});
