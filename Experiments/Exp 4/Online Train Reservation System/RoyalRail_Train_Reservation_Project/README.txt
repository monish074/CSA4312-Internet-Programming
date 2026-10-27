ROYALRAIL TRAIN RESERVATION WEBSITE
==================================
Files:
- index.html: home and route search
- login.html / register.html: demo account pages
- trains.html: search train results
- booking.html: class, seat, passenger and demo payment selection
- dashboard.html: booking history, PNR and print-friendly itinerary
- pnr.html: PNR status lookup
- cancel.html: cancellation and illustrative refund estimate
- admin.html: admin train/fare/user/booking management
- reports.html: summary and CSV export
- reviews.html: passenger reviews
- css/style.css: responsive navy/gold visual theme
- js/app.js: front-end demonstration logic

RUN:
1. Open this folder in VS Code.
2. Install/enable Live Server.
3. Right-click index.html > Open with Live Server.
4. Register a demo passenger, then log in to reserve a sample train.
5. Demo admin: admin@royalrail.com
   Password: Rail12345

IMPORTANT LIMITATIONS:
This is a front-end college project demonstration using browser localStorage.
It is NOT connected to Indian Railways or live train schedules/seat inventory.
No real payment is collected; emails are not sent; printed tickets are not official.
Authentication and stored passwords are not secure enough for production.
A production version requires a backend, database, secure password hashing,
server-side authorisation, a real payment provider, email service, live inventory
integration, transaction-safe seat locking, and audited refund rules.
