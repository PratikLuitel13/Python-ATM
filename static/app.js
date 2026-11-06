// Python ATM System - Client Controller

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playKeyBeep(freq = 850) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playSuccess() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

            gain.gain.setValueAtTime(0.1, this.ctx.currentTime + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(this.ctx.currentTime + idx * 0.08);
            osc.stop(this.ctx.currentTime + idx * 0.08 + 0.2);
        });
    }

    playError() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, this.ctx.currentTime);
        osc.frequency.setValueAtTime(120, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.25);
    }

    playDispense() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        // Cash counting whirring sound simulation
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                this.playKeyBeep(320 + i * 40);
            }, i * 70);
        }
    }
}

const sound = new SoundEngine();

// App State
const state = {
    currentScreen: 'welcome',
    pinInput: '',
    cardInserted: true,
    activePinField: 'current',
    currentReceipt: null
};

// DOM Elements
const elements = {
    liveClock: document.getElementById('liveClock'),
    soundToggle: document.getElementById('soundToggle'),
    soundIcon: document.getElementById('soundIcon'),
    resetAtmBtn: document.getElementById('resetAtmBtn'),
    
    // Screens
    views: {
        welcome: document.getElementById('viewWelcome'),
        blocked: document.getElementById('viewBlocked'),
        mainMenu: document.getElementById('viewMainMenu'),
        balance: document.getElementById('viewBalance'),
        withdraw: document.getElementById('viewWithdraw'),
        deposit: document.getElementById('viewDeposit'),
        statement: document.getElementById('viewStatement'),
        changePin: document.getElementById('viewChangePin'),
        goodbye: document.getElementById('viewGoodbye')
    },

    // Welcome PIN
    pinDots: document.getElementById('pinDots'),
    pinAlert: document.getElementById('pinAlert'),
    pinAlertMsg: document.getElementById('pinAlertMsg'),
    unblockBtn: document.getElementById('unblockBtn'),

    // Main Menu Buttons
    btnMenuBalance: document.getElementById('btnMenuBalance'),
    btnMenuWithdraw: document.getElementById('btnMenuWithdraw'),
    btnMenuDeposit: document.getElementById('btnMenuDeposit'),
    btnMenuStatement: document.getElementById('btnMenuStatement'),
    btnMenuChangePin: document.getElementById('btnMenuChangePin'),
    btnMenuLogout: document.getElementById('btnMenuLogout'),
    menuExitBtn: document.getElementById('menuExitBtn'),

    // Balance
    balanceDisplayAmount: document.getElementById('balanceDisplayAmount'),
    backFromBalance: document.getElementById('backFromBalance'),
    withdrawFromBalance: document.getElementById('withdrawFromBalance'),

    // Withdraw
    withdrawAvailBal: document.getElementById('withdrawAvailBal'),
    withdrawCustomInput: document.getElementById('withdrawCustomInput'),
    withdrawAlert: document.getElementById('withdrawAlert'),
    withdrawAlertMsg: document.getElementById('withdrawAlertMsg'),
    backFromWithdraw: document.getElementById('backFromWithdraw'),
    confirmWithdrawBtn: document.getElementById('confirmWithdrawBtn'),
    presetWithdrawBtns: document.querySelectorAll('.preset-btn'),

    // Deposit
    depositAvailBal: document.getElementById('depositAvailBal'),
    depositCustomInput: document.getElementById('depositCustomInput'),
    depositAlert: document.getElementById('depositAlert'),
    depositAlertMsg: document.getElementById('depositAlertMsg'),
    backFromDeposit: document.getElementById('backFromDeposit'),
    confirmDepositBtn: document.getElementById('confirmDepositBtn'),
    presetDepositBtns: document.querySelectorAll('.deposit-preset-btn'),

    // Statements
    receiptTime: document.getElementById('receiptTime'),
    receiptTxList: document.getElementById('receiptTxList'),
    receiptBalance: document.getElementById('receiptBalance'),
    backFromStatement: document.getElementById('backFromStatement'),
    printStatementBtn: document.getElementById('printStatementBtn'),

    // Change PIN
    inputCurrentPin: document.getElementById('inputCurrentPin'),
    inputNewPin: document.getElementById('inputNewPin'),
    inputConfirmPin: document.getElementById('inputConfirmPin'),
    changePinAlert: document.getElementById('changePinAlert'),
    changePinAlertMsg: document.getElementById('changePinAlertMsg'),
    backFromChangePin: document.getElementById('backFromChangePin'),
    submitChangePinBtn: document.getElementById('submitChangePinBtn'),

    // Hardware
    dispenserSlot: document.getElementById('dispenserSlot'),
    dispensedCash: document.getElementById('dispensedCash'),
    receiptSlot: document.getElementById('receiptSlot'),
    printedPaper: document.getElementById('printedPaper'),
    atmCard: document.getElementById('atmCard'),
    insertCardBtn: document.getElementById('insertCardBtn'),

    // Thermal Receipt Modal
    receiptModalBackdrop: document.getElementById('receiptModalBackdrop'),
    closeReceiptModalBtn: document.getElementById('closeReceiptModalBtn'),
    collectReceiptModalBtn: document.getElementById('collectReceiptModalBtn'),
    printThermalReceiptBtn: document.getElementById('printThermalReceiptBtn'),
    rDateVal: document.getElementById('rDateVal'),
    rRefVal: document.getElementById('rRefVal'),
    rTypeVal: document.getElementById('rTypeVal'),
    rAmountRow: document.getElementById('rAmountRow'),
    rAmountVal: document.getElementById('rAmountVal'),
    rBalRow: document.getElementById('rBalRow'),
    rBalanceVal: document.getElementById('rBalanceVal'),
    rStatusVal: document.getElementById('rStatusVal'),
    rCustomTxList: document.getElementById('rCustomTxList'),

    // Goodbye
    goodbyeCountdown: document.getElementById('goodbyeCountdown'),
    returnHomeNow: document.getElementById('returnHomeNow'),

    // Keypad
    keypadBtns: document.querySelectorAll('.key-btn'),
    toastContainer: document.getElementById('toastContainer')
};

