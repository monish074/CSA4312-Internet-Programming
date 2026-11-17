const POLICY_PLANS = [
    {
        id: "PLN-H1",
        name: "VitalCare Comprehensive Health",
        type: "Health",
        monthlyPremium: 110,
        coverageLimit: "$500,000 / year",
        deductible: "$500",
        commissionRate: 0.12,
        description: "Full hospitalization, specialist consultations, preventive checkups, and cashless network hospital coverage.",
        benefits: ["100% Inpatient Hospitalization", "Zero-cost Annual Health Checkup", "Dental & Vision Rider Included", "24/7 Telemedicine Access"]
    },
    {
        id: "PLN-H2",
        name: "Family Shield Health Plus",
        type: "Health",
        monthlyPremium: 165,
        coverageLimit: "$1,000,000 / year",
        deductible: "$250",
        commissionRate: 0.14,
        description: "Floater health coverage for up to 5 family members with maternity, critical illness, and global emergency care.",
        benefits: ["Covers Spouse & 3 Children", "Maternity & Newborn Cover", "No-Claim Bonus up to 50%", "Worldwide Emergency Evacuation"]
    },
    {
        id: "PLN-A1",
        name: "DriveSafe Comprehensive Auto",
        type: "Auto",
        monthlyPremium: 78,
        coverageLimit: "$100,000 Collision & Liability",
        deductible: "$300",
        commissionRate: 0.10,
        description: "Complete bumper-to-bumper vehicle protection against accidents, theft, weather damage, and third-party liability.",
        benefits: ["Zero Depreciation Cover", "24/7 Roadside Towing Assistance", "Instant Digital Claim Settlement", "Third-Party Legal Liability"]
    },
    {
        id: "PLN-A2",
        name: "EcoRide Essential Auto",
        type: "Auto",
        monthlyPremium: 49,
        coverageLimit: "$50,000 Liability & Theft",
        deductible: "$500",
        commissionRate: 0.08,
        description: "Affordable everyday auto coverage ideal for city commuters with fast glass and theft protection.",
        benefits: ["Theft & Fire Protection", "Windshield Repair Waiver", "Personal Accident Cover", "Flexible Monthly Billing"]
    },
    {
        id: "PLN-HM1",
        name: "HavenGuard Total Home",
        type: "Home",
        monthlyPremium: 92,
        coverageLimit: "$450,000 Structure + Contents",
        deductible: "$750",
        commissionRate: 0.11,
        description: "Safeguards your home structure, electronics, jewelry, and valuables against fire, burglary, and natural calamities.",
        benefits: ["Fire, Flood & Storm Protection", "Burglary & Theft Reimbursement", "Temporary Relocation Allowance", "Smart-Home Security Discount"]
    }
];

const INITIAL_AGENTS = [
    {
        id: "AGT-101",
        name: "Sarah Jenkins",
        email: "agent@insureeasy.com",
        phone: "+1 555-301-8890",
        license: "LIC-78412",
        approved: true
    },
    {
        id: "AGT-102",
        name: "David Miller",
        email: "david.m@insureeasy.com",
        phone: "+1 555-409-2211",
        license: "LIC-89204",
        approved: false
    }
];

const INITIAL_CUSTOMERS = [
    {
        id: "CUST-501",
        name: "Rahul Sharma",
        email: "user@insureeasy.com",
        phone: "+91 98765-43210",
        address: "42 Green Park Avenue, Chennai",
        agentId: "AGT-101"
    },
    {
        id: "CUST-502",
        name: "Emily Carter",
        email: "emily.c@example.com",
        phone: "+1 555-823-9910",
        address: "18 Oakwood Lane, Austin, TX",
        agentId: "AGT-101"
    }
];

const INITIAL_USER_POLICIES = [
    {
        policyNumber: "POL-9001",
        customerId: "CUST-501",
        customerName: "Rahul Sharma",
        customerEmail: "user@insureeasy.com",
        customerPhone: "+91 98765-43210",
        planId: "PLN-H1",
        planName: "VitalCare Comprehensive Health",
        type: "Health",
        premium: 110,
        dueDate: "2026-11-22",
        paymentStatus: "Due Soon",
        agentId: "AGT-101"
    },
    {
        policyNumber: "POL-9002",
        customerId: "CUST-502",
        customerName: "Emily Carter",
        customerEmail: "emily.c@example.com",
        customerPhone: "+1 555-823-9910",
        planId: "PLN-A1",
        planName: "DriveSafe Comprehensive Auto",
        type: "Auto",
        premium: 78,
        dueDate: "2026-11-10",
        paymentStatus: "Overdue",
        agentId: "AGT-101"
    }
];

const INITIAL_SMS_ALERTS = [
    {
        id: "SMS-1",
        customerId: "CUST-501",
        customerName: "Rahul Sharma",
        phone: "+91 98765-43210",
        alertType: "Before Due Date",
        message: "InsureEasy Reminder: Dear Rahul Sharma, your Health Policy (POL-9001) premium of $110 is due on 2026-11-22. Pay on time to keep coverage active.",
        sentBy: "Sarah Jenkins (AGT-101)",
        timestamp: "2026-11-16 09:30 AM"
    },
    {
        id: "SMS-2",
        customerId: "CUST-502",
        customerName: "Emily Carter",
        phone: "+1 555-823-9910",
        alertType: "Exceeded Due Date",
        message: "URGENT InsureEasy Alert: Dear Emily Carter, your Auto Policy (POL-9002) due date (2026-11-10) has been exceeded. Please pay $78 immediately to avoid lapse.",
        sentBy: "Sarah Jenkins (AGT-101)",
        timestamp: "2026-11-17 08:15 AM"
    }
];
