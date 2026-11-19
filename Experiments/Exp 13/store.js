const INITIAL_ACCOUNTS = [
    { id: "ADM-01", name: "Chief OES Administrator", loginId: "admin@complainease.org", password: "admin123", role: "admin", extra: "Central Command" },
    { id: "OFF-101", name: "Inspector Vikram Rao", loginId: "OFF-101", password: "off123", role: "officer", extra: "Roads & Electricity" },
    { id: "OFF-102", name: "Officer Meena Sundaram", loginId: "OFF-102", password: "off456", role: "officer", extra: "Water & Sanitation" },
    { id: "USR-501", name: "Karthik Subramanian", loginId: "user@complainease.org", password: "user123", role: "user", extra: "+91 98410-22334" }
];

const INITIAL_COMPLAINTS = [
    {
        id: "CMP-2026-801",
        userId: "USR-501",
        userName: "Karthik Subramanian",
        category: "Electricity & Streetlights",
        title: "Non-functional LED streetlights along NH-48 Service Road",
        description: "Four consecutive streetlight poles near the bus stop have been dark for 3 nights.",
        docRef: "streetlight_night_proof.jpg",
        coords: "13.0285° N, 80.0112° E (NH-48 & Civic Junction)",
        notifyChannel: "Email & SMS Alerts",
        status: "Resolved",
        assignedOfficer: "OFF-101 (Inspector Vikram Rao)",
        proofOfWork: "Replaced 4 faulty LED drivers and restored feeder line power. Verified illumination at 7:30 PM (Ref: WO-9921).",
        userFeedback: "Very fast response within 24 hours. Street is well lit now!",
        additionalNotes: [],
        createdAt: "2026-11-15"
    },
    {
        id: "CMP-2026-802",
        userId: "USR-501",
        userName: "Karthik Subramanian",
        category: "Water & Sanitation",
        title: "Overflowing storm drain near Central Green Park",
        description: "Blocked drainage grate causing water stagnation near the pedestrian walkway.",
        docRef: "drain_blockage.pdf",
        coords: "13.0310° N, 80.0145° E (Central Green Park)",
        notifyChannel: "SMS Only",
        status: "In Progress",
        assignedOfficer: "OFF-102 (Officer Meena Sundaram)",
        proofOfWork: "Jetting crew dispatched to site; silt removal 60% complete.",
        userFeedback: "",
        additionalNotes: ["Attached updated morning photo showing water level."],
        createdAt: "2026-11-18"
    }
];

const INITIAL_KB = [
    { q: "Streetlight or power outage in residential zone", a: "Submit under 'Electricity & Streetlights' with the nearest pole number and drop a map pin. Average resolution time is 24–48 hours." },
    { q: "Water pipeline leakage or blocked storm drain", a: "Select 'Water & Sanitation', attach a photo reference, and mark the exact street intersection on the Google Map widget." },
    { q: "How to track real-time complaint status via SMS/Email", a: "Open 'Complaint Status & Feedback' from the left navigation rail to view live status stages and officer proof-of-work updates." },
    { q: "Submitting additional evidence after filing a ticket", a: "In your Complaint Tracker, use the 'Add Extra Evidence / Info' box on any active complaint to append notes or document links." }
];

const INITIAL_BULLETINS = [
    { title: "OES 24/7 Civic Helpline Active", detail: "All road, water, and electrical grievances submitted on ComplainEase OES are routed automatically to ward field officers." },
    { title: "SMS & Email Gateway Online", detail: "Real-time status notifications and officer proof-of-work summaries are enabled for all registered citizens." }
];

const INITIAL_ADMIN_CONTACT = {
    name: "Chief OES Administrator — Grievance Redressal Cell",
    email: "admin-helpdesk@complainease.org",
    phone: "+91 44-2800-9911 (Toll-Free 1800-425-2026)",
    office: "Room 204, Municipal Civic Command Center, Chennai - 600001"
};

// Admin Feature Visibility Flags (Requirement: Admin can hide any kind of features from both users)
const DEFAULT_FEATURES = {
    knowledgeBase: { label: "Common Issues & Solutions Search (FAQ)", enabled: true },
    postComplaint: { label: "Post New Complaint Module", enabled: true },
    mapMarker: { label: "Google Map Location Pin Marker", enabled: true },
    trackStatus: { label: "Complaint Status, Evidence & Feedback", enabled: true },
    adminContact: { label: "Get Admin Contact Details Tab", enabled: true }
};
