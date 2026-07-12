// FizzBuzz as a single-tape Turing machine.
//
// Tape layout:   _ <counter digits, decimal> # <output entries, `.`-separated>
//
// The counter is incremented in place. Divisibility by 3 falls out of the
// digit-sum trick: scanning the digits left-to-right while cycling through
// three states (m0/m1/m2) leaves the machine in state m(n mod 3) at the `#`.
// Divisibility by 5 only needs the last digit (0 or 5). Non-fizzbuzz numbers
// are copied digit-by-digit to the output, marking each copied digit (3 -> 3')
// so the machine can find its place again; the marks are erased by the next
// increment pass. The machine never halts -- stopping is the simulator's call.

const DIGITS = ['0','1','2','3','4','5','6','7','8','9'];
const BLANK = '_';
const marked = (d) => d + "'";

// rules[state][symbol] = [write, move ('L'|'R'), nextState]
const rules = {};
const rule = (state, symbol, write, move, next) => {
  (rules[state] ??= {})[symbol] = [write, move, next];
};

// --- increment (also erases copy-marks left by the previous iteration) ---
// `carry` starts on the rightmost counter digit, moving left while carrying.
for (const d of DIGITS) {
  const inc = d === '9' ? '0' : DIGITS[+d + 1];
  const next = d === '9' ? 'carry' : 'toStart';
  rule('carry', d, inc, 'L', next);
  rule('carry', marked(d), inc, 'L', next);
  rule('toStart', d, d, 'L', 'toStart');
  rule('toStart', marked(d), d, 'L', 'toStart'); // unmark on the way past
}
rule('carry', BLANK, '1', 'L', 'toStart'); // carry past the left end: new digit
rule('toStart', BLANK, BLANK, 'R', 'm0');

// --- divisibility by 3: digit-sum mod 3, tracked in the state ---
for (let m = 0; m < 3; m++) {
  for (const d of DIGITS) {
    rule(`m${m}`, d, d, 'R', `m${(m + +d) % 3}`);
  }
}
rule('m0', '#', '#', 'L', 'last3'); // n ≡ 0 (mod 3)
rule('m1', '#', '#', 'L', 'lastN');
rule('m2', '#', '#', 'L', 'lastN');

// --- divisibility by 5: just look at the last digit ---
for (const d of DIGITS) {
  const by5 = d === '0' || d === '5';
  rule('last3', d, d, 'R', by5 ? 'seekFB' : 'seekFizz');
  rule('lastN', d, d, by5 ? 'R' : 'L', by5 ? 'seekBuzz' : 'cpStart');
}

// --- write Fizz / Buzz / FizzBuzz at the right end of the tape ---
// seek states run right over everything to the first blank, then each
// writer state lays down one letter.
const chain = (states, letters, after) => {
  states.forEach((s, i) => {
    rule(s, BLANK, letters[i], 'R', states[i + 1] ?? after);
  });
};
for (const seek of ['seekFizz', 'seekFB', 'seekBuzz']) {
  for (const sym of [...DIGITS, '#', 'F', 'i', 'z', 'B', 'u', '.']) {
    rule(seek, sym, sym, 'R', seek);
  }
}
chain(['seekFizz', 'wF_i', 'wF_z1', 'wF_z2'], ['F', 'i', 'z', 'z'], 'wDot');
chain(['seekFB', 'wFB_i', 'wFB_z1', 'wFB_z2'], ['F', 'i', 'z', 'z'], 'seekBuzz');
chain(['seekBuzz', 'wB_u', 'wB_z1', 'wB_z2'], ['B', 'u', 'z', 'z'], 'wDot');

// --- copy the counter to the output, digit by digit ---
// cpStart rewinds to the leftmost digit; cpNext grabs the next uncopied
// digit, remembering its value in the state (cp0..cp9) while running right
// to the first blank; cpBack runs left to the rightmost mark to go again.
for (const d of DIGITS) {
  rule('cpStart', d, d, 'L', 'cpStart');
  rule('cpNext', d, marked(d), 'R', `cp${d}`);
  for (const sym of [...DIGITS, '#', 'F', 'i', 'z', 'B', 'u', '.']) {
    rule(`cp${d}`, sym, sym, 'R', `cp${d}`);
  }
  rule(`cp${d}`, BLANK, d, 'L', 'cpBack');
  rule('cpBack', marked(d), marked(d), 'R', 'cpNext');
  rule('cpBack', d, d, 'L', 'cpBack');
}
rule('cpStart', BLANK, BLANK, 'R', 'cpNext');
rule('cpNext', '#', '#', 'R', 'wDot');
for (const sym of ['#', 'F', 'i', 'z', 'B', 'u', '.']) {
  rule('cpBack', sym, sym, 'L', 'cpBack');
}

// --- entry separator, then walk back to the counter for the next round ---
for (const sym of [...DIGITS, 'F', 'i', 'z', 'B', 'u', '.']) {
  rule('wDot', sym, sym, 'R', 'wDot');
  rule('back', sym, sym, 'L', 'back');
}
rule('wDot', BLANK, '.', 'L', 'back');
rule('back', '#', '#', 'L', 'carry');

// --- simulator ---

function initialConfig() {
  // Counter starts at 0; the first `carry` pass makes it 1.
  return { tape: ['0', '#'], head: 0, state: 'carry', steps: 0 };
}

// One transition. Mutates config; returns the rule that fired.
function step(config) {
  if (config.head < 0) {
    config.tape.unshift(BLANK);
    config.head = 0;
  }
  if (config.head >= config.tape.length) config.tape.push(BLANK);
  const symbol = config.tape[config.head];
  const r = rules[config.state]?.[symbol];
  if (!r) throw new Error(`no rule for (${config.state}, ${symbol})`);
  const [write, move, next] = r;
  config.tape[config.head] = write;
  config.head += move === 'R' ? 1 : -1;
  config.state = next;
  config.steps++;
  return { state: config.state, symbol, write, move, next };
}

// Decode the output region of the tape into ["1", "2", "Fizz", ...].
// Only complete (`.`-terminated) entries are returned.
function decodeOutput(tape) {
  const out = tape.slice(tape.indexOf('#') + 1).join('').replace(/_+$/, '');
  return out.split('.').slice(0, -1);
}

const FizzBuzzTM = { rules, BLANK, initialConfig, step, decodeOutput };

if (typeof module !== 'undefined') module.exports = FizzBuzzTM;
if (typeof globalThis !== 'undefined') globalThis.FizzBuzzTM = FizzBuzzTM;
