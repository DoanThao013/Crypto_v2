import { strToBytes } from '../utils.js';

const ENGLISH_FREQS = [
    0.08167,0.01492,0.02782,0.04253,0.12702,0.02228,
    0.02015,0.06094,0.06966,0.00153,0.00772,0.04025,
    0.02406,0.06749,0.07507,0.01929,0.00095,0.05987,
    0.06327,0.09056,0.02758,0.00978,0.02360,0.00150,
    0.01974,0.00074
];

function getIC(text) {
    let N = text.length;
    if (N <= 1) return 0;

    let counts = Array(26).fill(0);
    for (let c of text) counts[c.charCodeAt(0) - 65]++;

    let sum = 0;
    for (let n of counts) sum += n * (n - 1);

    return sum / (N * (N - 1));
}

export function solveVigenere(inputRaw, maxLen) {

    if (!inputRaw) throw new Error("Input required");

    const cleanText = inputRaw.toUpperCase().replace(/[^A-Z]/g, "");
    const N = cleanText.length;

    // --- Limit key length for optimization ---
    const effectiveMax = Math.min(maxLen, 20, Math.floor(N / 2));

    let bestLen = 1;
    let bestIC = 0;

    // --- Estimate key length by IC ---
    for (let L = 1; L <= effectiveMax; L++) {
        let totalIC = 0;

        for (let i = 0; i < L; i++) {
            let col = "";
            for (let j = i; j < N; j += L) col += cleanText[j];
            totalIC += getIC(col);
        }

        let avgIC = totalIC / L;

        if (avgIC > bestIC) {
            bestIC = avgIC;
            bestLen = L;
        }
    }

    // --- Solve each Caesar subset using chi-square ---
    let key = "";

    for (let pos = 0; pos < bestLen; pos++) {

        let col = "";
        for (let j = pos; j < N; j += bestLen) col += cleanText[j];

        let bestShift = 0;
        let bestChi = Infinity;

        for (let shift = 0; shift < 26; shift++) {
            let counts = Array(26).fill(0);

            // decrypt column with shift
            for (let c of col) {
                let v = (c.charCodeAt(0) - 65 - shift + 26) % 26;
                counts[v]++;
            }

            // compute chi-square
            let chi = 0;
            for (let i = 0; i < 26; i++) {
                let expected = ENGLISH_FREQS[i] * col.length;
                if (expected > 0)
                    chi += ((counts[i] - expected) ** 2) / expected;
            }

            if (chi < bestChi) {
                bestChi = chi;
                bestShift = shift;
            }
        }

        key += String.fromCharCode(bestShift + 65);
    }

    // --- Decrypt full ciphertext ---
    let plaintext = "";
    let ki = 0;

    for (let ch of inputRaw) {
        if (/[a-zA-Z]/.test(ch)) {
            let base = ch >= 'a' ? 97 : 65;
            let kShift = key[ki % key.length].charCodeAt(0) - 65;

            let p = String.fromCharCode(
                ((ch.charCodeAt(0) - base - kShift + 26) % 26) + base
            );

            plaintext += p;
            ki++;
        } else {
            plaintext += ch;
        }
    }

    const output =
        `Predicted Key Length: ${bestLen}\nKey: ${key}\n\n${plaintext}`;

    return strToBytes(output);
}
