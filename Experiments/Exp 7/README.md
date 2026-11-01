# LuxeLoom – Smart Beauty Parlour Appointment Booking System

A multi-page responsive beauty appointment booking project with a premium editorial design.

## Pages
- `index.html` – landing page and studio discovery
- `salons.html` – salon search, filters and sorting
- `services.html` – treatment catalogue and category filters
- `stylists.html` – artist profiles
- `booking.html` – multi-step booking form, slot availability and deposit/full-payment choice
- `payment.html` – demo checkout and confirmation
- `login.html`, `register.html` – demo customer account flow
- `account.html` – upcoming reservations, history and personal profile
- `calendar.html` – monthly reservation calendar and unavailable-hour lockout
- `staff.html` – staff booking list, confirm, call and SMS links
- `admin.html` – dashboard, service management and CSV export
- `feedback.html`, `contact.html` – feedback and contact forms

## Run the frontend
Open `index.html` in a browser. For best results, use VS Code Live Server.

The frontend uses browser `localStorage` for demonstration data. Clear site data to reset the demo.

## Optional Flask API
```bash
cd backend
pip install -r requirements.txt
python app.py
```
API endpoints:
- `GET /api/health`
- `GET /api/bookings`
- `POST /api/bookings`
- `PATCH /api/bookings/<id>`

The current frontend is not connected to this API; it is provided as an extension starter.

## Important production notes
This is an academic/demo project, not a production payment or identity platform.
- Stripe and PayPal are shown as demo payment choices. Real payments need server-created checkout sessions, verified webhooks and secret keys stored only on the server.
- Login/register are demo-only and must be replaced with secure server-side authentication and password hashing.
- Email/SMS are represented by UI flows and `tel:` / `sms:` links. Real notifications need a provider such as an email service or SMS gateway.
- Automatic expiry of unpaid reservations requires a server scheduler and payment-state reconciliation.
- Slot locking in the frontend is local to one browser. A production database must enforce atomic slot uniqueness across all customers.
- Protect admin/staff routes with server-side role-based access control.

## Technologies
HTML5, CSS3, JavaScript, LocalStorage, optional Python Flask and SQLite.
