import * as Utils from '../utils.js';

// --- CẤU HÌNH AES CONSTANTS ---
const BLOCK_SIZE = 16; // 128 bits
const RCON = [
    0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40,
    0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a,
    0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a,
    0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91, 0x39
];

const S_BOX = [
    0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
    0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
    0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
    0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
    0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
    0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
    0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
    0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
    0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
    0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
    0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
    0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
    0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
    0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
    0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
    0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
];

const INV_S_BOX = [
    0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
    0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
    0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
    0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
    0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
    0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
    0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
    0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
    0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
    0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
    0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
    0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
    0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
    0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
    0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
    0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
];


// Phép nhân trong trường Galois GF(2^8)
function gmul(a, b) {
    let p = 0;
    for (let i = 0; i < 8; i++) {
        if (b & 1) p ^= a;
        let hi_bit_set = a & 0x80;
        a = (a << 1) & 0xFF;
        if (hi_bit_set) a ^= 0x1b;
        b >>= 1;
    }
    return p;
}


// --- CLASS AES THỦ CÔNG (JavaScript) ---
class AES_Manual {
    constructor(keyBytes) {
        this.change_key(keyBytes);
    }

    change_key(keyBytes) {
        this.key_size = keyBytes.length;
        if (this.key_size === 16) this.rounds = 10;
        else if (this.key_size === 24) this.rounds = 12;
        else if (this.key_size === 32) this.rounds = 14;
        else throw new Error("Key length must be 16, 24, or 32 bytes");
        this._expand_key(keyBytes);
    }

    _expand_key(keyBytes) {
        this.round_keys = Array.from(keyBytes); 
        const key_cols = this.key_size / 4;
        let i = key_cols;

        while (this.round_keys.length < (this.rounds + 1) * 16) { 
            let temp = this.round_keys.slice((i-1)*4, i*4);
            
            if (i % key_cols === 0) {
                temp = temp.slice(1).concat(temp.slice(0, 1));
                temp = temp.map(b => S_BOX[b]);
                temp[0] ^= RCON[i / key_cols];
            } else if (key_cols > 6 && i % key_cols === 4) {
                temp = temp.map(b => S_BOX[b]);
            }
            
            for (let j = 0; j < 4; j++) {
                const prev_word_index = (i - key_cols) * 4 + j;
                this.round_keys.push(this.round_keys[prev_word_index] ^ temp[j]);
            }
            i++;
        }
    }

    _add_round_key(state, roundKey) {
        for (let i = 0; i < 16; i++) {
            state[i] ^= roundKey[i];
        }
    }

    _sub_bytes(state) {
        for (let i = 0; i < 16; i++) state[i] = S_BOX[state[i]];
    }

    _inv_sub_bytes(state) {
        for (let i = 0; i < 16; i++) state[i] = INV_S_BOX[state[i]];
    }

    _shift_rows(s) {
        const t = Array.from(s); 
        s[1] = t[5]; s[5] = t[9]; s[9] = t[13]; s[13] = t[1];
        s[2] = t[10]; s[6] = t[14]; s[10] = t[2]; s[14] = t[6];
        s[3] = t[15]; s[7] = t[3]; s[11] = t[7]; s[15] = t[11];
    }

    _inv_shift_rows(s) {
        const t = Array.from(s); 
        s[1] = t[13]; s[5] = t[1]; s[9] = t[5]; s[13] = t[9];
        s[2] = t[10]; s[6] = t[14]; s[10] = t[2]; s[14] = t[6];
        s[3] = t[7]; s[7] = t[11]; s[11] = t[15]; s[15] = t[3];
    }

    _mix_columns(s) {
        for (let i = 0; i < 4; i++) {
            const i4 = i * 4;
            const col = s.slice(i4, i4 + 4);
            s[i4]   = gmul(col[0], 2) ^ gmul(col[1], 3) ^ col[2] ^ col[3];
            s[i4+1] = col[0] ^ gmul(col[1], 2) ^ gmul(col[2], 3) ^ col[3];
            s[i4+2] = col[0] ^ col[1] ^ gmul(col[2], 2) ^ gmul(col[3], 3);
            s[i4+3] = gmul(col[0], 3) ^ col[1] ^ col[2] ^ gmul(col[3], 2);
        }
    }

