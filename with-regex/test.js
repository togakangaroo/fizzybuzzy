const { fizzbuzz, parts } = require("./regex.js");

const N = 10000;
const input = Array.from({ length: N }, (_, i) => i + 1).join(" ");
const got = fizzbuzz(input).split(" ");

let bad = 0;
for (let n = 1; n <= N; n++) {
  const expect =
    n % 15 === 0 ? "FizzBuzz" :
    n % 3 === 0 ? "Fizz" :
    n % 5 === 0 ? "Buzz" : String(n);
  if (got[n - 1] !== expect) {
    console.error(`MISMATCH at ${n}: expected ${expect}, got ${got[n - 1]}`);
    if (++bad > 10) break;
  }
}

// each branch must also refuse what it shouldn't match on its own
const re = { fizzbuzz: parts.FIZZBUZZ_SRC, fizz: parts.FIZZ_SRC, buzz: parts.BUZZ_SRC };
const divides = { fizzbuzz: 15, fizz: 3, buzz: 5 };
for (const [name, src] of Object.entries(re)) {
  const anchored = new RegExp(`^(?:${src})$`);
  for (let n = 1; n <= 1000; n++) {
    const should = n % divides[name] === 0;
    if (anchored.test(String(n)) !== should) {
      console.error(`branch ${name} wrong on ${n}`);
      bad++;
    }
  }
}

if (bad === 0) console.log(`OK — 1..${N} via one .replace(), plus each branch anchored on 1..1000`);
else process.exit(1);
