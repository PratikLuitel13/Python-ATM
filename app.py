import os
import webbrowser
from flask import Flask, render_template, request, jsonify, session

app = Flask(__name__)
app.secret_key = os.urandom(24)

class WebATM:
    def __init__(self, stored_pin="1234", initial_balance=5000.0):
        self.stored_pin = stored_pin
        self.balance = initial_balance
        self.transactions = []
        self.attempts_remaining = 3
        self.is_blocked = False
        self.is_authenticated = False
        # Record initial balance in history
        self.transactions.append({
            "type": "INITIAL",
            "desc": f"Initial Account Deposit: +RS {initial_balance:.2f}",
            "amount": initial_balance,
            "balance_after": initial_balance,
            "status": "SUCCESS"
        })

    def verify_pin(self, entered_pin):
        if self.is_blocked:
            return False, "Your card has been blocked due to multiple incorrect attempts. Please reset the ATM.", 0

        if entered_pin == self.stored_pin:
            self.is_authenticated = True
            self.attempts_remaining = 3
            return True, "PIN verified successfully! Welcome.", self.attempts_remaining
        else:
            self.attempts_remaining -= 1
            if self.attempts_remaining <= 0:
                self.is_blocked = True
                self.is_authenticated = False
                return False, "Too many incorrect attempts. Your card has been blocked for security.", 0
            return False, f"Incorrect PIN. You have {self.attempts_remaining} attempt(s) remaining.", self.attempts_remaining

    def check_balance(self):
        if not self.is_authenticated:
            return None, "Unauthorized access. Please insert card and enter PIN."
        return self.balance, f"Your current balance is: RS {self.balance:.2f}"

    def withdraw(self, amount):
        if not self.is_authenticated:
            return False, "Unauthorized. Please authenticate first.", self.balance
        
        try:
            amount = float(amount)
            if amount <= 0:
                return False, "Invalid amount. Please enter a value greater than zero.", self.balance
            if amount > self.balance:
                return False, f"Insufficient funds! Available balance: RS {self.balance:.2f}", self.balance
            
            self.balance -= amount
            self.transactions.append({
                "type": "WITHDRAWAL",
                "desc": f"Cash Withdrawal: -RS {amount:.2f}",
                "amount": amount,
                "balance_after": self.balance,
                "status": "SUCCESS"
            })
            return True, f"Successfully withdrew RS {amount:.2f}. Please collect your cash.", self.balance
        except (ValueError, TypeError):
            return False, "Invalid input. Please enter a valid numerical amount.", self.balance

    def deposit(self, amount):
        if not self.is_authenticated:
            return False, "Unauthorized. Please authenticate first.", self.balance
        
        try:
            amount = float(amount)
            if amount <= 0:
                return False, "Invalid amount. Please enter a value greater than zero.", self.balance
            
            self.balance += amount
            self.transactions.append({
                "type": "DEPOSIT",
                "desc": f"Cash Deposit: +RS {amount:.2f}",
                "amount": amount,
                "balance_after": self.balance,
                "status": "SUCCESS"
            })
            return True, f"Successfully deposited RS {amount:.2f}.", self.balance
        except (ValueError, TypeError):
            return False, "Invalid input. Please enter a valid numerical amount.", self.balance

    def change_pin(self, current_pin, new_pin, confirm_pin):
        if not self.is_authenticated:
            return False, "Unauthorized. Please authenticate first."

        if current_pin != self.stored_pin:
            return False, "Incorrect current PIN. Cannot change PIN."

        if not (len(new_pin) == 4 and new_pin.isdigit()):
            return False, "Invalid PIN format. PIN must be exactly 4 digits."

        if new_pin != confirm_pin:
            return False, "New PIN and Confirmation PIN do not match."

        self.stored_pin = new_pin
        self.transactions.append({
            "type": "PIN_CHANGE",
            "desc": "PIN Changed Successfully",
            "amount": 0,
            "balance_after": self.balance,
            "status": "SUCCESS"
        })
        return True, "PIN has been changed successfully! Use your new PIN next time."

    def get_statements(self, limit=5):
        if not self.is_authenticated:
            return None, "Unauthorized. Please authenticate first."
        
        recent = self.transactions[-limit:] if self.transactions else []
        return {
            "transactions": recent,
            "total_count": len(self.transactions),
            "balance": self.balance
        }, "Success"

    def logout(self):
        self.is_authenticated = False

    def reset_system(self):
        self.__init__(stored_pin="1234", initial_balance=5000.0)


