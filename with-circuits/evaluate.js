// Evaluator for a yosys gate-level JSON netlist. Works in node
// (require) and the browser (global NetlistEval). The demo page uses
// this to compute every net's value for real — the SVG diagram is
// pre-rendered, but the signals painted onto it come from here.
(function (root, factory) {
    if (typeof module === "object" && module.exports) module.exports = factory();
    else root.NetlistEval = factory();
})(typeof self !== "undefined" ? self : this, function () {
    const GATES = {
        "$_NOT_": (p) => 1 - p.A,
        "$_AND_": (p) => p.A & p.B,
        "$_OR_":  (p) => p.A | p.B,
        "$_XOR_": (p) => p.A ^ p.B,
    };

    // mod: one entry of netlist.modules; inputs: {portName: integer}.
    // Returns {nets: Map(bit -> 0|1), outputs: {portName: integer}}.
    function evaluate(mod, inputs) {
        const nets = new Map([["0", 0], ["1", 1]]);
        for (const [name, port] of Object.entries(mod.ports)) {
            if (port.direction !== "input") continue;
            const v = inputs[name] ?? 0;
            port.bits.forEach((bit, i) => nets.set(bit, (v >> i) & 1));
        }

        let pending = Object.values(mod.cells);
        while (pending.length) {
            const stuck = [];
            for (const cell of pending) {
                const gate = GATES[cell.type];
                if (!gate) throw new Error("unknown cell type: " + cell.type);
                const pins = {};
                let ready = true;
                for (const [pin, dir] of Object.entries(cell.port_directions)) {
                    if (dir !== "input") continue;
                    const bit = cell.connections[pin][0];
                    if (!nets.has(bit)) { ready = false; break; }
                    pins[pin] = nets.get(bit);
                }
                if (!ready) { stuck.push(cell); continue; }
                nets.set(cell.connections.Y[0], gate(pins));
            }
            if (stuck.length === pending.length)
                throw new Error("no progress — combinational loop?");
            pending = stuck;
        }

        const outputs = {};
        for (const [name, port] of Object.entries(mod.ports)) {
            if (port.direction !== "output") continue;
            outputs[name] = port.bits.reduce(
                (acc, bit, i) => acc | (nets.get(bit) << i), 0);
        }
        return { nets, outputs };
    }

    return { evaluate };
});
