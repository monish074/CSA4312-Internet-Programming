# EasyToll — Pre-Paid Smart Toll Pass, eTicket & QR Gate System

A complete, self-contained front-end web application built with a **Digital Smart Pass Card + Segmented Role Switcher + Live QR Gate Scanner** architecture for **EasyToll**.

## Roles & Implemented Features

### 1. Driver / User
- **Register & Login**: Create a driver account with vehicle registration or sign in directly.
- **eWallet & Auto-Pay**: Real-time eWallet balance updates, instant top-ups, and automatic recurring toll payment toggle.
- **Buy Toll eTicket (Advance)**: Pre-book Single or Return toll eTickets for any highway plaza to skip toll booth queues, generating a scannable QR code immediately.
- **Apply New Toll Pass, Renewal & Get QR Code**: Apply for monthly/annual commuter passes, renew active passes, and open the encrypted QR code modal anytime.

### 2. Toll Gate User (Operator)
- **Login & Update Toll Location**: Sign in as a toll booth operator (e.g., `GATE-01`) and update the active toll plaza, lane number, and GPS coordinates.
- **Scan QR, Verify Toll Pass ID & Verify Toll Ticket**: Use the simulated camera QR scanner or enter any Pass ID (`PASS-7741`) or eTicket ID (`TKT-5501`) to verify validity and trigger automatic boom-barrier clearance.

### 3. System Administrator
- **Login & Create Toll Details**: Add or remove highway toll plazas and configure base toll fees.
- **Approve Toll Pass & Generate QR Code**: Review pending toll pass applications, approve passes, and generate scannable QR codes for any pass token.
- **Manage Toll Logins & Users**: Provision new Toll Gate Operator logins and manage driver eWallet balances.

## How to Run
Extract the ZIP archive and open `index.html` in any web browser.
