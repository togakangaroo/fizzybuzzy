// FizzBuzz as pure combinational logic. No processor, no clock.
//
// 8 input wires carry n; 10 LEDs come out: 8 echo the number in
// binary, one lights on multiples of 3 (fizz), one on multiples
// of 5 (buzz).
//
// The whole trick: 16 ≡ 1 (mod 3) and 16 ≡ 1 (mod 5), so with
// n = 16*hi + lo the residue of n equals the residue of hi + lo
// for both moduli. One 4-bit adder folds the byte down to a 5-bit
// sum (0..30), and each divisibility test is then a small cloud of
// gates over just those 5 bits.

module fold (
    input  [3:0] hi,
    input  [3:0] lo,
    output [4:0] sum
);
    assign sum = hi + lo;
endmodule

module div3 (
    input  [4:0] sum,
    output       fizz
);
    assign fizz = (sum % 3) == 0;
endmodule

module div5 (
    input  [4:0] sum,
    output       buzz
);
    assign buzz = (sum % 5) == 0;
endmodule

module fizzbuzz (
    input  [7:0] n,
    output       fizz,
    output       buzz,
    output [7:0] leds
);
    wire [4:0] sum;

    fold u_fold (.hi(n[7:4]), .lo(n[3:0]), .sum(sum));
    div3 u_div3 (.sum(sum), .fizz(fizz));
    div5 u_div5 (.sum(sum), .buzz(buzz));

    // the LEDs spell the whole answer: show the number only when
    // neither fizz nor buzz claimed it
    wire say_number = ~(fizz | buzz);
    assign leds = n & {8{say_number}};
endmodule
