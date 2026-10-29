AERONOVA FLIGHT RESERVATION SYSTEM
=================================
A distinctive aviation-themed academic project: midnight ink, warm ivory, coral, and chartreuse. Includes responsive HTML/CSS/JavaScript pages, sample flight inventory, booking dashboard, cancellation, feedback, admin flight management, reports/CSV export, printable demo e-ticket, and an optional Python Flask API starter.

PAGES
index.html, flights.html, login.html, register.html, forgot-password.html, booking.html, payment.html, my-tickets.html, cancel.html, feedback.html, admin.html, reports.html, print-ticket.html.

RUN FRONTEND
1. Extract the ZIP and open the folder in VS Code.
2. Use the Live Server extension and open index.html.
3. Search a flight, select it, enter passenger details, then confirm the demo payment.
4. Find the PNR and ticket in My journeys. Admin can add/edit/delete sample flights and export CSV reports.

DEMO ADMIN: admin@aeronova.demo / FlyHigh123

IMPORTANT: This is a frontend academic demo. Fares, schedules and seat availability are sample data, not live airline inventory. LocalStorage is device/browser-specific and not secure. Login is client-side demo only; passwords are not safely hashed. No real payment, email, GDS/airline integration, or valid airline ticket is provided. Never enter real passwords or card details.

OPTIONAL PYTHON API STARTER
cd backend; python -m venv .venv; activate the environment; pip install -r requirements.txt; python app.py
Test /api/health and /api/flights on localhost:5000. The frontend currently uses LocalStorage and is not wired to the API.

Before production, add secure backend authentication, database storage, server-side validation, real permitted airline/GDS API access, payment gateway hosted checkout, email service, CSRF protection, rate limits, secure cookies, secret management, monitoring, and applicable compliance controls.