// Clock Update
function updateClock() {
    const now = new Date();
    elements.liveClock.textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Switch Screen View
function switchView(viewName) {
    Object.keys(elements.views).forEach(key => {
        elements.views[key].classList.remove('active');
    });

    if (elements.views[viewName]) {
        elements.views[viewName].classList.add('active');
        state.currentScreen = viewName;
    }

    // Reset error alerts on view switch
    elements.pinAlert.classList.add('hidden');
    elements.withdrawAlert.classList.add('hidden');
    elements.depositAlert.classList.add('hidden');
    elements.changePinAlert.classList.add('hidden');

    // Auto set focus if needed
    if (viewName === 'withdraw') {
        elements.withdrawCustomInput.focus();
    } else if (viewName === 'deposit') {
        elements.depositCustomInput.focus();
    } else if (viewName === 'changePin') {
        state.activePinField = 'current';
        elements.inputCurrentPin.focus();
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️');
    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Update PIN Dots in Welcome View
function updatePinDots() {
    const dots = elements.pinDots.querySelectorAll('.pin-dot');
    dots.forEach((dot, index) => {
        if (index < state.pinInput.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    });
}

// Highlight on-screen keypad key
function highlightKeypadBtn(key) {
    elements.keypadBtns.forEach(btn => {
        if (btn.getAttribute('data-key') === String(key)) {
            btn.classList.add('pressed');
            setTimeout(() => btn.classList.remove('pressed'), 120);
        }
    });
}

// Get active Change PIN Input element
function getActiveChangePinInput() {
    if (state.activePinField === 'confirm') return elements.inputConfirmPin;
    if (state.activePinField === 'new') return elements.inputNewPin;
    return elements.inputCurrentPin;
}

// Handle On-Screen Keypad Button Clicks
function handleKeypadButtonClick(key) {
    sound.playKeyBeep();
    highlightKeypadBtn(key);

    // 1. Welcome Screen
    if (state.currentScreen === 'welcome') {
        if (key >= '0' && key <= '9') {
            if (state.pinInput.length < 4) {
                state.pinInput += key;
                updatePinDots();
                if (state.pinInput.length === 4) {
                    setTimeout(submitPinAuth, 250);
                }
            }
        } else if (key === 'CLEAR') {
            if (state.pinInput.length > 0) {
                state.pinInput = state.pinInput.slice(0, -1);
                updatePinDots();
            }
        } else if (key === 'CANCEL') {
            state.pinInput = '';
            updatePinDots();
            elements.pinAlert.classList.add('hidden');
            showToast('PIN entry cleared.', 'info');
        } else if (key === 'ENTER') {
            if (state.pinInput.length === 4) {
                submitPinAuth();
            } else {
                elements.pinAlertMsg.textContent = 'Please enter all 4 digits.';
                elements.pinAlert.classList.remove('hidden');
                sound.playError();
            }
        }
        return;
    }

    // 2. Main Menu Shortcuts
    if (state.currentScreen === 'mainMenu') {
        if (key === '1') loadBalanceView();
        else if (key === '2') loadWithdrawView();
        else if (key === '3') loadDepositView();
        else if (key === '4') loadStatementsView();
        else if (key === '5') switchView('changePin');
        else if (key === '6' || key === 'CANCEL') handleLogout();
        return;
    }

    // 3. Withdrawal Screen
    if (state.currentScreen === 'withdraw') {
        if (key >= '0' && key <= '9') {
            elements.withdrawCustomInput.value += key;
        } else if (key === '.') {
            if (!elements.withdrawCustomInput.value.includes('.')) {
                elements.withdrawCustomInput.value += '.';
            }
        } else if (key === 'CLEAR') {
            elements.withdrawCustomInput.value = elements.withdrawCustomInput.value.slice(0, -1);
        } else if (key === 'CANCEL') {
            elements.withdrawCustomInput.value = '';
            elements.withdrawAlert.classList.add('hidden');
        } else if (key === 'ENTER') {
            handleWithdraw();
        }
        return;
    }

    // 4. Deposit Screen
    if (state.currentScreen === 'deposit') {
        if (key >= '0' && key <= '9') {
            elements.depositCustomInput.value += key;
        } else if (key === '.') {
            if (!elements.depositCustomInput.value.includes('.')) {
                elements.depositCustomInput.value += '.';
            }
        } else if (key === 'CLEAR') {
            elements.depositCustomInput.value = elements.depositCustomInput.value.slice(0, -1);
        } else if (key === 'CANCEL') {
            elements.depositCustomInput.value = '';
            elements.depositAlert.classList.add('hidden');
        } else if (key === 'ENTER') {
            handleDeposit();
        }
        return;
    }

    // 5. Change PIN Screen
    if (state.currentScreen === 'changePin') {
        const input = getActiveChangePinInput();
        if (key >= '0' && key <= '9') {
            if (input.value.length < 4) {
                input.value += key;
                if (input.value.length === 4) {
                    if (input === elements.inputCurrentPin) {
                        state.activePinField = 'new';
                        elements.inputNewPin.focus();
                    } else if (input === elements.inputNewPin) {
                        state.activePinField = 'confirm';
                        elements.inputConfirmPin.focus();
                    }
                }
            }
        } else if (key === 'CLEAR') {
            input.value = input.value.slice(0, -1);
        } else if (key === 'CANCEL') {
            elements.inputCurrentPin.value = '';
            elements.inputNewPin.value = '';
            elements.inputConfirmPin.value = '';
            state.activePinField = 'current';
            elements.inputCurrentPin.focus();
            elements.changePinAlert.classList.add('hidden');
        } else if (key === 'ENTER') {
            handleChangePin();
        }
        return;
    }

    // 6. Other Screens
    if (key === 'CANCEL' || key === 'CLEAR') {
        if (state.currentScreen === 'blocked') {
            handleResetATM();
        } else if (state.currentScreen !== 'goodbye') {
            switchView('mainMenu');
        }
    }
}

// Generate and Print Transaction Slip from Receipt Slot
function generateAndEjectReceipt(details) {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    const randomRef = '#TXN-' + Math.floor(100000 + Math.random() * 900000);

    state.currentReceipt = {
        date: formattedDate,
        refNo: randomRef,
        type: details.type || 'TRANSACTION',
        amount: details.amount || null,
        balance: details.balance || null,
        status: details.status || 'APPROVED (000)',
        transactions: details.transactions || null
    };

    sound.playDispense();
    elements.printedPaper.innerHTML = '📄 RECEIPT (Click to View)';
    elements.printedPaper.classList.add('active');

    showToast(`📄 Receipt for ${details.type} printed! Click the receipt slot to view.`, 'info');
}

// Open Interactive Receipt Viewer Modal
function openReceiptModal() {
    if (!state.currentReceipt) return;

    sound.playKeyBeep(720);
    const r = state.currentReceipt;

    if (elements.rDateVal) elements.rDateVal.textContent = r.date;
    if (elements.rRefVal) elements.rRefVal.textContent = r.refNo;
    if (elements.rTypeVal) elements.rTypeVal.textContent = r.type;

    if (elements.rAmountRow) {
        if (r.amount) {
            elements.rAmountRow.style.display = 'flex';
            if (elements.rAmountVal) elements.rAmountVal.textContent = r.amount;
        } else {
            elements.rAmountRow.style.display = 'none';
        }
    }

    if (elements.rBalRow) {
        if (r.balance) {
            elements.rBalRow.style.display = 'flex';
            if (elements.rBalanceVal) elements.rBalanceVal.textContent = r.balance;
        } else {
            elements.rBalRow.style.display = 'none';
        }
    }

    if (elements.rCustomTxList) {
        elements.rCustomTxList.innerHTML = '';
        if (r.transactions && r.transactions.length > 0) {
            let html = '<div class="t-tx-header">RECENT TRANSACTIONS:</div>';
            r.transactions.forEach(t => {
                html += `<div class="t-row t-sub-row"><span>${t.desc}</span><span>[${t.type}]</span></div>`;
            });
            elements.rCustomTxList.innerHTML = html;
            elements.rCustomTxList.style.display = 'flex';
        } else {
            elements.rCustomTxList.style.display = 'none';
        }
    }

    if (elements.receiptModalBackdrop) {
        elements.receiptModalBackdrop.classList.remove('hidden');
    }
}

// Close Interactive Receipt Viewer Modal
// Once the receipt is viewed (modal opened and closed for any reason),
// it disappears from the slot — ready for the next transaction's receipt.
function closeReceiptModal(collect = false) {
    if (elements.receiptModalBackdrop) {
        elements.receiptModalBackdrop.classList.add('hidden');
    }

    // Always remove the receipt from the slot once the user has viewed it
    elements.printedPaper.classList.remove('active');
    elements.printedPaper.innerHTML = '📄 RECEIPT';
    state.currentReceipt = null;

    if (collect) {
        showToast('Receipt collected.', 'info');
        sound.playSuccess();
    }
}

// API Calls
async function submitPinAuth() {
    try {
        const res = await fetch('/api/verify-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: state.pinInput })
        });
        const data = await res.json();

        if (data.success) {
            sound.playSuccess();
            state.pinInput = '';
            updatePinDots();
            showToast(data.message, 'success');
            switchView('mainMenu');
        } else {
            sound.playError();
            state.pinInput = '';
            updatePinDots();

            if (data.is_blocked) {
                switchView('blocked');
            } else {
                elements.pinAlertMsg.textContent = data.message;
                elements.pinAlert.classList.remove('hidden');
            }
        }
    } catch (err) {
        sound.playError();
        showToast('Network error verifying PIN. Please try again.', 'error');
    }
}

async function loadBalanceView() {
    try {
        const res = await fetch('/api/balance');
        const data = await res.json();
        if (data.success) {
            elements.balanceDisplayAmount.textContent = data.formatted_balance;
            switchView('balance');
            sound.playSuccess();

            // Automatically print receipt for Balance Check
            generateAndEjectReceipt({
                type: 'BALANCE INQUIRY',
                amount: null,
                balance: data.formatted_balance
            });
        } else {
            showToast(data.message, 'error');
            switchView('welcome');
        }
    } catch (err) {
        showToast('Failed to retrieve balance.', 'error');
    }
}

async function loadWithdrawView() {
    try {
        const res = await fetch('/api/balance');
        const data = await res.json();
        if (data.success) {
            elements.withdrawAvailBal.textContent = `Avail: ${data.formatted_balance}`;
            elements.withdrawCustomInput.value = '';
            switchView('withdraw');
        }
    } catch (err) {
        showToast('Failed to load withdrawal view.', 'error');
    }
}

async function handleWithdraw(presetAmount = null) {
    const amount = presetAmount || elements.withdrawCustomInput.value;
    if (!amount || parseFloat(amount) <= 0) {
        elements.withdrawAlertMsg.textContent = 'Please enter a valid amount greater than 0.';
        elements.withdrawAlert.classList.remove('hidden');
        sound.playError();
        return;
    }

    try {
        const res = await fetch('/api/withdraw', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: parseFloat(amount) })
        });
        const data = await res.json();

        if (data.success) {
            sound.playDispense();
            showToast(data.message, 'success');
            
            // Trigger Cash Dispenser Animation
            elements.dispensedCash.classList.add('active');
            elements.withdrawAvailBal.textContent = `Avail: ${data.formatted_balance}`;
            elements.withdrawCustomInput.value = '';
            elements.withdrawAlert.classList.add('hidden');

            // Automatically print receipt for Cash Withdrawal
            generateAndEjectReceipt({
                type: 'CASH WITHDRAWAL',
                amount: `-RS ${parseFloat(amount).toFixed(2)}`,
                balance: data.formatted_balance
            });

            setTimeout(() => {
                showToast(`New Balance: ${data.formatted_balance}`, 'info');
            }, 1000);
        } else {
            sound.playError();
            elements.withdrawAlertMsg.textContent = data.message;
            elements.withdrawAlert.classList.remove('hidden');
        }
    } catch (err) {
        sound.playError();
        showToast('Transaction error during withdrawal.', 'error');
    }
}

