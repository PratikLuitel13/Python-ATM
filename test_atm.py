import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_full_atm_flow():
    print("[1] Testing Server Status & HTML page...")
    r = requests.get(BASE_URL)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}"
    assert "Python ATM System" in r.text
    print("    -> HTML page loaded successfully.")

    print("\n[2] Testing PIN Verification with Wrong PIN...")
    r = requests.post(f"{BASE_URL}/api/verify-pin", json={"pin": "0000"})
    data = r.json()
    assert data["success"] is False
    assert data["attempts_remaining"] == 2
    print(f"    -> Correctly rejected wrong PIN: {data['message']}")

    print("\n[3] Testing PIN Verification with Correct PIN (1234)...")
    r = requests.post(f"{BASE_URL}/api/verify-pin", json={"pin": "1234"})
    data = r.json()
    assert data["success"] is True
    assert data["is_authenticated"] is True
    print(f"    -> Authenticated: {data['message']}")

    print("\n[4] Testing Balance Inquiry...")
    r = requests.get(f"{BASE_URL}/api/balance")
    data = r.json()
    assert data["success"] is True
    assert data["balance"] == 5000.0
    print(f"    -> Current Balance: {data['formatted_balance']}")

    print("\n[5] Testing Cash Withdrawal (RS 1,000)...")
    r = requests.post(f"{BASE_URL}/api/withdraw", json={"amount": 1000})
    data = r.json()
    assert data["success"] is True
    assert data["balance"] == 4000.0
    print(f"    -> Withdrew 1000. New Balance: {data['formatted_balance']}")

    print("\n[6] Testing Insufficient Funds (Withdraw RS 10,000)...")
    r = requests.post(f"{BASE_URL}/api/withdraw", json={"amount": 10000})
    data = r.json()
    assert data["success"] is False
    assert "Insufficient funds" in data["message"]
    print(f"    -> Correctly handled overdraft: {data['message']}")

    print("\n[7] Testing Cash Deposit (RS 2,500)...")
    r = requests.post(f"{BASE_URL}/api/deposit", json={"amount": 2500})
    data = r.json()
    assert data["success"] is True
    assert data["balance"] == 6500.0
    print(f"    -> Deposited 2500. New Balance: {data['formatted_balance']}")

    print("\n[8] Testing Mini-Statement...")
    r = requests.get(f"{BASE_URL}/api/statements")
    data = r.json()
    assert data["success"] is True
    txs = data["data"]["transactions"]
    print(f"    -> Total logged transactions: {len(txs)}")
    for t in txs:
        print(f"       * {t['desc']} [{t['type']}]")

    print("\n[9] Testing PIN Change...")
    r = requests.post(f"{BASE_URL}/api/change-pin", json={
        "current_pin": "1234",
        "new_pin": "5678",
        "confirm_pin": "5678"
    })
    data = r.json()
    assert data["success"] is True
    print(f"    -> PIN change result: {data['message']}")

    print("\n[10] Testing Resetting ATM Session to Default...")
    r = requests.post(f"{BASE_URL}/api/reset")
    data = r.json()
    assert data["success"] is True
    print(f"    -> Reset result: {data['message']}")

    print("\n" + "="*50)
    print(" ALL 10 TESTS PASSED SUCCESSFULLY! ")
    print("="*50)

if __name__ == "__main__":
    test_full_atm_flow()
