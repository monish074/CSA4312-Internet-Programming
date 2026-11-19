let taxNorms = JSON.parse(localStorage.getItem('te_norms')) || { ...DEFAULT_TAX_NORMS };
let coreFields = JSON.parse(localStorage.getItem('te_coreFields')) || JSON.parse(JSON.stringify(DEFAULT_CORE_FIELDS));
let customFields = JSON.parse(localStorage.getItem('te_customFields')) || JSON.parse(JSON.stringify(DEFAULT_CUSTOM_FIELDS));
let loggedInUser = JSON.parse(localStorage.getItem('te_user')) || null;
let lastCalculationReport = null;

function saveConfig() {
    localStorage.setItem('te_norms', JSON.stringify(taxNorms));
    localStorage.setItem('te_coreFields', JSON.stringify(coreFields));
    localStorage.setItem('te_customFields', JSON.stringify(customFields));
    localStorage.setItem('te_user', JSON.stringify(loggedInUser));
}

document.addEventListener('DOMContentLoaded', () => {
    renderAuthHeader();
    syncEmployeeFormWithAdminConfig();
    calculateEmployeeTax();
});

function showToast(msg) {
    const t = document.getElementById('toastBanner');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3200);
}

function formatINR(num) {
    return '₹' + Math.round(num).toLocaleString('en-IN');
}

// Mode Switcher (Employee vs Admin)
function switchMode(mode, btn) {
    if (mode === 'admin' && (!loggedInUser || loggedInUser.role !== 'admin')) {
        openSocialAuthModal('admin');
        return;
    }
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.getElementById('employeeWorkspace').style.display = mode === 'employee' ? 'block' : 'none';
    document.getElementById('adminWorkspace').style.display = mode === 'admin' ? 'block' : 'none';

    if (mode === 'employee') {
        syncEmployeeFormWithAdminConfig();
        calculateEmployeeTax();
    } else {
        loadAdminWorkspace();
    }
}

// Sync Employee Form with Admin Norms & Fields
function syncEmployeeFormWithAdminConfig() {
    document.getElementById('inpStdDeductionDisplay').value = taxNorms.standardDeduction;
    document.getElementById('activeNormBadge').textContent = `Std Deduction: ${formatINR(taxNorms.standardDeduction)} | Pension Cap: ${formatINR(taxNorms.maxPensionDeduction)} | Nil Tax < ${formatINR(taxNorms.nilTaxThreshold)}`;

    // Toggle visibility of core fields based on Admin settings
    coreFields.forEach(cf => {
        const inputEl = document.getElementById(cf.id);
        if (inputEl && inputEl.parentElement) {
            inputEl.parentElement.style.display = cf.enabled ? 'block' : 'none';
            if (!cf.enabled) inputEl.value = 0;
        }
    });

    // Render Admin-added custom fields
    const customContainer = document.getElementById('dynamicCustomFieldsContainer');
    if (customFields.length === 0) {
        customContainer.innerHTML = '';
        return;
    }
    customContainer.innerHTML = `
        <div class="form-section-label">Additional Admin-Configured Fields</div>
        <div class="input-grid-2">
            ${customFields.map(f => `
                <div class="field-group">
                    <label>${f.label} <span class="hint">(${f.effect === 'deduction' ? 'Deduction' : 'Taxable Income'}${f.cap > 0 ? ', Max ' + formatINR(f.cap) : ''})</span></label>
                    <input type="number" id="${f.id}" value="${f.defaultValue || 0}" min="0" step="100">
                </div>
            `).join('')}
        </div>
    `;
}

