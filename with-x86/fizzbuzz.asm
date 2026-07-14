; fizzbuzz.asm — FizzBuzz as an x86 boot sector.
;
; No operating system, no libc, no compiler. The BIOS loads these 512
; bytes to 0000:7C00 and jumps to them; we print via BIOS teletype
; (int 10h / ah=0Eh) and then halt the machine.
;
; Assemble: nasm -f bin fizzbuzz.asm -o fizzbuzz.img

[bits 16]
[org 0x7c00]

start:
    xor ax, ax
    mov ds, ax
    mov ss, ax
    mov sp, 0x7c00          ; stack grows down from where we were loaded

    mov ax, 0x0003          ; 80x25 text mode (also clears the screen)
    int 0x10

    mov cx, 1               ; cx = n, the loop counter

.next:
    xor bp, bp              ; bp = "did we print Fizz or Buzz?"

    mov ax, cx              ; n mod 3
    xor dx, dx
    mov bx, 3
    div bx
    test dx, dx
    jnz .not3
    mov si, fizz
    call puts
    inc bp
.not3:
    mov ax, cx              ; n mod 5
    xor dx, dx
    mov bx, 5
    div bx
    test dx, dx
    jnz .not5
    mov si, buzz
    call puts
    inc bp
.not5:
    test bp, bp             ; neither divided evenly: print the number
    jnz .newline
    call putnum
.newline:
    mov si, crlf
    call puts

    inc cx
    ; "strict word" forces a 16-bit immediate (81 F9 imm16) instead of
    ; the sign-extended imm8 form, so the demo page can patch the limit
    ; in the binary to anything up to 65535.
    cmp cx, strict word 100
    jbe .next

    cli                     ; that's all — park the CPU
.halt:
    hlt
    jmp .halt

; ---------------------------------------------------------------
; puts — print the NUL-terminated string at ds:si
puts:
    lodsb
    test al, al
    jz .done
    mov ah, 0x0e            ; BIOS teletype: prints al, advances cursor
    int 0x10
    jmp puts
.done:
    ret

; ---------------------------------------------------------------
; putnum — print cx as decimal (1..100 needs at most 3 digits)
putnum:
    mov ax, cx
    mov bx, 10
    xor di, di              ; di = digits pushed
.divide:
    xor dx, dx
    div bx                  ; ax = ax/10, dx = digit
    push dx
    inc di
    test ax, ax
    jnz .divide
.print:
    pop ax
    add al, '0'
    mov ah, 0x0e
    int 0x10
    dec di
    jnz .print
    ret

; ---------------------------------------------------------------
fizz: db "Fizz", 0
buzz: db "Buzz", 0
crlf: db 13, 10, 0

    times 510-($-$$) db 0   ; pad the sector...
    dw 0xaa55               ; ...and mark it bootable
