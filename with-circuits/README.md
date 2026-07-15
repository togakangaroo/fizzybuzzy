# FizzBuzz on Bare Circuitry

FizzBuzz with no processor, no memory, and no clock: 8 input wires
carry n in binary, 10 LEDs come out — one lights on multiples of 3
(fizz), one on multiples of 5 (buzz), and 8 show the number *only when
neither fires*, so the LED bank spells the whole answer just like the
printed version. The "program" is 92 logic gates and the "execution"
is voltage settling.

## Why it's this small

16 ≡ 1 (mod 3) **and** 16 ≡ 1 (mod 5). So with n = 16·hi + lo, the
residue of n equals the residue of hi + lo for *both* moduli. The whole
circuit is:

1. **fold** — one 4-bit adder: sum = hi + lo (a 5-bit value, 0–30)
2. **div3** — a gate cloud over those 5 wires: is sum divisible by 3?
3. **div5** — likewise for 5
4. the number LEDs are the input ANDed with ~(fizz | buzz), so they go
   dark whenever a word claims the number

Yosys synthesizes it all to 41 AND, 32 OR, 9 XOR, and 10 NOT gates.

## The demo (and the honest cheat)

`index.html` shows the machine (flippable input switches, the 10 LEDs)
above the full gate-level schematic. Wires are painted green when high.

The diagram is **pre-rendered once** by netlistsvg — it is not laid out
live. But the signals on it are not faked: every wire segment in the
SVG carries its net number from the yosys netlist, and the page
re-evaluates the actual netlist JSON gate-by-gate on every input
change, then colors each wire from its computed value. The "clock" that
plays 1…100 is JavaScript incrementing the input byte — the circuit
itself is purely combinational and would answer just as happily from
eight physical switches.

## Files

- `fizzbuzz.v` — the source: `fold`, `div3`, `div5`, and the top module
- `build.sh` — Verilog → yosys (in the `ghdl/synth` docker image, no
  local yosys install) → `fizzbuzz.json` netlist → netlistsvg →
  `fizzbuzz.svg` → bundled into `circuit.js`
- `evaluate.js` — the netlist evaluator (topological gate-by-gate),
  shared by the browser demo and the tests
- `test.js` — `node test.js` runs **all 256 possible inputs** through
  the synthesized netlist and checks fizz, buzz, and the number LEDs
  (including blanking) against arithmetic
- `circuit.js` — generated: the netlist JSON and SVG inlined so the
  page works from `file://`
- `index.html` — the demo; just open it in a browser
