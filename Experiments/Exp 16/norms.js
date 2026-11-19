// Exact Government Norms Specified in Prompt
const DEFAULT_TAX_NORMS = {
    standardDeduction: 50000,
    maxPensionDeduction: 150000,
    nilTaxThreshold: 500000, // "if net taxable is below 500,000/- tax is Nil"
    slab1Limit: 250000,      // 0 to 250,000 -> 0%
    slab2Limit: 500000,      // 250,001 to 500,000 -> 5% (net taxable income - 250,000)
    rate2: 5,
    slab3Limit: 1000000,     // 500,001 to 1,000,000 -> 12,500 + 20% (net taxable income - 500,000)
    rate3: 20,
    rate4: 30                // > 1,000,000 -> 112,500 + 30% (net taxable income - 1,000,000)
};

// Core Input Fields Configurable by Admin
const DEFAULT_CORE_FIELDS = [
    { id: "inpAnnualBonus", label: "Annual Bonus / Other Taxable Income", enabled: true },
    { id: "inpMonthlyHra", label: "Monthly House Rent Allowance (HRA × 12)", enabled: true },
    { id: "inpMonthlyPension", label: "Monthly Pension / Retirement Contribution (× 12)", enabled: true },
    { id: "inpMonthlyHealth", label: "Monthly Health Insurance Premium (× 12)", enabled: true }
];

const DEFAULT_CUSTOM_FIELDS = [
    { id: "cust_80ccd", label: "Additional NPS Contribution (Annual ₹)", effect: "deduction", cap: 50000, defaultValue: 0 }
];
