# Vendored Rockstar "Starship" engine

The files under `_framework/` are the official WebAssembly build of the
[Rockstar](https://github.com/RockstarLang/rockstar) interpreter by Dylan
Beattie and contributors, as published at
<https://codewithrockstar.com/wasm/wwwroot/_framework/>, licensed under the
**GNU Affero General Public License v3.0**
(<https://github.com/RockstarLang/rockstar/blob/main/LICENSE>). Complete
corresponding source is available at that repository.

The only modification here: the `.wasm` files are stored gzipped
(`gzip -9`, renamed `*.wasm.gz`) so they can be served pre-compressed from a
static host; `../worker.js` inflates them in the browser. `./fetch-engine.sh`
re-downloads and re-compresses the current upstream build; `dotnet publish
./Starship/Rockstar.Wasm` in the upstream repo reproduces it from source.
