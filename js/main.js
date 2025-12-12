import * as Utils from './utils.js';
import { solveCaesar } from './algorithms/caesar.js';
import { solveSubstitution, loadQuadgramsData, isQuadgramsLoaded } from './algorithms/substitution.js';
import { solveVigenere } from './algorithms/vigenere.js';
import { runDES } from './algorithms/des.js';
import { runAES } from './algorithms/aes.js';

// --- State & UI Managers ---
let rawOutputBytes = new Uint8Array(0);

// UI Templates
const TaskUI = {
    task1: `
        <h2 class="text-xl font-bold mb-4 text-blue-300">Task 1: Caesar Cipher Analysis</h2>
        <div class="grid gap-4">
            <div>
                <label class="block text-sm font-medium mb-1">Input Ciphertext</label>
                <div class="flex flex-col gap-2">
                    <input type="file" id="t1-file-input" accept=".txt" class="text-xs">
                    <textarea id="t1-input" class="w-full bg-gray-700 rounded p-2 text-sm font-mono h-32" placeholder="Hoặc nhập trực tiếp vào đây..."></textarea>
                </div>
            </div>
            <button id="btn-run-task1" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold w-full">Analyze & Solve</button>
        </div>
    `,
    task2: `
        <h2 class="text-xl font-bold mb-4 text-blue-300">Task 2: Substitution Hill Climbing</h2>
        <div class="grid gap-4">
            <div class="bg-yellow-900/30 p-3 rounded border border-yellow-700/50 text-sm text-yellow-200">
                <strong>Lưu ý:</strong> Cần file <code>english_quadgrams.txt</code> để đạt kết quả tốt nhất.
                <input type="file" id="t2-quadfile" class="mt-2 text-xs">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Input Ciphertext</label>
                <div class="flex flex-col gap-2">
                    <input type="file" id="t2-file-input" accept=".txt" class="text-xs">
                    <textarea id="t2-input" class="w-full bg-gray-700 rounded p-2 text-sm font-mono h-32" placeholder="Hoặc nhập trực tiếp vào đây..."></textarea>
                </div>
            </div>
            <div class="flex gap-4">
                <div class="w-1/2">
                    <label class="block text-xs mb-1">Iterations (per Restart)</label>
                    <input type="number" id="t2-iter" value="1000" class="w-full bg-gray-700 rounded p-2">
                </div>
                <div class="w-1/2">
                    <label class="block text-xs mb-1">Restarts</label>
                    <input type="number" id="t2-rest" value="5" class="w-full bg-gray-700 rounded p-2">
                </div>
            </div>
            <button id="btn-run-task2" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold w-full">Start Hill Climbing</button>
            <div id="t2-progress" class="text-xs font-mono text-gray-400 h-4"></div>
        </div>
    `,
    task3: `
        <h2 class="text-xl font-bold mb-4 text-blue-300">Task 3: Vigenère Analysis</h2>
        <div class="grid gap-4">
            <div>
                <label class="block text-sm font-medium mb-1">Input Ciphertext</label>
                <div class="flex flex-col gap-2">
                    <input type="file" id="t3-file-input" accept=".txt" class="text-xs">
                    <textarea id="t3-input" class="w-full bg-gray-700 rounded p-2 text-sm font-mono h-32" placeholder="Hoặc nhập trực tiếp vào đây..."></textarea>
                </div>
            </div>
            <div class="flex gap-4">
                <div class="w-1/2">
                    <label class="block text-xs mb-1">Max Key Length Prediction</label>
                    <input type="number" id="t3-maxlen" value="20" class="w-full bg-gray-700 rounded p-2">
                </div>
            </div>
            <button id="btn-run-task3" class="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold w-full">Analyze Key & Decrypt</button>
        </div>
    `,
    task4: `
        <h2 class="text-xl font-bold mb-4 text-blue-300">Task 4: DES (Manual Implementation)</h2>
        <div class="grid md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium mb-1">Mode</label>
                <select id="t4-mode" class="w-full bg-gray-700 rounded p-2">
                    <option value="ECB">ECB</option>
                    <option value="CBC">CBC</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Action</label>
                <div class="flex gap-2">
                    <button id="btn-t4-enc" class="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded">Encrypt</button>
                    <button id="btn-t4-dec" class="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded">Decrypt</button>
                </div>
            </div>
        </div>
        <div>
            <label class="block text-sm font-medium mb-1">Key (8 characters / 8 bytes)</label>
            <input type="text" id="t4-key" class="w-full bg-gray-700 rounded p-2 font-mono" placeholder="SecretK1">
        </div>
        <div>
            <label class="block text-sm font-medium mb-1">IV (Hex - 16 chars) <span class="text-xs text-gray-400">(Tự sinh nếu để trống cho CBC)</span></label>
            <input type="text" id="t4-iv" class="w-full bg-gray-700 rounded p-2 font-mono" placeholder="Không dùng IV cho ECB">
        </div>
        <div>
            <label class="block text-sm font-medium mb-1">Input Data</label>
            <div class="flex mb-1 items-center">
                <select id="t4-input-fmt" class="bg-gray-800 text-xs border border-gray-600 rounded mr-2">
                    <option value="text">Text</option>
                    <option value="hex">Hex</option>
                    <option value="base64">Base64</option>
                </select>
                <span class="text-xs pt-1 text-gray-500">Input Format |</span>
                <input type="file" id="t4-file-input" class="text-xs ml-2">
            </div>
            <textarea id="t4-input" class="w-full bg-gray-700 rounded p-2 text-sm font-mono h-24"></textarea>
        </div>
    `,
    task5: `
        <h2 class="text-xl font-bold mb-4 text-blue-300">Task 5: AES (Manual Implementation)</h2>
        <div class="grid md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium mb-1">Mode</label>
                <select id="t5-mode" class="w-full bg-gray-700 rounded p-2">
                    <option value="ECB">ECB</option>
                    <option value="CBC">CBC</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Action</label>
                <div class="flex gap-2">
                    <button id="btn-t5-enc" class="flex-1 bg-red-600 hover:bg-red-500 py-2 rounded">Encrypt</button>
                    <button id="btn-t5-dec" class="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded">Decrypt</button>
                </div>
            </div>
        </div>
        
        <div class="grid md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium mb-1">Key Size</label>
                <select id="t5-key-size" class="w-full bg-gray-700 rounded p-2">
                    <option value="16">AES-128 (16 bytes)</option>
                    <option value="24">AES-192 (24 bytes)</option>
                    <option value="32">AES-256 (32 bytes)</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Key (<span id="t5-key-chars">16</span> chars)</label>
                <input type="text" id="t5-key" class="w-full bg-gray-700 rounded p-2 font-mono" placeholder="Key gồm 16 ký tự/bytes">
            </div>
        </div>
        
        <div>
            <label class="block text-sm font-medium mb-1">IV (Hex - 32 chars) <span class="text-xs text-gray-400">(Tự sinh nếu để trống cho CBC)</span></label>
            <input type="text" id="t5-iv" class="w-full bg-gray-700 rounded p-2 font-mono" placeholder="Không dùng IV cho ECB">
        </div>
        <div>
            <label class="block text-sm font-medium mb-1">Input Data</label>
            <div class="flex mb-1 items-center">
                <select id="t5-input-fmt" class="bg-gray-800 text-xs border border-gray-600 rounded mr-2">
                    <option value="text">Text</option>
                    <option value="hex">Hex</option>
                    <option value="base64">Base64</option>
                </select>
                <span class="text-xs pt-1 text-gray-500">Input Format |</span>
                <input type="file" id="t5-file-input" class="text-xs ml-2">
            </div>
            <textarea id="t5-input" class="w-full bg-gray-700 rounded p-2 text-sm font-mono h-24"></textarea>
        </div>
    `
};

