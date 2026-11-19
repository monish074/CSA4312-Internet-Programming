# ComplainEase — Civic Grievance & Resolution Command Center

A complete, self-contained front-end web application built with a **Left Command Rail + Interactive Geo-Map Workspace** architecture, supporting **Citizen Users**, **Resolution Officers**, and **System Administrators**.

## Roles & Implemented Features

### 1. Citizen User
- **Register & Login**: Create an account or use the 1-Click `Citizen User` button.
- **Post Complaint & Google Map Location Marker**: Fill out category, headline, description, supporting document reference, and click directly on the interactive geo-map to drop a location pin (with direct link to open coordinates in Google Maps).
- **View Complaint Status & Proof of Work**: Track real-time statuses (`Submitted` -> `In Progress` -> `Resolved`), append additional evidence, and submit resolution feedback.
- **Admin Contact Details & FAQ Search**: Search common issues & solutions and view official Administrator contact details.

### 2. Resolution Officer
- **Register & Login**: Log in using Admin-generated Officer ID & Password (e.g., `OFF-101` / `off123`) or register a new officer profile.
- **View Complaint, Update Status & Update Proof of Work**: Inspect citizen complaints, update resolution status, and record verified proof-of-work logs.

### 3. System Administrator (Full OES Rights)
- **Generate ID & Password for Officer**: Issue official Officer IDs and passwords.
- **Account Management**: View all accounts, create new accounts, change passwords, and delete accounts.
- **Hide / Show Portal Features**: Toggle feature visibility across Users and Officers in real time.
- **Insert OES Information**: Publish public OES service notices and update Administrator contact details.

## How to Run
Extract the ZIP archive and open `index.html` in any web browser.
