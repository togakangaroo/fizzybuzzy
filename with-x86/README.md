# FizzBuzz in x86 Machine Code

The program is `fizzbuzz.img`: a 512-byte boot sector, of which only
~140 bytes are actual code and data. The computer that boots it is
[v86](https://github.com/copy/v86), an x86 PC emulated in
WebAssembly, so the whole thing runs in a browser tab.

There is no operating system anywhere in this stack. The (emulated)
BIOS reads the floppy's first sector into memory at `0000:7C00` and
jumps to it. The program runs in 16-bit real mode, prints with the
BIOS teletype interrupt (`int 10h` / `ah=0Eh`), and halts the CPU
when it reaches 100.

## Files

- `fizzbuzz.asm` — the source, NASM syntax
- `fizzbuzz.img` — the assembled boot sector (checked in so the demo
  needs no toolchain)
- `index.html` — demo page: boots the machine, shows a colored
  hexdump of all 512 bytes and the source. The "count to" input
  (1–999) patches the 16-bit immediate of the `cmp cx` instruction
  directly in the disk image and reboots — the loop limit is data
  in the binary, so no reassembly is needed. (`strict word` in the
  source forces the 4-byte `81 F9 imm16` encoding; NASM's default
  sign-extended `imm8` form would cap the limit at 127.)
- `v86/` — vendored emulator: `libv86.js` + `v86.wasm` (v86 0.5.424
  from npm) and `seabios.bin` + `vgabios.bin` (from the v86 repo)

## Rebuilding

```sh
nasm -f bin fizzbuzz.asm -o fizzbuzz.img
```

## Serving

The page fetches the disk image and wasm, so it needs an HTTP server:

```sh
uv run --no-project python -m http.server
```