// --- Helper Functions for Main ---

function attachFileInputListener(fileInputId, targetTextareaId) {
    document.getElementById(fileInputId).addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        
        reader.onload = function(evt) {
            document.getElementById(targetTextareaId).value = evt.target.result;
            setStatus(`Loaded file: ${file.name}`);
        };
        
        reader.readAsText(file); 
    });
}

function setStatus(msg) { document.getElementById('status-bar').innerText = msg; }

function autoDetectAndConvertInput(inputStr) {
    const trimmed = inputStr.trim();

    // ---- Detect HEX ----
    if (/^[0-9A-Fa-f]+$/.test(trimmed) && trimmed.length % 2 === 0) {
        try {
            return Utils.hexToBytes(trimmed);
        } catch (_) {}
    }

    // ---- Detect BASE64 ----
    if (/^[A-Za-z0-9+/]+={0,2}$/.test(trimmed) && trimmed.length % 4 === 0) {
        try {
            return Utils.base64ToBytes(trimmed);
        } catch (_) {}
    }

    // ---- Default: TEXT ----
    return Utils.strToBytes(trimmed);
}

function getInputBytes(elementId, formatId) {
    const val = document.getElementById(elementId).value;
    const format = formatId ? document.getElementById(formatId).value : 'text';
    if(!val) return null;
    try {
        if(format === 'hex') return Utils.hexToBytes(val);
        if(format === 'base64') return Utils.base64ToBytes(val);
        return Utils.strToBytes(val);
    } catch(e) {
        alert("Input Error: " + e.message);
        return null;
    }
}