    _inv_mix_columns(s) {
        for (let i = 0; i < 4; i++) {
            const i4 = i * 4;
            const col = s.slice(i4, i4 + 4);
            s[i4]   = gmul(col[0], 0x0e) ^ gmul(col[1], 0x0b) ^ gmul(col[2], 0x0d) ^ gmul(col[3], 0x09);
            s[i4+1] = gmul(col[0], 0x09) ^ gmul(col[1], 0x0e) ^ gmul(col[2], 0x0b) ^ gmul(col[3], 0x0d);
            s[i4+2] = gmul(col[0], 0x0d) ^ gmul(col[1], 0x09) ^ gmul(col[2], 0x0e) ^ gmul(col[3], 0x0b);
            s[i4+3] = gmul(col[0], 0x0b) ^ gmul(col[1], 0x0d) ^ gmul(col[2], 0x09) ^ gmul(col[3], 0x0e);
        }
    }

    encrypt_block(plaintext) {
        const state = Array.from(plaintext);
        const R0 = this.round_keys.slice(0, 16);
        this._add_round_key(state, R0);
        
        for (let i = 1; i < this.rounds; i++) {
            const Ri = this.round_keys.slice(i*16, (i+1)*16);
            this._sub_bytes(state);
            this._shift_rows(state);
            this._mix_columns(state);
            this._add_round_key(state, Ri);
        }
        
        this._sub_bytes(state);
        this._shift_rows(state);
        const R_final = this.round_keys.slice(this.rounds*16);
        this._add_round_key(state, R_final);
        
        return new Uint8Array(state);
    }

    decrypt_block(ciphertext) {
        const state = Array.from(ciphertext);
        const R_final = this.round_keys.slice(this.rounds*16);
        this._add_round_key(state, R_final);
        
        for (let i = this.rounds - 1; i > 0; i--) {
            const Ri = this.round_keys.slice(i*16, (i+1)*16);
            this._inv_shift_rows(state);
            this._inv_sub_bytes(state);
            this._add_round_key(state, Ri);
            this._inv_mix_columns(state);
        }
        
        this._inv_shift_rows(state);
        this._inv_sub_bytes(state);
        const R0 = this.round_keys.slice(0, 16);
        this._add_round_key(state, R0);
        
        return new Uint8Array(state);
    }
}

// Hàm chung để tạo IV ngẫu nhiên (sử dụng Web Crypto API)
function generateRandomIV() {
    return window.crypto.getRandomValues(new Uint8Array(BLOCK_SIZE));
}

/**
 * Hàm chính để chạy AES Encryption/Decryption.
 * @param {string} action - 'enc' hoặc 'dec'
 * @param {string} keyStr - Khóa dưới dạng chuỗi (Text)
 * @param {string} mode - 'ECB' hoặc 'CBC'
 * @param {string} ivHex - IV dưới dạng chuỗi Hex (tùy chọn)
 * @param {Uint8Array} inputBytes - Dữ liệu đầu vào (plaintext/ciphertext)
 * @param {number} keySize - Độ dài khóa mong muốn (16, 24, 32)
 * @returns {object} - { result: Uint8Array (ciphertext/plaintext), ivDisplay: string/null }
 */
