const INITIAL_TOLLS = [
    { id: "TOLL-01", name: "Chennai–Bangalore NH-48 Plaza", highway: "NH-48", location: "Sriperumbudur", baseFee: 8.50 },
    { id: "TOLL-02", name: "Paranur Express Toll Gate", highway: "NH-32 GST Road", location: "Chengalpattu", baseFee: 6.00 },
    { id: "TOLL-03", name: "Electronic City Elevated Toll", highway: "NH-44", location: "Bengaluru", baseFee: 10.00 },
    { id: "TOLL-04", name: "OMR IT Corridor Plaza", highway: "SH-49A", location: "Chennai South", baseFee: 4.50 }
];

const INITIAL_USERS = [
    { id: "USR-101", name: "Arjun Natarajan", email: "driver@easytoll.in", password: "user123", walletBalance: 125.50, autoPay: true }
];

const INITIAL_GATE_OPERATORS = [
    { id: "GATE-01", name: "Ramesh Kumar", plazaId: "TOLL-01", plazaName: "Chennai–Bangalore NH-48 Plaza", lane: "FAST-LANE 02", gps: "13.0285° N, 80.0112° E", password: "gate123" },
    { id: "GATE-02", name: "Suresh Babu", plazaId: "TOLL-02", plazaName: "Paranur Express Toll Gate", lane: "FAST-LANE 01", gps: "12.7120° N, 79.9840° E", password: "gate456" }
];

const INITIAL_VEHICLES = [
    { plate: "TN-09-CD-4821", vehicleClass: "Car / Jeep / Van", model: "Hyundai Creta", recurringRoute: "Chennai–Bangalore NH-48 Plaza" },
    { plate: "TN-01-BX-9012", vehicleClass: "Car / Jeep / Van", model: "Honda City", recurringRoute: "Paranur Express Toll Gate" }
];

const INITIAL_PASSES = [
    {
        passId: "PASS-7741",
        userId: "USR-101",
        holderName: "Arjun Natarajan",
        vehiclePlate: "TN-09-CD-4821",
        tollName: "Chennai–Bangalore NH-48 Plaza",
        plan: "Monthly Commuter Pass ($45)",
        validUntil: "2026-12-31",
        status: "Approved"
    },
    {
        passId: "PASS-8820",
        userId: "USR-101",
        holderName: "Arjun Natarajan",
        vehiclePlate: "TN-01-BX-9012",
        tollName: "Paranur Express Toll Gate",
        plan: "Annual Express Pass ($420)",
        validUntil: "2027-11-18",
        status: "Pending Approval"
    }
];

const INITIAL_ETICKETS = [
    {
        ticketId: "TKT-5501",
        userId: "USR-101",
        tollName: "Paranur Express Toll Gate",
        vehiclePlate: "TN-09-CD-4821",
        tripType: "Return",
        travelDate: "2026-11-21",
        farePaid: 10.80,
        status: "Valid - Unused"
    }
];

const INITIAL_TRANSACTIONS = [
    { id: "TXN-901", date: "2026-11-18", title: "eWallet Top-Up (UPI / Instant Pay)", amount: "+$100.00", type: "credit" },
    { id: "TXN-902", date: "2026-11-19", title: "Pre-Booked Toll eTicket (TKT-5501)", amount: "-$10.80", type: "debit" }
];