function updateOutputDisplay() {
    const format = document.getElementById('output-format').value;
    const el = document.getElementById('main-output');
    
    // Xóa IV header nếu người dùng đổi format
    if(el.value.includes('[IV/Vector]')) {
         el.value = "";
    }
    
    if(rawOutputBytes.length === 0) { 
        el.value = "";
        return; 
    } 
    
    try {
        let content;
        if(format === 'hex') content = Utils.bytesToHex(rawOutputBytes);
        else if(format === 'base64') content = Utils.bytesToBase64(rawOutputBytes);
        else content = Utils.bytesToStr(rawOutputBytes);
        
        el.value = content;

    } catch (e) {
        el.value = "[Cannot display as UTF-8. Showing Hex instead]\n" + Utils.bytesToHex(rawOutputBytes);
    }
}

// --- Event Handlers Setup ---
function handleDownload() {
    if (rawOutputBytes.length === 0) {
        alert("Không có dữ liệu đầu ra để tải về.");
        return;
    }
    
    const outputText = document.getElementById('main-output').value;

    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = 'crypt_result.txt'; 
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus("File downloaded.");
}

function attachCommonListeners() {
    document.getElementById('btn-copy').addEventListener('click', () => {
        document.getElementById('main-output').select();
        document.execCommand('copy');
        setStatus("Copied!");
    });
    
    document.getElementById('btn-clear').addEventListener('click', () => {
        rawOutputBytes = new Uint8Array(0);
        document.getElementById('main-output').value = ""; 
        setStatus("Cleared.");
    });
    document.getElementById('btn-download').addEventListener('click', handleDownload);
    document.getElementById('output-format').addEventListener('change', updateOutputDisplay);
}

// Hàm mới: Quản lý trạng thái IV input (Yêu cầu 2)
function updateIVInputState(task) {
    const modeEl = document.getElementById(`t${task.slice(-1)}-mode`);
    const ivEl = document.getElementById(`t${task.slice(-1)}-iv`);
    if (!modeEl || !ivEl) return;

    modeEl.addEventListener('change', () => {
        const isECB = modeEl.value === 'ECB';
        ivEl.disabled = isECB;
        ivEl.placeholder = isECB ? "Không dùng IV cho ECB" : "Để trống để tự sinh";
        if (isECB) {
            ivEl.value = ""; 
        }
    });
    modeEl.dispatchEvent(new Event('change'));
}


