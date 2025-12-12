import { COMMON_ENGLISH_WORDS, strToBytes } from '../utils.js';

export function solveCaesar(input) {
    if (!input) throw new Error("Please enter ciphertext");

    let bestKey = 0;
    let bestScore = -1;
    let bestText = "";

    const len = input.length;

    for (let k = 0; k < 26; k++) {
        let chars = [];  

        // =====================
        //      DECRYPT LOOP
        // =====================
        for (let i = 0; i < len; i++) {
            const ch = input[i];
            const code = ch.charCodeAt(0);

            if (code >= 65 && code <= 90) {           // A–Z
                chars.push(String.fromCharCode(((code - 65 - k + 26) % 26) + 65));
            }
            else if (code >= 97 && code <= 122) {     // a–z
                chars.push(String.fromCharCode(((code - 97 - k + 26) % 26) + 97));
            }
            else chars.push(ch);                      // punctuation
        }

        const candidate = chars.join("");

        // =====================
        //       SCORING
        // =====================
        let score = 0;
        const words = candidate.toLowerCase().split(/\s+/);

        for (let w of words) {
            const clean = w.replace(/[^a-z]/g, ""); // faster regex

            if (COMMON_ENGLISH_WORDS.has(clean))
                score++;
        }

        // =====================
        //      PICK BEST
        // =====================
        if (score > bestScore) {
            bestScore = score;
            bestKey = k;
            bestText = candidate;
        }
    }

    return strToBytes(`[Best Key: ${bestKey}, Score: ${bestScore}]\n\n${bestText}`);
}