export function runAES(action, keyStr, mode, ivHex, inputBytes, keySize) {
    if (!inputBytes || inputBytes.length === 0) {
        throw new Error("Input data is empty.");
    }
    
    // 1. Chuyển đổi Key 
    const keyBytes = Utils.strToBytes(keyStr); 
    
    // 2. Khởi tạo AES
    const aes = new AES_Manual(keyBytes);

    // 3. Xử lý IV
    let ivBytes = null;
    let ivIsGenerated = false;
    let ivDisplay = null;

    if (ivHex) {
        ivBytes = Utils.hexToBytes(ivHex);
        if (ivBytes.length !== BLOCK_SIZE) {
            throw new Error(`IV must be exactly ${BLOCK_SIZE} bytes (32 Hex characters).`);
        }
    }
    
    // --- MÃ HÓA (ENCRYPT) ---
    if (action === 'enc') {
        let padded = Utils.padPKCS7(inputBytes, BLOCK_SIZE);
        let blocks = [];
        for (let i = 0; i < padded.length; i += BLOCK_SIZE) {
            blocks.push(padded.slice(i, i + BLOCK_SIZE));
        }
        
        let result = [];
        
        if (mode === 'ECB') {
            for (const block of blocks) {
                result.push(aes.encrypt_block(block));
            }
            return { result: Utils.concatBytes(result), ivDisplay: null };
        } 
        
        if (mode === 'CBC') {
            if (!ivBytes) {
                ivBytes = generateRandomIV();
                ivIsGenerated = true;
                ivDisplay = Utils.bytesToHex(ivBytes).toUpperCase();
            }
            
            let vector = ivBytes;
            for (const block of blocks) {
                const chain = Utils.xorBytes(block, vector);
                const enc = aes.encrypt_block(chain);
                result.push(enc);
                vector = enc;
            }
            
            // Gắn IV vào đầu ciphertext (LUÔN LUÔN khi mã hóa CBC)
            const ciphertextWithIV = Utils.concatBytes([ivBytes].concat(result));
            
            // Trả về ciphertext đã gắn IV và IV để hiển thị trên ô input
            return { result: ciphertextWithIV, ivDisplay: ivDisplay };
        }
        
        throw new Error("Encryption Mode not supported: " + mode);

    // --- GIẢI MÃ (DECRYPT) ---
    } else if (action === 'dec') {
        let actualCiphertext;
        
        if (mode === 'ECB') {
            actualCiphertext = inputBytes;
        } else if (mode === 'CBC') {
            if (inputBytes.length < BLOCK_SIZE) {
                throw new Error("Ciphertext too short for CBC (needs 1 block).");
            }
            
            let finalIV;
            if (ivBytes) {
                finalIV = ivBytes;

                // Nếu ciphertext bắt đầu bằng IV → loại bỏ 
                if (Utils.bytesToHex(inputBytes.slice(0, BLOCK_SIZE)).toUpperCase() === Utils.bytesToHex(ivBytes).toUpperCase()) {
                    actualCiphertext = inputBytes.slice(BLOCK_SIZE);
                } else {
                    actualCiphertext = inputBytes;
                }
            }
 
            else {
                // Tách IV từ đầu Ciphertext (chỉ khi người dùng không nhập IV)
                finalIV = inputBytes.slice(0, BLOCK_SIZE);
                actualCiphertext = inputBytes.slice(BLOCK_SIZE);
                ivDisplay = Utils.bytesToHex(finalIV).toUpperCase(); // Lưu IV được tách ra để hiển thị
            }
            ivBytes = finalIV; 
        } else {
             throw new Error("Decryption Mode not supported: " + mode);
        }

        if (actualCiphertext.length % BLOCK_SIZE !== 0) {
            throw new Error("Ciphertext length must be a multiple of the block size.");
        }
        
        let blocks = [];
        for (let i = 0; i < actualCiphertext.length; i += BLOCK_SIZE) {
            blocks.push(actualCiphertext.slice(i, i + BLOCK_SIZE));
        }

        let result = [];

        if (mode === 'ECB') {
            for (const block of blocks) {
                result.push(aes.decrypt_block(block));
            }
        } else if (mode === 'CBC') {
            let vector = ivBytes;
            for (const block of blocks) {
                const dec = aes.decrypt_block(block);
                const plain = Utils.xorBytes(dec, vector);
                result.push(plain);
                vector = block;
            }
        }
        
        let decryptedBytes = Utils.concatBytes(result);
        
        try {
            const finalPlaintext = Utils.unpadPKCS7(decryptedBytes);
            
            // Trả về plaintext và IV được tách ra để hiển thị trên ô input (nếu chưa nhập)
            return { result: finalPlaintext, ivDisplay: ivDisplay }; 

        } catch (e) {
            throw new Error("Decryption failed (Invalid Key/IV/Padding).");
        }
    }
    
    throw new Error("Invalid action: must be 'enc' or 'dec'");
}