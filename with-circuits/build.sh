#!/usr/bin/env bash
# Rebuild the netlist, diagram, and browser bundle from fizzbuzz.v.
# Needs docker (for yosys via ghdl/synth) and node/npx (for netlistsvg).
set -euo pipefail
cd "$(dirname "$0")"

docker run --rm -v "$PWD":/src -w /src ghdl/synth:beta yosys -p "
read_verilog fizzbuzz.v;
hierarchy -top fizzbuzz;
proc; flatten; opt;
techmap; opt;
abc -g AND,OR,XOR;
opt_clean;
stat;
write_json fizzbuzz.json"

npx --yes netlistsvg fizzbuzz.json -o fizzbuzz.svg

node test.js
node bundle.js
