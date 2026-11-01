"""
Optional Flask API starter for LuxeLoom.
Run: pip install flask flask-cors
     python app.py
This starter demonstrates server-side booking persistence. Add authentication,
CSRF protection, validation, database migrations, rate limits and payment webhooks
before production use.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__)
CORS(app)
DB = "luxeloom.db"

def connect():
    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    return con

def init_db():
    with connect() as con:
        con.execute("""CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
            salon TEXT NOT NULL, service TEXT NOT NULL, stylist TEXT,
            booking_date TEXT NOT NULL, booking_time TEXT NOT NULL,
            amount REAL NOT NULL, status TEXT NOT NULL DEFAULT 'Pending',
            created_at TEXT NOT NULL
        )""")

@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "LuxeLoom API"})

@app.get("/api/bookings")
def list_bookings():
    with connect() as con:
        rows = con.execute("SELECT * FROM bookings ORDER BY booking_date, booking_time").fetchall()
    return jsonify([dict(r) for r in rows])

@app.post("/api/bookings")
def create_booking():
    data = request.get_json(silent=True) or {}
    required = ["customer_name", "email", "phone", "salon", "service",
                "booking_date", "booking_time", "amount"]
    missing = [key for key in required if not data.get(key)]
    if missing:
        return jsonify({"error": "Missing fields", "fields": missing}), 400
    try:
        datetime.strptime(data["booking_date"], "%Y-%m-%d")
        amount = float(data["amount"])
        if amount <= 0:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date or amount"}), 400
    with connect() as con:
        duplicate = con.execute("""SELECT id FROM bookings
            WHERE salon=? AND booking_date=? AND booking_time=? AND status!='Cancelled'""",
            (data["salon"], data["booking_date"], data["booking_time"])).fetchone()
        if duplicate:
            return jsonify({"error": "Slot is already booked"}), 409
        cur = con.execute("""INSERT INTO bookings
            (customer_name,email,phone,salon,service,stylist,booking_date,booking_time,amount,status,created_at)
            VALUES (?,?,?,?,?,?,?,?,?,'Pending',?)""",
            (data["customer_name"], data["email"], data["phone"], data["salon"],
             data["service"], data.get("stylist",""), data["booking_date"],
             data["booking_time"], amount, datetime.utcnow().isoformat()))
        booking_id = cur.lastrowid
    return jsonify({"id": booking_id, "status": "Pending"}), 201

@app.patch("/api/bookings/<int:booking_id>")
def update_booking(booking_id):
    data = request.get_json(silent=True) or {}
    status = data.get("status")
    if status not in ["Pending", "Confirmed", "Cancelled", "Completed"]:
        return jsonify({"error": "Unsupported status"}), 400
    with connect() as con:
        cur = con.execute("UPDATE bookings SET status=? WHERE id=?", (status, booking_id))
        if not cur.rowcount:
            return jsonify({"error": "Booking not found"}), 404
    return jsonify({"id": booking_id, "status": status})

if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)
