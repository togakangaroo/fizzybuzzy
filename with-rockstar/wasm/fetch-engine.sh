#!/bin/sh
# Re-fetches the Rockstar "Starship" engine — the official .NET WASM build
# published on codewithrockstar.com — and gzips the .wasm files so they can
# be committed and served pre-compressed from a static host (../worker.js
# inflates them in the browser). The .js loader files stay uncompressed
# because dotnet.js can only import its own modules from plain URLs.
#
# Upstream publishes fingerprinted filenames (e.g. dotnet.native.<hash>.wasm),
# so a new engine release means new filenames: rerun this and commit the diff.
set -eu
base="https://codewithrockstar.com/wasm/wwwroot/_framework"
cd "$(dirname "$0")/_framework"

curl -sfLO "$base/blazor.boot.json"
# Every runtime file appears as a key of resources.fingerprinting.
files=$(grep -oE '"[^"]+\.(wasm|js)" *:' blazor.boot.json | cut -d'"' -f2 | sort -u)

rm -f -- *.wasm *.wasm.gz
for f in $files; do
    echo "fetching $f"
    curl -sfLO "$base/$f"
done
for f in *.wasm; do gzip -9 "$f"; done
ls -lh
