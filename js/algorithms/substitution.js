import { strToBytes } from '../utils.js';
import { generateRandomIndices } from '../utils.js';

// --- CẤU HÌNH ---
const ALPHABET = "abcdefghijklmnopqrstuvwxyz";

// Global state
let QUADGRAMS = {};
let FLOOR_SCORE = -Infinity;
let QUADGRAMS_TOTAL = 0; 

// Initialize default small dictionary (fallback)
(function initDefaultQuadgrams() {
    const defaults = {"tion": 13168375, "nthe": 11234972, "ther": 10218035, "that": 8980536, "ofth": 8132124};
    QUADGRAMS_TOTAL = 0;
    QUADGRAMS = {};

    for (let k in defaults) QUADGRAMS_TOTAL += defaults[k];

    for (let k in defaults) {
        QUADGRAMS[k] = Math.log10(defaults[k] / QUADGRAMS_TOTAL);
    }

    FLOOR_SCORE = Math.log10(0.01 / QUADGRAMS_TOTAL);
})();


// === LOAD QUADGRAM FILE ===
export function loadQuadgramsData(text) {
    const lines = text.split('\n');
    QUADGRAMS_TOTAL = 0;
    QUADGRAMS = {};

    for (let line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length === 2) {
            const key = parts[0].toLowerCase(); // <-- dùng lowercase chuẩn
            const count = parseInt(parts[1]);

            if (key.length === 4 && !isNaN(count)) {
                QUADGRAMS[key] = count;
                QUADGRAMS_TOTAL += count;
            }
        }
    }

    if (QUADGRAMS_TOTAL === 0) {
        initDefaultQuadgrams();
        return Object.keys(QUADGRAMS).length;
    }

    for (let key in QUADGRAMS) {
        QUADGRAMS[key] = Math.log10(QUADGRAMS[key] / QUADGRAMS_TOTAL);
    }

    FLOOR_SCORE = Math.log10(0.01 / QUADGRAMS_TOTAL);
    return Object.keys(QUADGRAMS).length;
}

export function isQuadgramsLoaded() {
    return QUADGRAMS_TOTAL > 0;
}


// === FREQUENCY-BASED SEED KEY ===
function generateSeedKey(ciphertext) {
    const freq = {};
    for (let c of ciphertext) {
        if (c >= 'a' && c <= 'z') {
            freq[c] = (freq[c] || 0) + 1;
        }
    }

    const englishFreqOrder = "etaoinshrdlcumwfgypbvkjxqz";
    const sortedCipher = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);

    const seed = {};
    for (let i = 0; i < sortedCipher.length; i++) {
        seed[sortedCipher[i]] = englishFreqOrder[i];
    }

    const used = new Set(Object.values(seed));
    const remaining = [...englishFreqOrder].filter(x => !used.has(x));

    const finalMap = [];
    for (let c = 0; c < 26; c++) {
        const ch = String.fromCharCode(97 + c);
        finalMap.push(seed[ch] || remaining.shift());
    }

    return finalMap.join('');
}


// === DECRYPT FUNCTION ===
function decryptSub(text, key, preserveCase = false) {
    const map = {};
    for (let i = 0; i < 26; i++) {
        map[String.fromCharCode(97 + i)] = key[i];
    }

    let out = "";
    for (let ch of text) {
        const lower = ch.toLowerCase();
        if (lower >= 'a' && lower <= 'z') {
            const dec = map[lower];
            out += (preserveCase && ch !== lower) ? dec.toUpperCase() : dec;
        } else {
            out += ch;
        }
    }
    return out;
}


// === FITNESS FUNCTION ===
function getFitness(text) {
    let score = 0;
    const clean = text.toLowerCase().replace(/[^a-z]/g, "");

    for (let i = 0; i < clean.length - 3; i++) {
        const quad = clean.substring(i, i + 4);  // FIXED
        score += QUADGRAMS[quad] || FLOOR_SCORE;
    }
    return score;
}


// === MAIN SOLVER ===
export async function solveSubstitution(input, iterations, restarts, progressCallback) {
    if (!input) throw new Error("Input required");

    const cleanCiphertext = input.toLowerCase().replace(/[^a-z]/g, "");

    if (cleanCiphertext.length < 100) {
        throw new Error("Ciphertext quá ngắn. Cần ít nhất 100 ký tự a-z để phân tích.");
    }

    let globalBestScore = -Infinity;
    let globalBestKey = "";

    // MAIN LOOP
    for (let run = 0; run < restarts; run++) {

        if (progressCallback)
            progressCallback(`Restart ${run + 1}/${restarts} - Best Score: ${globalBestScore}`);

        await new Promise(r => setTimeout(r, 0));

        // ==== USE SEED KEY (tối ưu tốc độ hội tụ) ====
        let parentKey = generateSeedKey(cleanCiphertext);

        // Evaluate initial key
        let parentDec = decryptSub(cleanCiphertext, parentKey, false);
        let parentScore = getFitness(parentDec);

        if (parentScore > globalBestScore) {
            globalBestScore = parentScore;
            globalBestKey = parentKey;
        }

        // ==== HILL CLIMBING ====
        for (let iter = 0; iter < iterations; iter++) {
            if (iter % 200 === 0 && progressCallback) {
                progressCallback(
                    `Run ${run + 1}/${restarts} | Iter ${iter}/${iterations} | Score: ${parentScore}`
                );
                await new Promise(r => setTimeout(r, 0));
            }

            const indices = generateRandomIndices(26, 2);
            const a = indices[0];
            const b = indices[1];

            const childArr = parentKey.split('');
            [childArr[a], childArr[b]] = [childArr[b], childArr[a]];
            const childKey = childArr.join('');

            const childDec = decryptSub(cleanCiphertext, childKey, false);
            const childScore = getFitness(childDec);

            if (childScore > parentScore) {
                parentKey = childKey;
                parentScore = childScore;

                if (childScore > globalBestScore) {
                    globalBestScore = childScore;
                    globalBestKey = childKey;

                    if (progressCallback)
                        progressCallback(`🔥 New Best Score: ${globalBestScore}`);
                }
            }
        }
    }

    // === FINAL OUTPUT ===
    const finalPlaintext = decryptSub(input, globalBestKey, true);

    const output =
        `[SCORE]: ${globalBestScore}\n` +
        `[MAPPING]: ${ALPHABET} -> ${globalBestKey}\n` +
        `------------------------------------------------\n` +
        `${finalPlaintext}`;

    return strToBytes(output);
}
