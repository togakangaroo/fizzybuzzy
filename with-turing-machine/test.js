const { initialConfig, step, decodeOutput, rules } = require('./machine.js');

const N = 100;

const expected = [];
for (let n = 1; n <= N; n++) {
  expected.push(
    n % 15 === 0 ? 'FizzBuzz' : n % 3 === 0 ? 'Fizz' : n % 5 === 0 ? 'Buzz' : String(n)
  );
}

const config = initialConfig();
while (decodeOutput(config.tape).length < N) {
  step(config);
  if (config.steps > 5_000_000) throw new Error('runaway machine');
}

const actual = decodeOutput(config.tape).slice(0, N);
for (let i = 0; i < N; i++) {
  if (actual[i] !== expected[i]) {
    console.error(`FAIL at n=${i + 1}: got ${JSON.stringify(actual[i])}, want ${expected[i]}`);
    process.exit(1);
  }
}

const stateCount = Object.keys(rules).length;
const ruleCount = Object.values(rules).reduce((sum, r) => sum + Object.keys(r).length, 0);
console.log(`OK: first ${N} entries correct in ${config.steps} steps`);
console.log(`machine: ${stateCount} states, ${ruleCount} transitions`);
