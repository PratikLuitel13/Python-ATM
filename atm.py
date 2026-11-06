class ATMSummary:
    def __init__(self, stored_pin="1234", initial_balance=5000.0):
        self.stored_pin = stored_pin
        self.balance = initial_balance
        self.transactions = []
        # Record initial deposit in history
        self.transactions.append(f"Initial Deposit: +RS {initial_balance:.2f}")

    def verify_pin(self):
        """Allows up to 3 attempts to enter the correct PIN."""
        attempts = 3
        while attempts > 0:
            entered_pin = input("Please enter your 4-digit PIN: ")
            if entered_pin == self.stored_pin:
                print("\nPIN verified successfully!")
                return True
            else:
                attempts -= 1
                print(f"Incorrect PIN. You have {attempts} attempt(s) remaining.")
        
        print("\nToo many incorrect attempts. Your card has been blocked for security.")
        return False

    def print_receipt(self, txn_type, amount=None):
        """Prints a simulated ATM transaction receipt slip."""
        import datetime
        now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print("\n================ RECEIPT ================")
        print("         PYTHON NATIONAL BANK            ")
        print("        ATM TRANSACTION RECORD           ")
        print("-----------------------------------------")
        print(f" Date & Time   : {now}")
        print(" Terminal ID   : PNB-ATM-0492")
        print(" Card Number   : **** **** **** 4892")
        print(f" Transaction   : {txn_type}")
        if amount is not None:
            print(f" Txn Amount    : {amount}")
        print(f" Avail Balance : RS {self.balance:.2f}")
        print(" Status        : APPROVED (000)")
        print("-----------------------------------------")
        print("  THANK YOU FOR BANKING WITH US!         ")
        print("=========================================\n")

    def check_balance(self):
        """Displays the current account balance and prints a receipt."""
        print(f"\nYour current balance is: RS {self.balance:.2f}")
        self.print_receipt("BALANCE INQUIRY")

    def withdraw(self):
        """Handles cash withdrawal with validation checks and receipt printing."""
        try:
            amount = float(input("\nEnter amount to withdraw (RS): "))
            
            if amount <= 0:
                print("Invalid amount. Please enter a value greater than zero.")
            elif amount > self.balance:
                print("Insufficient funds! Transaction failed.")
            else:
                self.balance -= amount
                self.transactions.append(f"Withdrawal: -RS {amount:.2f}")
                print(f"Successfully withdrew RS {amount:.2f}.")
                print(f"Updated Balance: RS {self.balance:.2f}")
                self.print_receipt("CASH WITHDRAWAL", f"-RS {amount:.2f}")
                
        except ValueError:
            print("Invalid input. Please enter a valid numerical amount.")

    def deposit(self):
        """Handles cash deposits into the account and prints a receipt."""
        try:
            amount = float(input("\nEnter amount to deposit (RS): "))
            
            if amount <= 0:
                print("Invalid amount. Please enter a value greater than zero.")
            else:
                self.balance += amount
                self.transactions.append(f"Deposit: +RS {amount:.2f}")
                print(f"Successfully deposited RS {amount:.2f}.")
                print(f"Updated Balance: RS {self.balance:.2f}")
                self.print_receipt("CASH DEPOSIT", f"+RS {amount:.2f}")
                
        except ValueError:
            print("Invalid input. Please enter a valid numerical amount.")

    def change_pin(self):python run.py
        """Allows the user to change their ATM PIN after verifying the old one."""
        print("\n--- CHANGE PIN ---")
        current_pin = input("Enter your current PIN: ")
        
        if current_pin == self.stored_pin:
            new_pin = input("Enter your new 4-digit PIN: ")
            
            # Basic validation to ensure it's a 4-digit number
            if len(new_pin) == 4 and new_pin.isdigit():
                confirm_pin = input("Confirm your new 4-digit PIN: ")
                
                if new_pin == confirm_pin:
                    self.stored_pin = new_pin
                    self.transactions.append("PIN Changed Successfully")
                    print("PIN has been changed successfully!")
                else:
                    print("New PINs do not match. Change failed.")
            else:
                print("Invalid PIN format. PIN must be exactly 4 digits.")
        else:
            print("Incorrect current PIN. Cannot change PIN.")

    def see_statements(self):
        """Displays the recent transaction history (Mini-Statement)."""
        print("\n--- MINI STATEMENT ---")
        if not self.transactions:
            print("No recent transactions found.")
        else:
            # Display up to the last 5 transactions
            recent_transactions = self.transactions[-5:]
            for transaction in recent_transactions:
                print(f"* {transaction}")
        print(f"Current Balance: RS {self.balance:.2f}")
        print("----------------------")


def main():
    print("=== Welcome to the Python ATM System ===")
    
    # Initialize ATM with a default PIN '1234' and balance 'RS 5000.00'
    atm = ATMSummary(stored_pin="1234", initial_balance=5000.0)
    
    # Authenticate user before showing menu
    if not atm.verify_pin():
        return

    while True:
        print("\n*** ATM Main Menu ***")
        print("1. Check Balance")
        print("2. Cash Withdrawal")
        print("3. Cash Deposit")
        print("4. Mini Statement (See Transactions)")
        print("5. Change PIN")
        print("6. Exit")
        
        choice = input("Select an option (1-6): ")
        
        if choice == '1':
            atm.check_balance()
        elif choice == '2':
            atm.withdraw()
        elif choice == '3':
            atm.deposit()
        elif choice == '4':
            atm.see_statements()
        elif choice == '5':
            atm.change_pin()
        elif choice == '6':
            print("\nThank you for using the ATM. Please take your card. Goodbye!")
            break
        else:
            print("Invalid option! Please choose a number between 1 and 6.")


if __name__ == "__main__":
    main()