async function loadDepositView() {
    try {
        const res = await fetch('/api/balance');
        const data = await res.json();
        if (data.success) {
            elements.depositAvailBal.textContent = `Current: ${data.formatted_balance}`;
            elements.depositCustomInput.value = '';
            switchView('deposit');
        }
    } catch (err) {
        showToast('Failed to load deposit view.', 'error');
    }
}

async function handleDeposit(presetAmount = null) {
    const amount = presetAmount || elements.depositCustomInput.value;
    if (!amount || parseFloat(amount) <= 0) {
        elements.depositAlertMsg.textContent = 'Please enter a valid deposit amount greater than 0.';
        elements.depositAlert.classList.remove('hidden');
        sound.playError();
        return;
    }

    try {
        const res = await fetch('/api/deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: parseFloat(amount) })
        });
        const data = await res.json();

        if (data.success) {
            sound.playSuccess();
            showToast(data.message, 'success');
            elements.depositAvailBal.textContent = `Current: ${data.formatted_balance}`;
            elements.depositCustomInput.value = '';
            elements.depositAlert.classList.add('hidden');

            // Automatically print receipt for Cash Deposit
            generateAndEjectReceipt({
                type: 'CASH DEPOSIT',
                amount: `+RS ${parseFloat(amount).toFixed(2)}`,
                balance: data.formatted_balance
            });

            setTimeout(() => {
                showToast(`Updated Balance: ${data.formatted_balance}`, 'info');
            }, 1000);
        } else {
            sound.playError();
            elements.depositAlertMsg.textContent = data.message;
            elements.depositAlert.classList.remove('hidden');
        }
    } catch (err) {
        sound.playError();
        showToast('Transaction error during deposit.', 'error');
    }
}

