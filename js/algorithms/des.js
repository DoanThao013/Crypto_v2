import * as Utils from '../utils.js';

// --- CẤU HÌNH & BẢNG TRA DES (CHUẨN FIPS 46-3) ---
const BLOCK_SIZE = 8; // 64 bits

// Bảng hoán vị khởi tạo (Initial Permutation)
const PI = [58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4,
            62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8,
            57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3,
            61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7];

// Bảng hoán vị nghịch đảo (Final Permutation)
const PI_1 = [40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31,
              38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29,
              36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27,
              34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25];

// Bảng mở rộng (Expansion E)
const E = [32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9,
           8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17,
           16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25,
           24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1];

// Bảng hoán vị P (Permutation P)
const P = [16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10,
           2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25];

// S-Boxes (S1 -> S8) - Dùng Array
const S_BOX = [
    [[14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
     [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
     [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
     [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]],
    [[15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
     [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
     [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
     [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]],
    [[10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
     [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
     [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
     [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]],
    [[7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
     [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
     [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
     [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]],
    [[2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
     [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
     [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
     [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]],
    [[12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
     [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
     [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
     [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]],
    [[4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
     [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
     [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
     [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]],
    [[13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
     [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
     [7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8],
     [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]]
];

// Key Schedule Tables
const PC1 = [57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18,
             10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36,
             63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22,
             14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4];
const PC2 = [14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10,
             23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2,
             41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48,
             44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32];
const SHIFT = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];


// === BIT UTILITIES ===
function bytesToBits(data) {
    const bits = [];
    for (const byte of data)
        for (let i=7; i>=0; i--)
            bits.push((byte >> i) & 1);
    return bits;
}

function bitsToBytes(bits) {
    const out = new Uint8Array(bits.length / 8);
    for (let i=0;i<bits.length;i+=8) {
        let v=0;
        for (let b=0;b<8;b++) v = (v<<1)|bits[i+b];
        out[i/8] = v;
    }
    return out;
}

function permute(bits, table) {
    return table.map(i => bits[i-1]);
}

function xorBits(a,b){
    return a.map((x,i)=>x^b[i]);
}

function generateRandomIV(){
    return crypto.getRandomValues(new Uint8Array(BLOCK_SIZE));
}


// === FIXED SUBKEY GENERATION ===
function generateSubkeys(keyBytes){

    if (keyBytes.length !== 8)
        throw new Error("Key must be 8 bytes.");

    let keyBits = permute(bytesToBits(keyBytes), PC1);

    let C = keyBits.slice(0,28);
    let D = keyBits.slice(28);

    const subkeys = [];

    for (let i=0;i<16;i++){
        const shift = SHIFT[i];
        C = C.slice(shift).concat(C.slice(0,shift));
        D = D.slice(shift).concat(D.slice(0,shift));
        subkeys.push( permute(C.concat(D), PC2) );
    }

    return subkeys;
}


// === FIXED DES BLOCK FUNCTION (NO FINAL SWAP INSIDE ROUNDS) ===
function desBlockProcess(blockBytes, subkeys){

    let blockBits = permute(bytesToBits(blockBytes), PI);

    let L = blockBits.slice(0,32);
    let R = blockBits.slice(32);

    for (let i=0;i<16;i++){
        const expanded = permute(R, E);
        const x = xorBits(expanded, subkeys[i]);

        let sOut = [];

        for (let j=0;j<48;j+=6){
            let row = (x[j]<<1) | x[j+5];
            let col = (x[j+1]<<3)|(x[j+2]<<2)|(x[j+3]<<1)|x[j+4];
            let val = S_BOX[j/6][row][col];
            for (let b=3;b>=0;b--) sOut.push((val>>b)&1);
        }

        const f = permute(sOut, P);

        // FEISTEL: L_next = R, R_next = L XOR f(L,R)
        let newL = R;
        let newR = xorBits(L, f);

        L = newL;
        R = newR;
    }

    // AFTER ROUND 16: OUTPUT = R16 || L16  (NO SWAP AGAIN!)
    const preFinal = R.concat(L);

    return bitsToBytes(permute(preFinal, PI_1));
}



// === MAIN API: runDES (kept identical to your UI) ===
export function runDES(action, keyStr, mode, ivHex, inputBytes) {

    if(!inputBytes || inputBytes.length === 0)
        throw new Error("Input data is empty.");

    const keyBytes = Utils.strToBytes(keyStr);
    let subkeys = generateSubkeys(keyBytes);

    let ivBytes = null;
    let ivDisplay = null;

    if (ivHex) {
        ivBytes = Utils.hexToBytes(ivHex);
        if (ivBytes.length !== BLOCK_SIZE)
            throw new Error("IV must be 8 bytes.");
    }

    // ============================
    //        ENCRYPT
    // ============================
    if (action === 'enc') {

        let padded = Utils.padPKCS7(inputBytes, BLOCK_SIZE);

        let blocks = [];
        for (let i = 0; i < padded.length; i += BLOCK_SIZE)
            blocks.push(padded.slice(i, i + BLOCK_SIZE));

        // ---------- ECB ----------
        if (mode === 'ECB') {
            const out = blocks.map(b => desBlockProcess(b, subkeys));
            return { result: Utils.concatBytes(out), ivDisplay: null };
        }

        // ---------- CBC ----------
        if (mode === 'CBC') {

            if (!ivBytes) {
                ivBytes = generateRandomIV();
                ivDisplay = Utils.bytesToHex(ivBytes).toUpperCase();
            }

            let vector = ivBytes;
            let outBlocks = [];

            for (const b of blocks) {
                const x = Utils.xorBytes(b, vector);
                const enc = desBlockProcess(x, subkeys);
                outBlocks.push(enc);
                vector = enc;
            }

            // ALWAYS prefix IV to ciphertext
            const finalCipher = Utils.concatBytes([ivBytes, ...outBlocks]);
            return { result: finalCipher, ivDisplay };
        }

        throw new Error("Unsupported mode.");
    }



    // ============================
    //        DECRYPT
    // ============================
    else if (action === 'dec') {

        subkeys = subkeys.slice().reverse();

        let ciphertext = inputBytes;

        // ---------- ECB ----------
        if (mode === 'ECB') {

            if (ciphertext.length % BLOCK_SIZE !== 0)
                throw new Error("Ciphertext is not block-aligned.");

            const blocks = [];
            for (let i=0; i<ciphertext.length; i+=BLOCK_SIZE)
                blocks.push(ciphertext.slice(i,i+BLOCK_SIZE));

            const out = blocks.map(b => desBlockProcess(b,subkeys));
            let raw = Utils.concatBytes(out);

            try { raw = Utils.unpadPKCS7(raw); }
            catch { throw new Error("Invalid padding / key."); }

            return { result: raw, ivDisplay: null };
        }



        // ---------- CBC ----------
        if (mode === 'CBC') {

            if (ciphertext.length < BLOCK_SIZE * 2)
                throw new Error("Ciphertext too short: must contain IV + 1 block.");

            // ALWAYS extract IV from ciphertext prefix
            const ivFromCipher = ciphertext.slice(0, BLOCK_SIZE);
            const ctBlocksRaw = ciphertext.slice(BLOCK_SIZE);

            ivDisplay = Utils.bytesToHex(ivFromCipher).toUpperCase();
            ivBytes = ivFromCipher;

            if (ctBlocksRaw.length % BLOCK_SIZE !== 0)
                throw new Error("Ciphertext blocks misaligned.");

            const blocks = [];
            for (let i = 0; i < ctBlocksRaw.length; i += BLOCK_SIZE)
                blocks.push(ctBlocksRaw.slice(i, i + BLOCK_SIZE));

            let vector = ivBytes;
            let out = [];

            for (const b of blocks) {
                const dec = desBlockProcess(b, subkeys);
                const plain = Utils.xorBytes(dec, vector);
                out.push(plain);
                vector = b;
            }

            let raw = Utils.concatBytes(out);

            try { raw = Utils.unpadPKCS7(raw); }
            catch { throw new Error("Invalid Key / IV / Padding."); }

            return { result: raw, ivDisplay };
        }

        throw new Error("Unsupported mode.");
    }

    throw new Error("Invalid action.");
}