# Global ATM Instance
atm_instance = WebATM(stored_pin="1234", initial_balance=5000.0)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/status", methods=["GET"])
def get_status():
    return jsonify({
        "is_authenticated": atm_instance.is_authenticated,
        "is_blocked": atm_instance.is_blocked,
        "attempts_remaining": atm_instance.attempts_remaining,
        "balance": atm_instance.balance if atm_instance.is_authenticated else None
    })


@app.route("/api/verify-pin", methods=["POST"])
def verify_pin():
    data = request.get_json() or {}
    pin = str(data.get("pin", "")).strip()

    if not pin:
        return jsonify({"success": False, "message": "Please enter a 4-digit PIN."}), 400

    success, message, attempts = atm_instance.verify_pin(pin)
    return jsonify({
        "success": success,
        "message": message,
        "attempts_remaining": attempts,
        "is_blocked": atm_instance.is_blocked,
        "is_authenticated": atm_instance.is_authenticated
    })


@app.route("/api/balance", methods=["GET"])
def check_balance():
    balance, message = atm_instance.check_balance()
    if balance is None:
        return jsonify({"success": False, "message": message}), 401
    
    return jsonify({
        "success": True,
        "balance": balance,
        "formatted_balance": f"RS {balance:,.2f}",
        "message": message
    })


@app.route("/api/withdraw", methods=["POST"])
def withdraw():
    data = request.get_json() or {}
    amount = data.get("amount")
    
    success, message, balance = atm_instance.withdraw(amount)
    return jsonify({
        "success": success,
        "message": message,
        "balance": balance,
        "formatted_balance": f"RS {balance:,.2f}"
    }), (200 if success else 400)


@app.route("/api/deposit", methods=["POST"])
def deposit():
    data = request.get_json() or {}
    amount = data.get("amount")

    success, message, balance = atm_instance.deposit(amount)
    return jsonify({
        "success": success,
        "message": message,
        "balance": balance,
        "formatted_balance": f"RS {balance:,.2f}"
    }), (200 if success else 400)


@app.route("/api/change-pin", methods=["POST"])
def change_pin():
    data = request.get_json() or {}
    current_pin = str(data.get("current_pin", "")).strip()
    new_pin = str(data.get("new_pin", "")).strip()
    confirm_pin = str(data.get("confirm_pin", "")).strip()

    success, message = atm_instance.change_pin(current_pin, new_pin, confirm_pin)
    return jsonify({
        "success": success,
        "message": message
    }), (200 if success else 400)


@app.route("/api/statements", methods=["GET"])
def statements():
    data, message = atm_instance.get_statements(limit=10)
    if data is None:
        return jsonify({"success": False, "message": message}), 401
    
    return jsonify({
        "success": True,
        "data": data,
        "message": message
    })


@app.route("/api/logout", methods=["POST"])
def logout():
    atm_instance.logout()
    return jsonify({
        "success": True,
        "message": "Card ejected successfully. Thank you for using the Python ATM System!"
    })


@app.route("/api/reset", methods=["POST"])
def reset():
    atm_instance.reset_system()
    return jsonify({
        "success": True,
        "message": "ATM session has been reset to defaults (PIN: 1234, Balance: RS 5000.00)."
    })


if __name__ == "__main__":
    print("=" * 60)
    print(">>> Python ATM System is running at http://127.0.0.1:5000 <<<")
    print("=" * 60)
    app.run(host="127.0.0.1", port=5000, debug=True)