async function loadStatementsView() {
    try {
        const res = await fetch('/api/statements');
        const data = await res.json();
        if (data.success) {
            elements.receiptTime.textContent = new Date().toLocaleString();
            elements.receiptBalance.textContent = `RS ${data.data.balance.toFixed(2)}`;

            elements.receiptTxList.innerHTML = '';
            const txs = data.data.transactions;
            if (!txs || txs.length === 0) {
                elements.receiptTxList.innerHTML = '<div class="receipt-row"><span>No recent transactions.</span></div>';
            } else {
                txs.forEach(tx => {
                    const row = document.createElement('div');
                    row.className = 'receipt-row';
                    
                    let badgeClass = 'tx-type-info';
                    let sign = '';
                    if (tx.type === 'DEPOSIT' || tx.type === 'INITIAL') {
                        badgeClass = 'tx-type-credit';
                        sign = '+';
                    } else if (tx.type === 'WITHDRAWAL') {
                        badgeClass = 'tx-type-debit';
                        sign = '-';
                    }

                    row.innerHTML = `
                        <span>${tx.desc}</span>
                        <span class="tx-type-badge ${badgeClass}">${tx.type}</span>
                    `;
                    elements.receiptTxList.appendChild(row);
                });
            }

            switchView('statement');
            sound.playSuccess();

            // Automatically print receipt for Mini Statement
            generateAndEjectReceipt({
                type: 'MINI STATEMENT',
                amount: null,
                balance: `RS ${data.data.balance.toFixed(2)}`,
                transactions: data.data.transactions
            });
        } else {
            showToast(data.message, 'error');
        }
    } catch (err) {
        showToast('Failed to retrieve statement.', 'error');
    }
}

