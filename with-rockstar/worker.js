// Runs the Rockstar "Starship" engine — the .NET CLR compiled to
// WebAssembly — in a worker so the page never blocks.
//
// The .wasm framework files are stored gzipped (9.7 MB → 3.2 MB) because
// they're served by dumb static hosts that won't negotiate
// Content-Encoding. The resource loader below fetches the .gz twin and
// inflates it with the browser's own DecompressionStream. If the server
// already inflated it for us (some hosts do, for .gz extensions), the
// magic-byte check just passes the bytes through.
import { dotnet } from "./wasm/_framework/dotnet.js";

async function fetchGzipped(url) {
    const resp = await fetch(url + ".gz");
    if (!resp.ok) return fetch(url); // fall back to an uncompressed copy
    const bytes = new Uint8Array(await resp.arrayBuffer());
    const gzipped = bytes[0] === 0x1f && bytes[1] === 0x8b;
    let stream = new Response(bytes).body;
    if (gzipped) stream = stream.pipeThrough(new DecompressionStream("gzip"));
    return new Response(stream, {
        headers: { "Content-Type": "application/wasm" },
    });
}

const { getAssemblyExports, getConfig } = await dotnet
    .withDiagnosticTracing(false)
    // dotnet.js requires plain URL strings for its own JS modules, so only
    // the .wasm resources (which may be a Response) go through the inflater.
    .withResourceLoader((type, name, defaultUri) =>
        defaultUri.endsWith(".wasm") ? fetchGzipped(defaultUri) : defaultUri)
    .create();

const exports = await getAssemblyExports(getConfig().mainAssemblyName);
const status = await exports.Rockstar.Wasm.RockstarRunner.Status();
self.postMessage({ type: "ready", status });

self.addEventListener("message", async ({ data }) => {
    const output = (text) => self.postMessage({ type: "output", output: text });
    try {
        const result = await exports.Rockstar.Wasm.RockstarRunner.Run(
            data.program, output, data.input ?? "", data.args ?? "");
        self.postMessage({ type: "result", result });
    } catch (error) {
        self.postMessage({ type: "error", error: String(error) });
    }
});