// Exact Tax Calculation Engine Following Prompt Norms
function calculateEmployeeTax(e) {
    if (e) e.preventDefault();

    const monthlyGross = parseFloat(document.getElementById('inpMonthlyGross').value) || 0;
    const annualBonus = parseFloat(document.getElementById('inpAnnualBonus').value) || 0;
    const monthlyHra = parseFloat(document.getElementById('inpMonthlyHra').value) || 0;
    const monthlyPension = parseFloat(document.getElementById('inpMonthlyPension').value) || 0;
    const monthlyHealth = parseFloat(document.getElementById('inpMonthlyHealth').value) || 0;

    const annualGross = monthlyGross * 12;
    const totalGrossIncome = annualGross + annualBonus;

    const annualHra = monthlyHra * 12;
    const stdDeduction = Number(taxNorms.standardDeduction);
    const rawAnnualPension = monthlyPension * 12;
    const allowedPension = Math.min(rawAnnualPension, Number(taxNorms.maxPensionDeduction));
    const annualHealth = monthlyHealth * 12;

    // Evaluate custom fields
    let customIncomeSum = 0;
    let customDeductionSum = 0;
    customFields.forEach(cf => {
        const el = document.getElementById(cf.id);
        const val = el ? (parseFloat(el.value) || 0) : 0;
        const effectiveVal = cf.cap > 0 ? Math.min(val, cf.cap) : val;
        if (cf.effect === 'income') customIncomeSum += effectiveVal;
        else customDeductionSum += effectiveVal;
    });

    const totalEarnings = totalGrossIncome + customIncomeSum;
    const totalDeductions = annualHra + stdDeduction + allowedPension + annualHealth + customDeductionSum;

    // Formula from prompt:
    // Net Taxable Income = (Gross pay * 12) - (HRA * 12) - (Standard Deduction = 50,000) - min(Pension * 12, 150,000) - (Health Insurance * 12)
    const netTaxableIncome = Math.max(0, totalEarnings - totalDeductions);

    // Tax Slab Calculation per prompt
    let totalTax = 0;
    const s1 = Number(taxNorms.slab1Limit);
    const s2 = Number(taxNorms.slab2Limit);
    const s3 = Number(taxNorms.slab3Limit);
    const r2 = Number(taxNorms.rate2) / 100;
    const r3 = Number(taxNorms.rate3) / 100;
    const r4 = Number(taxNorms.rate4) / 100;

    let slab1Tax = 0, slab2Tax = 0, slab3Tax = 0, slab4Tax = 0;
    let slab2Taxable = 0, slab3Taxable = 0, slab4Taxable = 0;

    if (netTaxableIncome < Number(taxNorms.nilTaxThreshold)) {
        // Condition: "if net taxable is below 500,000/- tax is Nil."
        totalTax = 0;
    } else {
        if (netTaxableIncome > s1) {
            slab2Taxable = Math.min(netTaxableIncome, s2) - s1;
            slab2Tax = slab2Taxable * r2;
        }
        if (netTaxableIncome > s2) {
            slab3Taxable = Math.min(netTaxableIncome, s3) - s2;
            slab3Tax = slab3Taxable * r3;
        }
        if (netTaxableIncome > s3) {
            slab4Taxable = netTaxableIncome - s3;
            slab4Tax = slab4Taxable * r4;
        }
        totalTax = slab2Tax + slab3Tax + slab4Tax;
    }

    const netIncomeAfterTax = totalEarnings - totalTax;

    // Update KPI Readouts
    document.getElementById('resGrossTotal').textContent = formatINR(totalEarnings);
    document.getElementById('resTotalDeductions').textContent = '- ' + formatINR(totalDeductions);
    document.getElementById('resNetTaxable').textContent = formatINR(netTaxableIncome);
    document.getElementById('resTotalTax').textContent = formatINR(totalTax);
    document.getElementById('resNetAfterTax').textContent = formatINR(netIncomeAfterTax);

    // Update Slab Breakdown Table
    const tbody = document.getElementById('slabBreakdownBody');
    if (netTaxableIncome < Number(taxNorms.nilTaxThreshold)) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="color:var(--emerald-dark); font-weight:700;">
                    ✅ Net Taxable Income (${formatINR(netTaxableIncome)}) is below ${formatINR(taxNorms.nilTaxThreshold)} — Applicable Income Tax is NIL (₹0).
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = `
            <tr>
                <td>₹0 to ${formatINR(s1)}</td>
                <td>0%</td>
                <td>${formatINR(Math.min(netTaxableIncome, s1))}</td>
                <td>₹0</td>
            </tr>
            <tr>
                <td>${formatINR(s1 + 1)} to ${formatINR(s2)}</td>
                <td>${taxNorms.rate2}%</td>
                <td>${formatINR(slab2Taxable)}</td>
                <td>${formatINR(slab2Tax)}</td>
            </tr>
            <tr>
                <td>${formatINR(s2 + 1)} to ${formatINR(s3)}</td>
                <td>${taxNorms.rate3}%</td>
                <td>${formatINR(slab3Taxable)}</td>
                <td>${formatINR(slab3Tax)}</td>
            </tr>
            <tr>
                <td>Above ${formatINR(s3)}</td>
                <td>${taxNorms.rate4}%</td>
                <td>${formatINR(slab4Taxable)}</td>
                <td>${formatINR(slab4Tax)}</td>
            </tr>
        `;
    }

    renderDonutChart(netIncomeAfterTax, totalTax);
    renderTaxSavingTips(rawAnnualPension, annualHra, annualHealth, netTaxableIncome);

    // Store report snapshot for download
    lastCalculationReport = {
        employee: loggedInUser ? `${loggedInUser.name} (${loggedInUser.email})` : 'Guest Employee',
        date: new Date().toLocaleDateString(),
        annualGross,
        annualBonus,
        totalEarnings,
        annualHra,
        stdDeduction,
        rawAnnualPension,
        allowedPension,
        annualHealth,
        totalDeductions,
        netTaxableIncome,
        totalTax,
        netIncomeAfterTax
    };
}