async function handleChangePin() {
    const current_pin = elements.inputCurrentPin.value.trim();
    const new_pin = elements.inputNewPin.value.trim();
    const confirm_pin = elements.inputConfirmPin.value.trim();

    if (!current_pin || !new_pin || !confirm_pin) {
        elements.changePinAlertMsg.textContent = 'Please fill out all 3 PIN fields.';
        elements.changePinAlert.classList.remove('hidden');
        sound.playError();
        return;
    }

    try {
        const res = await fetch('/api/change-pin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ current_pin, new_pin, confirm_pin })
        });
        const data = await res.json();

        if (data.success) {
            sound.playSuccess();
            showToast(data.message, 'success');
            elements.inputCurrentPin.value = '';
            elements.inputNewPin.value = '';
            elements.inputConfirmPin.value = '';
            elements.changePinAlert.classList.add('hidden');

            // Automatically print receipt for PIN Change
            generateAndEjectReceipt({
                type: 'PIN CHANGE',
                amount: null,
                balance: null
            });

            setTimeout(() => switchView('mainMenu'), 1200);
        } else {
            sound.playError();
            elements.changePinAlertMsg.textContent = data.message;
            elements.changePinAlert.classList.remove('hidden');
        }
    } catch (err) {
        sound.playError();
        showToast('Error changing PIN.', 'error');
    }
}

