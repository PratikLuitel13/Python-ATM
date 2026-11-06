import os
import sys
import time
import threading
import webbrowser
from app import app

def open_browser():
    """Wait for the server to start, then open the browser automatically."""
    time.sleep(1.2)
    print("\n[+] Opening Python ATM System in your default browser at http://127.0.0.1:5000...")
    webbrowser.open("http://127.0.0.1:5000")

if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    print("=" * 65)
    print("     [ATM] PYTHON ATM SYSTEM - LOCALHOST WEB DEPLOYMENT [ATM]     ")
    print("=" * 65)
    print(" Server URL: http://127.0.0.1:5000")
    print(" Default PIN: 1234")
    print(" Initial Balance: RS 5,000.00")
    print(" Press CTRL+C to stop the server at any time.")
    print("=" * 65)

    threading.Thread(target=open_browser, daemon=True).start()
    app.run(host="127.0.0.1", port=5000, debug=False)
