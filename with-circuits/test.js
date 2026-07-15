// node test.js — run every possible input (all 256 bytes) through the
// synthesized netlist and check fizz/buzz/leds against arithmetic.
const { evaluate } = require("./evaluate.js");
const netlist = require("./fizzbuzz.json");
const mod = netlist.modules.fizzbuzz;

let failures = 0;
for (let n = 0; n < 256; n++) {
    const { outputs } = evaluate(mod, { n });
    const want = {
        fizz: n % 3 === 0 ? 1 : 0,
        buzz: n % 5 === 0 ? 1 : 0,
        leds: (n % 3 === 0 || n % 5 === 0) ? 0 : n,
    };
    for (const k of Object.keys(want)) {
        if (outputs[k] !== want[k]) {
            console.error(`n=${n}: ${k} = ${outputs[k]}, want ${want[k]}`);
            failures++;
        }
    }
}
if (failures) {
    console.error(`FAILED: ${failures} mismatches`);
    process.exit(1);
}
console.log("ok — all 256 inputs match (fizz, buzz, and the 8 number LEDs incl. blanking)");