function renderDonutChart(netIncome, taxAmount) {
    const total = Math.max(1, netIncome + taxAmount);
    const taxPct = Math.min(100, (taxAmount / total) * 100);
    const netPct = 100 - taxPct;
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const netStroke = (netPct / 100) * circumference;
    const taxStroke = (taxPct / 100) * circumference;

    document.getElementById('taxDonutChart').innerHTML = `
        <svg viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#e2e8f0" stroke-width="18"/>
            <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#059669" stroke-width="18"
                stroke-dasharray="${netStroke} ${circumference}" transform="rotate(-90 80 80)"/>
            <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#e11d48" stroke-width="18"
                stroke-dasharray="${taxStroke} ${circumference}" stroke-dashoffset="-${netStroke}" transform="rotate(-90 80 80)"/>
            <text x="80" y="76" text-anchor="middle" font-size="11" fill="#64748b" font-weight="bold">EFFECTIVE TAX</text>
            <text x="80" y="95" text-anchor="middle" font-size="16" fill="#0f172a" font-weight="900">${taxPct.toFixed(1)}%</text>
        </svg>
    `;
}

function renderTaxSavingTips(rawPension, annualHra, annualHealth, netTaxable) {
    const tips = [];
    const maxPen = Number(taxNorms.maxPensionDeduction);
    if (rawPension < maxPen) {
        tips.push(`You can invest <strong>${formatINR(maxPen - rawPension)}</strong> more in Pension / 80C instruments to reach the ${formatINR(maxPen)} maximum deduction cap.`);
    } else if (rawPension > maxPen) {
        tips.push(`Your annual pension contribution (${formatINR(rawPension)}) exceeds the statutory cap of ${formatINR(maxPen)}; deduction is capped at ${formatINR(maxPen)}.`);
    }
    if (annualHealth === 0) {
        tips.push(`Adding a Health Insurance policy lowers your Net Taxable Income directly under medical premium exemptions.`);
    }
    if (netTaxable >= Number(taxNorms.nilTaxThreshold) && (netTaxable - Number(taxNorms.nilTaxThreshold)) <= 40000) {
        tips.push(`You are only <strong>${formatINR(netTaxable - Number(taxNorms.nilTaxThreshold) + 1)}</strong> above the ${formatINR(taxNorms.nilTaxThreshold)} Nil-Tax threshold—maximizing eligible deductions can bring your tax liability to ₹0!`);
    }
    if (tips.length === 0) {
        tips.push(`Great job! Your statutory deductions are well-optimized under current government norms.`);
    }

    document.getElementById('taxSavingTipsBox').innerHTML = `
        <strong>💡 Personalized Tax-Saving Insights:</strong>
        <ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>
    `;
}