function attachTaskListeners(task) {
    if(task === 'task1') {
        document.getElementById('btn-run-task1').addEventListener('click', () => {
            try {
                const input = document.getElementById('t1-input').value;
                const result = solveCaesar(input); 
                rawOutputBytes = result;
                updateOutputDisplay();
                setStatus("Task 1 Done.");
            } catch(e) { alert(e.message); }
        });
        attachFileInputListener('t1-file-input', 't1-input');
    }

    if(task === 'task2') {
        // Quadgram Loader
        document.getElementById('t2-quadfile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(evt) {
                const count = loadQuadgramsData(evt.target.result);
                alert(`Loaded ${count} quadgrams.`);
            };
            reader.readAsText(file);
            
        });

        document.getElementById('btn-run-task2').addEventListener('click', async () => {
            try {
                const input = document.getElementById('t2-input').value;
                const iter = parseInt(document.getElementById('t2-iter').value);
                const rest = parseInt(document.getElementById('t2-rest').value);
                const btn = document.getElementById('btn-run-task2');
                const prog = document.getElementById('t2-progress');

                if(!isQuadgramsLoaded()) alert("Warning: Using minimal default quadgrams.");

                btn.disabled = true;
                btn.innerHTML = '<span class="loading-spinner"></span> Running...';

                const result = await solveSubstitution(input, iter, rest, (msg) => {
                    prog.innerText = msg;
                });

                rawOutputBytes = result;
                updateOutputDisplay();
                setStatus("Task 2 Done.");
            } catch(e) { alert(e.message); } 
            finally {
                const btn = document.getElementById('btn-run-task2');
                btn.disabled = false;
                btn.innerText = "Start Hill Climbing";
            }
        });
        attachFileInputListener('t2-file-input', 't2-input');
    }

    if(task === 'task3') {
        document.getElementById('btn-run-task3').addEventListener('click', () => {
            try {
                const input = document.getElementById('t3-input').value;
                const maxLen = parseInt(document.getElementById('t3-maxlen').value);
                const result = solveVigenere(input, maxLen);
                rawOutputBytes = result;
                updateOutputDisplay();
                setStatus("Task 3 Done.");
            } catch(e) { alert(e.message); }
        });
        attachFileInputListener('t3-file-input', 't3-input');
    }

    if(task === 'task4') {
        updateIVInputState('task4'); 
        
        ['enc', 'dec'].forEach(action => {
            document.getElementById(`btn-t4-${action}`).addEventListener('click', () => {
                try {
                    const key = document.getElementById('t4-key').value;
                    const mode = document.getElementById('t4-mode').value;
                    const iv = document.getElementById('t4-iv').value;
                    //const input = getInputBytes('t4-input', 't4-input-fmt');
                    const raw = document.getElementById('t4-input').value;
                    if (!raw.trim()) throw new Error("Input is empty.");
                    const input = autoDetectAndConvertInput(raw);

                    if (key.length !== 8) {
                        throw new Error(`Key DES phải đúng 8 ký tự/bytes.`);
                    }

                    // runDES trả về { result: Uint8Array, ivDisplay: string/null }
                    const output = runDES(action, key, mode, iv, input);
                    
                    const ivEl = document.getElementById('t4-iv');

                    // Gán IV tự sinh/tách ra vào ô input IV (Yêu cầu mới)
                    if (output.ivDisplay) {
                        ivEl.value = output.ivDisplay;
                    }
                    
                    rawOutputBytes = output.result;
                    updateOutputDisplay();
                    setStatus(`Task 4 ${action} Done.`);
                } catch(e) { alert(e.message); }
            });
        });
        attachFileInputListener('t4-file-input', 't4-input');
    }

    if(task === 'task5') {
        updateIVInputState('task5'); 

        document.getElementById('t5-key-size').addEventListener('change', (e) => {
            const size = parseInt(e.target.value);
            document.getElementById('t5-key-chars').innerText = size;
            document.getElementById('t5-key').placeholder = `Key gồm ${size} ký tự/bytes`;
        });
        document.getElementById('t5-key-size').dispatchEvent(new Event('change'));

        ['enc', 'dec'].forEach(action => {
            document.getElementById(`btn-t5-${action}`).addEventListener('click', () => {
                try {
                    const key = document.getElementById('t5-key').value;
                    const mode = document.getElementById('t5-mode').value;
                    const iv = document.getElementById('t5-iv').value;
                    //const input = getInputBytes('t5-input', 't5-input-fmt');
                    const raw = document.getElementById('t5-input').value;
                    if (!raw.trim()) throw new Error("Input is empty.");
                    const input = autoDetectAndConvertInput(raw);

                    const keySize = parseInt(document.getElementById('t5-key-size').value);
                    
                    if (key.length !== keySize) {
                        throw new Error(`Key length must be ${keySize} characters for AES-${keySize * 8}.`);
                    }
                    
                    const output = runAES(action, key, mode, iv, input, keySize);
                    
                    const ivEl = document.getElementById('t5-iv');
                    
                    // Gán IV tự sinh/tách ra vào ô input IV (Yêu cầu mới)
                    if (output.ivDisplay) {
                         ivEl.value = output.ivDisplay;
                    }

                    rawOutputBytes = output.result;
                    updateOutputDisplay();
                    setStatus(`Task 5 ${action} Done.`);
                } catch(e) { alert(e.message); }
            });
        });
        attachFileInputListener('t5-file-input', 't5-input');
    }
}

function switchTab(task) {
    document.getElementById('content-area').innerHTML = TaskUI[task];
    attachTaskListeners(task);
    
    rawOutputBytes = new Uint8Array(0);
    document.getElementById('main-output').value = ""; 
    setStatus("Switched to " + task);
}

// --- Init (Cập nhật để dùng dropdown mới - Yêu cầu 5) ---
document.addEventListener('DOMContentLoaded', () => {
    const taskSelector = document.getElementById('main-task-selector');
    
    taskSelector.addEventListener('change', (e) => switchTab(e.target.value));

    attachCommonListeners();
    taskSelector.value = 'task1';
    switchTab('task1');
});