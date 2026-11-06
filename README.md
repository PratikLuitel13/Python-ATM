# 🏦 Python ATM System - Web Deployment on Localhost

A modern, interactive Web ATM Kiosk application built with **Python (Flask)** and **Vanilla HTML5/CSS3/JavaScript**.

---

## 🚀 How to Run on Localhost

### Option 1: Quick Launcher (Auto-opens Browser)
```bash
python run.py
```

### Option 2: Direct Flask Server
```bash
python app.py
```
Open your browser and navigate to: **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 🔑 Default Credentials & Account Details
- **Default PIN:** `1234`
- **Initial Account Balance:** `RS 5,000.00`
- **Security Lockout:** 3 incorrect PIN attempts blocks the card for security.

---

## ✨ Features Included
1. **Interactive ATM Kiosk UI:** Sleek dark-mode interface with card slot, numeric keypad, and glowing status displays.
2. **PIN Authentication:** 4-digit PIN verification with 3-attempt security lockout.
3. **Account Balance Inquiry:** Live balance viewer with glowing metrics.
4. **Cash Withdrawal:** Fast cash buttons (RS 500, 1000, 2000, 5000) or custom input with animated cash dispenser.
5. **Cash Deposit:** Instant cash credit with real-time balance calculations.
6. **Mini-Statement & Printable Receipt:** Transaction log showing recent history with simulated printable receipt.
7. **Change PIN:** Secure 3-step PIN update with confirmation matching.
8. **Audio & Sound Effects:** Web Audio synthesizer for tactile keypad beeps, cash count whirrs, and confirmation chimes.
9. **Physical Keyboard Integration:** Type numbers directly or use <kbd>Enter</kbd> / <kbd>Backspace</kbd> / <kbd>Esc</kbd>.

---

## 🧪 Running Automated Verification Tests
```bash
python test_atm.py
```
