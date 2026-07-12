// The escape hatch back to real JavaScript. Nothing in here is lambda
// calculus — these functions *observe* Church-encoded values so we can
// print them. The program itself (fizzbuzz.js) never uses any of this.

import { IS_EMPTY, FIRST, REST } from './fizzbuzz.js';

export const toInteger = n => n(x => x + 1)(0);

export const toBoolean = b => b(true)(false);

export const toArray = list => {
  const array = [];
  while (!toBoolean(IS_EMPTY(list))) {
    array.push(FIRST(list));
    list = REST(list);
  }
  return array;
};

const ALPHABET = '0123456789BFiuz';

export const toChar = c => ALPHABET[toInteger(c)];

export const toString = s => toArray(s).map(toChar).join('');