async function handleLogout() {
    try {
        await fetch('/api/logout', { method: 'POST' });
        sound.playKeyBeep(440);
        switchView('goodbye');

        // Card ejection visual
        elements.atmCard.classList.remove('inserted');

        let seconds = 4;
        elements.goodbyeCountdown.textContent = `Returning to home in ${seconds}s...`;
        const interval = setInterval(() => {
            seconds--;
            if (seconds > 0) {
                elements.goodbyeCountdown.textContent = `Returning to home in ${seconds}s...`;
            } else {
                clearInterval(interval);
                switchView('welcome');
            }
        }, 1000);
    } catch (err) {
        switchView('welcome');
    }
}

async function handleResetATM() {
    try {
        const res = await fetch('/api/reset', { method: 'POST' });
        const data = await res.json();
        sound.playSuccess();
        showToast(data.message, 'success');
        state.pinInput = '';
        updatePinDots();
        elements.atmCard.classList.remove('inserted');
        elements.dispensedCash.classList.remove('active');
        elements.printedPaper.classList.remove('active');
        switchView('welcome');
    } catch (err) {
        showToast('Failed to reset ATM.', 'error');
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Keypad Clicks
    elements.keypadBtns.forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevents input element from losing focus when clicking keypad
        });
        btn.addEventListener('click', () => {
            const key = btn.getAttribute('data-key');
            if (key) handleKeypadButtonClick(key);
        });
    });

    // Track active field in Change PIN screen
    if (elements.inputCurrentPin) {
        elements.inputCurrentPin.addEventListener('focus', () => { state.activePinField = 'current'; });
    }
    if (elements.inputNewPin) {
        elements.inputNewPin.addEventListener('focus', () => { state.activePinField = 'new'; });
    }
    if (elements.inputConfirmPin) {
        elements.inputConfirmPin.addEventListener('focus', () => { state.activePinField = 'confirm'; });
    }

    // Physical Keyboard Support
    window.addEventListener('keydown', (e) => {
        const key = e.key;
        const activeEl = document.activeElement;
        const isInputFocused = activeEl && (activeEl.tagName === 'INPUT');

        if (key >= '0' && key <= '9') {
            highlightKeypadBtn(key);
            sound.playKeyBeep();

            if (state.currentScreen === 'welcome') {
                e.preventDefault();
                if (state.pinInput.length < 4) {
                    state.pinInput += key;
                    updatePinDots();
                    if (state.pinInput.length === 4) {
                        setTimeout(submitPinAuth, 250);
                    }
                }
            } else if (state.currentScreen === 'mainMenu' && !isInputFocused) {
                e.preventDefault();
                if (key === '1') loadBalanceView();
                else if (key === '2') loadWithdrawView();
                else if (key === '3') loadDepositView();
                else if (key === '4') loadStatementsView();
                else if (key === '5') switchView('changePin');
                else if (key === '6') handleLogout();
            } else if (state.currentScreen === 'changePin' && isInputFocused) {
                // Let the browser insert the character natively into the input
                // Auto-advance to next PIN field if this field is full (4 digits)
                setTimeout(() => {
                    if (activeEl.value.length >= 4) {
                        if (activeEl === elements.inputCurrentPin) {
                            state.activePinField = 'new';
                            elements.inputNewPin.focus();
                        } else if (activeEl === elements.inputNewPin) {
                            state.activePinField = 'confirm';
                            elements.inputConfirmPin.focus();
                        }
                    }
                }, 10);
            } else if (!isInputFocused) {
                if (state.currentScreen === 'withdraw') {
                    elements.withdrawCustomInput.focus();
                    elements.withdrawCustomInput.value += key;
                } else if (state.currentScreen === 'deposit') {
                    elements.depositCustomInput.focus();
                    elements.depositCustomInput.value += key;
                }
            }
            // If isInputFocused on withdraw/deposit, browser handles typing natively (no duplication)
        } else if (key === '.') {
            highlightKeypadBtn('.');
            sound.playKeyBeep();
            if (!isInputFocused) {
                if (state.currentScreen === 'withdraw') {
                    elements.withdrawCustomInput.focus();
                    if (!elements.withdrawCustomInput.value.includes('.')) {
                        elements.withdrawCustomInput.value += '.';
                    }
                } else if (state.currentScreen === 'deposit') {
                    elements.depositCustomInput.focus();
                    if (!elements.depositCustomInput.value.includes('.')) {
                        elements.depositCustomInput.value += '.';
                    }
                }
            }
        } else if (key === 'Enter') {
            e.preventDefault();
            highlightKeypadBtn('ENTER');
            sound.playKeyBeep();

            if (state.currentScreen === 'welcome') {
                if (state.pinInput.length === 4) {
                    submitPinAuth();
                } else {
                    elements.pinAlertMsg.textContent = 'Please enter all 4 digits.';
                    elements.pinAlert.classList.remove('hidden');
                    sound.playError();
                }
            } else if (state.currentScreen === 'withdraw') {
                handleWithdraw();
            } else if (state.currentScreen === 'deposit') {
                handleDeposit();
            } else if (state.currentScreen === 'changePin') {
                handleChangePin();
            }
        } else if (key === 'Backspace') {
            highlightKeypadBtn('CLEAR');
            sound.playKeyBeep();

            if (state.currentScreen === 'welcome') {
                e.preventDefault();
                if (state.pinInput.length > 0) {
                    state.pinInput = state.pinInput.slice(0, -1);
                    updatePinDots();
                }
            }
        } else if (key === 'Escape') {
            e.preventDefault();
            highlightKeypadBtn('CANCEL');
            sound.playKeyBeep();

            if (state.currentScreen === 'welcome') {
                state.pinInput = '';
                updatePinDots();
                elements.pinAlert.classList.add('hidden');
            } else if (state.currentScreen === 'mainMenu') {
                handleLogout();
            } else {
                switchView('mainMenu');
            }
        }
    });

    // Sound toggle
    elements.soundToggle.addEventListener('click', () => {
        sound.enabled = !sound.enabled;
        elements.soundIcon.textContent = sound.enabled ? '🔊 Sound ON' : '🔇 Sound OFF';
        if (sound.enabled) sound.playSuccess();
    });

    // Reset button
    elements.resetAtmBtn.addEventListener('click', handleResetATM);
    elements.unblockBtn.addEventListener('click', handleResetATM);

    // Main Menu navigation
    elements.btnMenuBalance.addEventListener('click', loadBalanceView);
    elements.btnMenuWithdraw.addEventListener('click', loadWithdrawView);
    elements.btnMenuDeposit.addEventListener('click', loadDepositView);
    elements.btnMenuStatement.addEventListener('click', loadStatementsView);
    elements.btnMenuChangePin.addEventListener('click', () => switchView('changePin'));
    elements.btnMenuLogout.addEventListener('click', handleLogout);
    elements.menuExitBtn.addEventListener('click', handleLogout);

    // Back to Menu buttons
    elements.backFromBalance.addEventListener('click', () => switchView('mainMenu'));
    elements.backFromWithdraw.addEventListener('click', () => switchView('mainMenu'));
    elements.backFromDeposit.addEventListener('click', () => switchView('mainMenu'));
    elements.backFromStatement.addEventListener('click', () => switchView('mainMenu'));
    elements.backFromChangePin.addEventListener('click', () => switchView('mainMenu'));
    elements.withdrawFromBalance.addEventListener('click', loadWithdrawView);
    elements.returnHomeNow.addEventListener('click', () => switchView('welcome'));

    // Withdraw Actions
    elements.confirmWithdrawBtn.addEventListener('click', () => handleWithdraw());
    elements.presetWithdrawBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const amt = btn.getAttribute('data-amount');
            handleWithdraw(amt);
        });
    });

    // Deposit Actions
    elements.confirmDepositBtn.addEventListener('click', () => handleDeposit());
    elements.presetDepositBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const amt = btn.getAttribute('data-amount');
            handleDeposit(amt);
        });
    });

    // Print Receipt Action from Statement Screen
    elements.printStatementBtn.addEventListener('click', () => {
        openReceiptModal();
    });

    // Receipt Slot and Paper Click to View Receipt
    elements.printedPaper.addEventListener('click', () => {
        openReceiptModal();
    });

    elements.receiptSlot.addEventListener('click', () => {
        if (elements.printedPaper.classList.contains('active') || state.currentReceipt) {
            openReceiptModal();
        }
    });

    // Modal action buttons
    if (elements.closeReceiptModalBtn) {
        elements.closeReceiptModalBtn.addEventListener('click', () => closeReceiptModal(false));
    }
    if (elements.collectReceiptModalBtn) {
        elements.collectReceiptModalBtn.addEventListener('click', () => closeReceiptModal(true));
    }
    if (elements.printThermalReceiptBtn) {
        elements.printThermalReceiptBtn.addEventListener('click', () => {
            window.print();
        });
    }
    if (elements.receiptModalBackdrop) {
        elements.receiptModalBackdrop.addEventListener('click', (e) => {
            if (e.target === elements.receiptModalBackdrop) {
                closeReceiptModal(false);
            }
        });
    }

    // Collect Cash Click
    elements.dispensedCash.addEventListener('click', () => {
        sound.playSuccess();
        elements.dispensedCash.classList.remove('active');
        showToast('Cash collected from dispenser.', 'info');
    });

    // Change PIN Submit
    elements.submitChangePinBtn.addEventListener('click', handleChangePin);

    // Insert Card Button
    elements.insertCardBtn.addEventListener('click', () => {
        state.cardInserted = !state.cardInserted;
        if (state.cardInserted) {
            elements.atmCard.classList.add('inserted');
            elements.insertCardBtn.textContent = 'Eject Card';
            sound.playKeyBeep(600);
            showToast('Card inserted successfully.', 'info');
        } else {
            elements.atmCard.classList.remove('inserted');
            elements.insertCardBtn.textContent = 'Insert Card';
            sound.playKeyBeep(400);
            showToast('Card ejected.', 'info');
        }
    });
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    updatePinDots();
});
