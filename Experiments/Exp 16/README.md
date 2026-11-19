# TaxEase — Employee Income Tax Calculator & Statutory Norms Engine

A self-contained front-end web application implementing the exact statutory income tax formula, slab rates, social/Gmail login, and administrator norms & field configuration engine.

## Statutory Formula & Tax Slabs Implemented
- **Net Taxable Income** = `(Gross Pay × 12) + Bonus - (HRA × 12) - Standard Deduction (₹50,000) - min(Pension × 12, ₹1,50,000) - (Health Insurance × 12)`
- **Nil Tax Condition**: If Net Taxable Income is below `₹5,00,000`, Tax = `Nil (₹0)`.
- **Progressive Slab Rates** (when Net Taxable Income ≥ `₹5,00,000`):
  - `₹0 to ₹2,50,000`: `0%`
  - `₹2,50,001 to ₹5,00,000`: `5% × (Net Taxable Income - 2,50,000)`
  - `₹5,00,001 to ₹10,00,000`: `₹12,500 + 20% × (Net Taxable Income - 5,00,000)`
  - `Above ₹10,00,000`: `₹1,12,500 + 30% × (Net Taxable Income - 10,00,000)`

## Features
- **Employee Portal**: Login via Gmail / LinkedIn / GitHub social credentials, enter earnings and deductions, view live SVG donut breakdown & slab table, read personalized tax-saving tips, and download a formatted Tax Summary Report.
- **Admin Portal**: Login to update employee input fields (toggle existing fields or add custom income/deduction fields) and modify government norms (Standard Deduction, Pension Cap, Nil-Tax threshold, and slab rates).

## How to Run
Extract the ZIP archive and open `index.html` in any web browser.
