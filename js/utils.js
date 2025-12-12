// Common English Words for Scoring
export const COMMON_ENGLISH_WORDS = new Set([
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "i", 
    "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", 
    "this", "but", "his", "by", "from", "they", "we", "say", "her", 
    "she", "or", "an", "will", "my", "one", "all", "would", "there", 
    "their", "what", "so", "up", "out", "if", "about", "who", "get", 
    "which", "go", "me"
]);

// --- String / Byte Conversions ---

export function strToBytes(str) { return new TextEncoder().encode(str); }
export function bytesToStr(bytes) { return new TextDecoder().decode(bytes); }

export function hexToBytes(hex) {
    hex = hex.replace(/\s/g, '');
    if (hex.length % 2 !== 0) throw new Error("Invalid Hex String");
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    return bytes;
}

export function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function base64ToBytes(base64) {
    const binString = atob(base64);
    return Uint8Array.from(binString, (m) => m.codePointAt(0));
}

export function bytesToBase64(bytes) {
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
    return btoa(binString);
}

// --- Cryptographic Helpers ---

export function xorBytes(a, b) {
    let res = new Uint8Array(a.length);
    for(let i=0; i<a.length; i++) res[i] = a[i] ^ b[i];
    return res;
}

// Hàm mới: Nối nhiều Uint8Array lại thành một
export function concatBytes(arrays) {
    const totalLength = arrays.reduce((acc, array) => acc + array.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const array of arrays) {
        result.set(array, offset);
        offset += array.length;
    }
    return result;
}

// PKCS#7 Padding
export function padPKCS7(data, blockSize) {
    const padLen = blockSize - (data.length % blockSize);
    const padded = new Uint8Array(data.length + padLen);
    padded.set(data);
    padded.fill(padLen, data.length);
    return padded;
}

export function unpadPKCS7(data) {
    if(data.length === 0) return data;
    const padLen = data[data.length - 1];
    if(padLen < 1 || padLen > data.length) throw new Error("Invalid Padding or Wrong Key");
    return data.slice(0, data.length - padLen);
}
/**
 * Tạo mảng các chỉ số ngẫu nhiên không trùng lặp.
 * Dùng cho việc tráo Key trong Substitution Hill Climbing.
 * @param {number} max - Giới hạn trên (ví dụ: 26 cho A-Z).
 * @param {number} count - Số lượng chỉ số cần lấy.
 * @returns {number[]}
 */
export function generateRandomIndices(max, count) {
    const indices = Array.from({length: max}, (_, i) => i);
    // Fisher-Yates shuffle để lấy ngẫu nhiên 'count' phần tử
    for (let i = max - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, count);
}