// Downloadable Tax Summary Report
function downloadTaxSummaryReport() {
    if (!lastCalculationReport) calculateEmployeeTax();
    const r = lastCalculationReport;
    const reportText = [
        "================================================================",
        "               TAXEASE — INCOME TAX SUMMARY REPORT              ",
        "================================================================",
        `Employee       : ${r.employee}`,
        `Generated Date : ${r.date}`,
        "----------------------------------------------------------------",
        "1. EARNINGS & TAXABLE INCOME",
        `   Annual Gross Pay (Monthly x 12)      : ${formatINR(r.annualGross)}`,
        `   Annual Bonus / Other Taxable Income  : ${formatINR(r.annualBonus)}`,
        `   Total Gross Earnings                 : ${formatINR(r.totalEarnings)}`,
        "",
        "2. EXEMPTIONS & DEDUCTIONS (PER GOVERNMENT NORMS)",
        `   House Rent Allowance (HRA x 12)      : - ${formatINR(r.annualHra)}`,
        `   Standard Deduction                   : - ${formatINR(r.stdDeduction)}`,
        `   Pension Deduction (Capped)           : - ${formatINR(r.allowedPension)} (Contributed: ${formatINR(r.rawAnnualPension)})`,
        `   Health Insurance Premium (x 12)      : - ${formatINR(r.annualHealth)}`,
        `   Total Allowed Deductions             : - ${formatINR(r.totalDeductions)}`,
        "",
        "3. TAX COMPUTATION SUMMARY",
        `   Net Taxable Income                   : ${formatINR(r.netTaxableIncome)}`,
        `   Applicable Income Tax Liability      : ${formatINR(r.totalTax)}`,
        `   Net Annual Take-Home Income After Tax: ${formatINR(r.netIncomeAfterTax)}`,
        "================================================================"
    ].join("
");

    const blob = new Blob([reportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TaxEase-Income-Tax-Summary-Report.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Downloaded TaxEase Summary Report!");
}

// =========================================================
// ADMIN WORKSPACE LOGIC
// =========================================================
function loadAdminWorkspace() {
    document.getElementById('admStdDeduction').value = taxNorms.standardDeduction;
    document.getElementById('admMaxPension').value = taxNorms.maxPensionDeduction;
    document.getElementById('admRebateLimit').value = taxNorms.nilTaxThreshold;
    document.getElementById('admSlab1Limit').value = taxNorms.slab1Limit;
    document.getElementById('admRate2').value = taxNorms.rate2;
    document.getElementById('admSlab2Limit').value = taxNorms.slab2Limit;
    document.getElementById('admRate3').value = taxNorms.rate3;
    document.getElementById('admSlab3Limit').value = taxNorms.slab3Limit;
    document.getElementById('admRate4').value = taxNorms.rate4;

    // Render Core Field Toggles
    document.getElementById('coreFieldsToggleList').innerHTML = coreFields.map((cf, idx) => `
        <div class="check-item-row">
            <span><strong>${cf.label}</strong></span>
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="checkbox" ${cf.enabled ? 'checked' : ''} onchange="toggleCoreField(${idx})">
                <span>${cf.enabled ? 'Required / Visible' : 'Hidden'}</span>
            </label>
        </div>
    `).join('');

    // Render Custom Fields List
    document.getElementById('customFieldsList').innerHTML = customFields.map((f, idx) => `
        <div class="check-item-row">
            <div>
                <strong>${f.label}</strong><br>
                <small style="color:var(--muted);">Type: ${f.effect.toUpperCase()} | Cap: ${f.cap > 0 ? formatINR(f.cap) : 'Unlimited'}</small>
            </div>
            <button type="button" class="btn-dark btn-xs" style="background:#fee2e2; color:#991b1b;" onclick="removeCustomField(${idx})">Remove</button>
        </div>
    `).join('');
}

function adminSaveTaxNorms(e) {
    e.preventDefault();
    taxNorms.standardDeduction = parseFloat(document.getElementById('admStdDeduction').value);
    taxNorms.maxPensionDeduction = parseFloat(document.getElementById('admMaxPension').value);
    taxNorms.nilTaxThreshold = parseFloat(document.getElementById('admRebateLimit').value);
    taxNorms.slab1Limit = parseFloat(document.getElementById('admSlab1Limit').value);
    taxNorms.rate2 = parseFloat(document.getElementById('admRate2').value);
    taxNorms.slab2Limit = parseFloat(document.getElementById('admSlab2Limit').value);
    taxNorms.rate3 = parseFloat(document.getElementById('admRate3').value);
    taxNorms.slab3Limit = parseFloat(document.getElementById('admSlab3Limit').value);
    taxNorms.rate4 = parseFloat(document.getElementById('admRate4').value);

    saveConfig();
    showToast("Updated government tax norms & slab rates!");
}

function resetNormsToDefault() {
    taxNorms = { ...DEFAULT_TAX_NORMS };
    saveConfig();
    loadAdminWorkspace();
    showToast("Restored default government tax norms.");
}

function toggleCoreField(idx) {
    coreFields[idx].enabled = !coreFields[idx].enabled;
    saveConfig();
    loadAdminWorkspace();
    showToast(`Updated field "${coreFields[idx].label}"`);
}

function adminAddCustomField(e) {
    e.preventDefault();
    const label = document.getElementById('newFieldLabel').value.trim();
    const effect = document.getElementById('newFieldEffect').value;
    const cap = parseFloat(document.getElementById('newFieldCap').value) || 0;

    customFields.push({
        id: "cust_" + Date.now(),
        label,
        effect,
        cap,
        defaultValue: 0
    });
    saveConfig();
    e.target.reset();
    loadAdminWorkspace();
    showToast(`Added "${label}" to Employee Tax Form!`);
}

function removeCustomField(idx) {
    customFields.splice(idx, 1);
    saveConfig();
    loadAdminWorkspace();
    showToast("Removed custom field.");
}

// =========================================================
// AUTHENTICATION (Social Media / Gmail Login & Admin Login)
// =========================================================
function openSocialAuthModal(defaultTab = 'employee') {
    switchAuthTab(defaultTab);
    document.getElementById('authModal').style.display = 'block';
}

function closeSocialAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function switchAuthTab(tab) {
    document.getElementById('tabEmpAuth').classList.toggle('active', tab === 'employee');
    document.getElementById('tabAdmAuth').classList.toggle('active', tab === 'admin');
    document.getElementById('empAuthBody').style.display = tab === 'employee' ? 'block' : 'none';
    document.getElementById('admAuthBody').style.display = tab === 'admin' ? 'block' : 'none';
}

function loginWithSocial(provider, name, email) {
    loggedInUser = { role: 'employee', provider, name, email };
    saveConfig();
    renderAuthHeader();
    closeSocialAuthModal();
    switchMode('employee', document.getElementById('navEmpBtn'));
    showToast(`Authenticated via ${provider} (${email})`);
}

function loginWithCustomEmail(e) {
    e.preventDefault();
    const name = document.getElementById('customEmpName').value.trim();
    const email = document.getElementById('customEmpEmail').value.trim();
    loginWithSocial('Email Auth', name, email);
}

function handleAdminLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminUserInp').value.trim();
    loggedInUser = { role: 'admin', provider: 'Admin Portal', name: 'Payroll Administrator', email };
    saveConfig();
    renderAuthHeader();
    closeSocialAuthModal();
    switchMode('admin', document.getElementById('navAdmBtn'));
    showToast("Signed in as TaxEase Administrator");
}

function logoutAccount() {
    loggedInUser = null;
    saveConfig();
    renderAuthHeader();
    switchMode('employee', document.getElementById('navEmpBtn'));
    showToast("Logged out.");
}

function renderAuthHeader() {
    const box = document.getElementById('authStatusBox');
    const greet = document.getElementById('empGreeting');
    if (loggedInUser) {
        box.innerHTML = `
            <span style="font-size:0.84rem; margin-right:8px;">${loggedInUser.name} (${loggedInUser.provider})</span>
            <button class="btn-dark btn-xs" style="background:#334155;" onclick="logoutAccount()">Logout</button>
        `;
        greet.textContent = `Welcome, ${loggedInUser.name} (${loggedInUser.email})`;
    } else {
        box.innerHTML = `<button class="btn-emerald btn-sm" onclick="openSocialAuthModal()">Employee / Admin Login</button>`;
        greet.textContent = `Welcome, Guest Employee`;
    }
}

window.onclick = function(e) { if (e.target.classList.contains('modal-overlay')) closeSocialAuthModal(); };
