let plans = JSON.parse(localStorage.getItem('ie_plans')) || POLICY_PLANS;
let agents = JSON.parse(localStorage.getItem('ie_agents')) || INITIAL_AGENTS;
let customers = JSON.parse(localStorage.getItem('ie_customers')) || INITIAL_CUSTOMERS;
let userPolicies = JSON.parse(localStorage.getItem('ie_policies')) || INITIAL_USER_POLICIES;
let smsAlerts = JSON.parse(localStorage.getItem('ie_sms')) || INITIAL_SMS_ALERTS;
let claims = JSON.parse(localStorage.getItem('ie_claims')) || [];
let currentUser = JSON.parse(localStorage.getItem('ie_currentUser')) || null;
let compareList = [];
let authMode = 'login';

function saveAll() {
    localStorage.setItem('ie_plans', JSON.stringify(plans));
    localStorage.setItem('ie_agents', JSON.stringify(agents));
    localStorage.setItem('ie_customers', JSON.stringify(customers));
    localStorage.setItem('ie_policies', JSON.stringify(userPolicies));
    localStorage.setItem('ie_sms', JSON.stringify(smsAlerts));
    localStorage.setItem('ie_claims', JSON.stringify(claims));
    localStorage.setItem('ie_currentUser', JSON.stringify(currentUser));
}

document.addEventListener('DOMContentLoaded', () => {
    renderPolicyCatalog('All');
    updateNavUI();
});

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3200);
}

function navigateTo(view) {
    const views = ['homeView', 'compareView', 'userDashboardView', 'agentDashboardView', 'adminDashboardView'];
    views.forEach(v => document.getElementById(v).style.display = 'none');

    if (view === 'home') document.getElementById('homeView').style.display = 'block';
    if (view === 'compare') {
        document.getElementById('compareView').style.display = 'block';
        renderComparisonTable();
    }
    if (view === 'userDashboard') {
        if (!currentUser || currentUser.role !== 'user') { openAuthModal('login'); return; }
        document.getElementById('userDashboardView').style.display = 'block';
        renderUserDashboard();
    }
    if (view === 'agentDashboard') {
        if (!currentUser || currentUser.role !== 'agent') { openAuthModal('login'); return; }
        document.getElementById('agentDashboardView').style.display = 'block';
        renderAgentDashboard();
    }
    if (view === 'adminDashboard') {
        if (!currentUser || currentUser.role !== 'admin') { openAuthModal('login'); return; }
        document.getElementById('adminDashboardView').style.display = 'block';
        renderAdminDashboard();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Personalized Recommendation Engine
function getRecommendations(e) {
    e.preventDefault();
    const type = document.getElementById('recType').value;
    const budget = parseFloat(document.getElementById('recBudget').value);
    const matches = plans.filter(p => p.type === type && p.monthlyPremium <= budget);
    const box = document.getElementById('recResultBox');
    box.style.display = 'block';

    if (matches.length > 0) {
        const best = matches.sort((a, b) => b.monthlyPremium - a.monthlyPremium)[0];
        box.innerHTML = `<strong>Recommended Match:</strong> ${best.name} ($${best.monthlyPremium}/mo &bull; Coverage: ${best.coverageLimit}) <br><button class="btn-primary btn-xs" style="margin-top:6px;" onclick="openPolicyModal('${best.id}')">Apply Online</button>`;
    } else {
        const cheapest = plans.filter(p => p.type === type).sort((a, b) => a.monthlyPremium - b.monthlyPremium)[0];
        box.innerHTML = `No ${type} plan under $${budget}/mo. Closest option: <strong>${cheapest.name}</strong> at $${cheapest.monthlyPremium}/mo.`;
    }
}

// Catalog & Comparison Tool
function filterPolicies(type, btn) {
    document.querySelectorAll('.filter-pills .pill-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderPolicyCatalog(type);
}

function renderPolicyCatalog(filterType) {
    const grid = document.getElementById('policiesGrid');
    const list = filterType === 'All' ? plans : plans.filter(p => p.type === filterType);

    grid.innerHTML = list.map(p => {
        const isCompared = compareList.includes(p.id);
        return `
        <div class="policy-card">
            <span class="policy-type-tag tag-${p.type}">${p.type} Insurance</span>
            <h3>${p.name}</h3>
            <div class="policy-price">$${p.monthlyPremium} <span>/ month</span></div>
            <p class="muted-sm">Coverage: <strong>${p.coverageLimit}</strong> &bull; Deductible: ${p.deductible}</p>
            <ul class="benefit-list">
                ${p.benefits.map(b => `<li>✔ ${b}</li>`).join('')}
            </ul>
            <div class="card-btn-row">
                <button class="btn-secondary btn-sm" style="flex:1;" onclick="toggleCompare('${p.id}')">
                    ${isCompared ? '✓ Comparing' : '+ Compare'}
                </button>
                <button class="btn-primary btn-sm" style="flex:1.3;" onclick="openPolicyModal('${p.id}')">
                    Details & Apply
                </button>
            </div>
        </div>
        `;
    }).join('');
}

function toggleCompare(planId) {
    const idx = compareList.indexOf(planId);
    if (idx === -1) {
        if (compareList.length >= 3) { showToast("You can compare up to 3 policies at once."); return; }
        compareList.push(planId);
        showToast("Added policy to comparison tool");
    } else {
        compareList.splice(idx, 1);
        showToast("Removed from comparison");
    }
    document.getElementById('compareCount').textContent = compareList.length;
    renderPolicyCatalog('All');
}

function clearComparison() {
    compareList = [];
    document.getElementById('compareCount').textContent = '0';
    renderComparisonTable();
}

function renderComparisonTable() {
    const container = document.getElementById('comparisonTableContainer');
    const selected = plans.filter(p => compareList.includes(p.id));
    if (selected.length === 0) {
        container.innerHTML = `<p class="muted-text">No policies selected yet. Go to <strong>Explore Policies</strong> and click "+ Compare" on up to 3 plans.</p>`;
        return;
    }
    container.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Feature</th>
                        ${selected.map(p => `<th>${p.name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    <tr><td><strong>Category</strong></td>${selected.map(p => `<td>${p.type}</td>`).join('')}</tr>
                    <tr><td><strong>Monthly Premium</strong></td>${selected.map(p => `<td><strong>$${p.monthlyPremium}/mo</strong></td>`).join('')}</tr>
                    <tr><td><strong>Coverage Limit</strong></td>${selected.map(p => `<td>${p.coverageLimit}</td>`).join('')}</tr>
                    <tr><td><strong>Deductible</strong></td>${selected.map(p => `<td>${p.deductible}</td>`).join('')}</tr>
                    <tr><td><strong>Key Benefits</strong></td>${selected.map(p => `<td>${p.benefits.join('<br>')}</td>`).join('')}</tr>
                    <tr><td><strong>Action</strong></td>${selected.map(p => `<td><button class="btn-primary btn-xs" onclick="openPolicyModal('${p.id}')">Purchase Plan</button></td>`).join('')}</tr>
                </tbody>
            </table>
        </div>
    `;
}

// Policy Details & Online Purchase Application
function openPolicyModal(planId) {
    const p = plans.find(item => item.id === planId);
    if (!p) return;
    const body = document.getElementById('policyDetailBody');
    body.innerHTML = `
        <span class="policy-type-tag tag-${p.type}">${p.type} Insurance</span>
        <h2>${p.name}</h2>
        <div class="policy-price">$${p.monthlyPremium} <span>/ month</span></div>
        <p style="margin-bottom:12px;">${p.description}</p>
        <p class="muted-sm" style="margin-bottom:14px;"><strong>Coverage Limit:</strong> ${p.coverageLimit} | <strong>Deductible:</strong> ${p.deductible}</p>
        <h4>Included Benefits:</h4>
        <ul class="benefit-list">${p.benefits.map(b => `<li>✔ ${b}</li>`).join('')}</ul>
        <hr style="margin:14px 0; border:none; border-top:1px solid var(--border);">
        <h4>Secure Online Application</h4>
        <form onsubmit="purchasePolicyOnline(event, '${p.id}')" class="stacked-form">
            <input type="text" id="appHolderName" placeholder="Applicant Full Name" value="${currentUser ? currentUser.name : ''}" required>
            <input type="email" id="appHolderEmail" placeholder="Email Address" value="${currentUser ? currentUser.email : ''}" required>
            <input type="text" id="appHolderPhone" placeholder="Mobile Phone (for SMS Alerts)" value="${currentUser && currentUser.phone ? currentUser.phone : ''}" required>
            <button type="submit" class="btn-primary full-width">Complete Purchase & Activate Policy</button>
        </form>
    `;
    document.getElementById('policyDetailModal').style.display = 'block';
}

function purchasePolicyOnline(e, planId) {
    e.preventDefault();
    const plan = plans.find(p => p.id === planId);
    const name = document.getElementById('appHolderName').value.trim();
    const email = document.getElementById('appHolderEmail').value.trim();
    const phone = document.getElementById('appHolderPhone').value.trim();

    let cust = customers.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (!cust) {
        cust = {
            id: "CUST-" + Math.floor(600 + Math.random() * 399),
            name, email, phone,
            address: "Online Applicant",
            agentId: "AGT-101"
        };
        customers.push(cust);
    }

    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    const dueStr = nextMonth.toISOString().split('T')[0];

    const newPol = {
        policyNumber: "POL-" + Math.floor(1000 + Math.random() * 8999),
        customerId: cust.id,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        planId: plan.id,
        planName: plan.name,
        type: plan.type,
        premium: plan.monthlyPremium,
        dueDate: dueStr,
        paymentStatus: "Paid",
        agentId: cust.agentId || "AGT-101"
    };

    userPolicies.unshift(newPol);
    saveAll();
    closeModal('policyDetailModal');
    showToast(`Policy ${newPol.policyNumber} activated! Welcome to InsureEasy.`);

    if (currentUser && currentUser.role === 'user') navigateTo('userDashboard');
}

// AUTHENTICATION (Admin, Agent with Approval Check, User)
function openAuthModal(mode = 'login') {
    setAuthMode(mode);
    document.getElementById('authModal').style.display = 'block';
}

function setAuthMode(mode) {
    authMode = mode;
    document.getElementById('tabLogin').classList.toggle('active', mode === 'login');
    document.getElementById('tabRegister').classList.toggle('active', mode === 'register');
    document.getElementById('registerExtraFields').style.display = mode === 'register' ? 'block' : 'none';
    document.getElementById('authSubmitBtn').textContent = mode === 'login' ? 'Sign In' : 'Create Account';
    toggleRegisterRoleFields();
}

function toggleRegisterRoleFields() {
    const role = document.getElementById('authRole').value;
    document.getElementById('agentLicenseField').style.display = (authMode === 'register' && role === 'agent') ? 'block' : 'none';
}

function handleAuth(e) {
    e.preventDefault();
    const role = document.getElementById('authRole').value;
    const email = document.getElementById('authEmail').value.trim().toLowerCase();

    if (authMode === 'register') {
        const name = document.getElementById('regName').value.trim() || email.split('@')[0];
        const phone = document.getElementById('regPhone').value.trim() || '+1 555-010-9999';

        if (role === 'agent') {
            const license = document.getElementById('regLicense').value.trim() || 'LIC-' + Math.floor(10000 + Math.random() * 89999);
            const newAgent = {
                id: "AGT-" + Math.floor(200 + Math.random() * 700),
                name, email, phone, license,
                approved: false // Requires Admin approval before login
            };
            agents.push(newAgent);
            saveAll();
            closeModal('authModal');
            showToast("Agent registered! Please wait for Admin approval before logging in.");
            return;
        } else if (role === 'user') {
            let cust = customers.find(c => c.email.toLowerCase() === email);
            if (!cust) {
                cust = { id: "CUST-" + Math.floor(600 + Math.random() * 399), name, email, phone, address: "Registered Online", agentId: "AGT-101" };
                customers.push(cust);
            }
            currentUser = { role: 'user', id: cust.id, name: cust.name, email: cust.email, phone: cust.phone };
            saveAll();
            updateNavUI();
            closeModal('authModal');
            showToast(`Welcome to InsureEasy, ${cust.name}!`);
            navigateTo('userDashboard');
            return;
        }
    }

    // LOGIN FLOW
    if (role === 'admin') {
        currentUser = { role: 'admin', name: 'System Admin', email };
        saveAll(); updateNavUI(); closeModal('authModal');
        showToast("Logged in as Administrator");
        navigateTo('adminDashboard');
    } else if (role === 'agent') {
        const agent = agents.find(a => a.email.toLowerCase() === email);
        if (!agent) {
            showToast("Agent account not found. Please register first.");
            return;
        }
        if (!agent.approved) {
            showToast("Access Denied: Your Agent login is still pending Admin approval.");
            return;
        }
        currentUser = { role: 'agent', id: agent.id, name: agent.name, email: agent.email };
        saveAll(); updateNavUI(); closeModal('authModal');
        showToast(`Welcome back, Agent ${agent.name}!`);
        navigateTo('agentDashboard');
    } else {
        let cust = customers.find(c => c.email.toLowerCase() === email);
        if (!cust) {
            cust = { id: "CUST-" + Math.floor(600 + Math.random() * 399), name: email.split('@')[0], email, phone: "+1 555-222-3333", address: "Verified User", agentId: "AGT-101" };
            customers.push(cust);
        }
        currentUser = { role: 'user', id: cust.id, name: cust.name, email: cust.email, phone: cust.phone };
        saveAll(); updateNavUI(); closeModal('authModal');
        showToast(`Welcome back, ${cust.name}!`);
        navigateTo('userDashboard');
    }
}

function demoLogin(role) {
    if (role === 'admin') {
        currentUser = { role: 'admin', name: 'System Administrator', email: 'admin@insureeasy.com' };
        saveAll(); updateNavUI(); closeModal('authModal');
        navigateTo('adminDashboard');
    } else if (role === 'agent') {
        const ag = agents.find(a => a.approved) || agents[0];
        ag.approved = true;
        currentUser = { role: 'agent', id: ag.id, name: ag.name, email: ag.email };
        saveAll(); updateNavUI(); closeModal('authModal');
        navigateTo('agentDashboard');
    } else {
        const cust = customers[0];
        currentUser = { role: 'user', id: cust.id, name: cust.name, email: cust.email, phone: cust.phone };
        saveAll(); updateNavUI(); closeModal('authModal');
        navigateTo('userDashboard');
    }
}

function logout() {
    currentUser = null;
    saveAll();
    updateNavUI();
    navigateTo('home');
    showToast("Logged out successfully");
}

function updateNavUI() {
    document.getElementById('userDashNav').style.display = (currentUser && currentUser.role === 'user') ? 'inline-block' : 'none';
    document.getElementById('agentDashNav').style.display = (currentUser && currentUser.role === 'agent') ? 'inline-block' : 'none';
    document.getElementById('adminDashNav').style.display = (currentUser && currentUser.role === 'admin') ? 'inline-block' : 'none';

    const authDiv = document.getElementById('authControls');
    if (currentUser) {
        authDiv.innerHTML = `
            <span style="font-size:0.85rem; font-weight:600;">${currentUser.name} (${currentUser.role.toUpperCase()})</span>
            <button class="btn-secondary btn-xs" onclick="logout()">Logout</button>
        `;
    } else {
        authDiv.innerHTML = `
            <button class="btn-outline-dark btn-sm" onclick="openAuthModal('login')">Login</button>
            <button class="btn-primary btn-sm" onclick="openAuthModal('register')">Register</button>
        `;
    }
}

// USER DASHBOARD (Manage policy details, pay premiums, file claims, get SMS alerts)
function renderUserDashboard() {
    document.getElementById('userWelcomeSub').textContent = `Logged in as ${currentUser.name} (${currentUser.email})`;
    const myPolicies = userPolicies.filter(p => p.customerEmail.toLowerCase() === currentUser.email.toLowerCase());

    const polContainer = document.getElementById('userPoliciesList');
    const claimSelect = document.getElementById('claimPolicySelect');
    claimSelect.innerHTML = '';

    if (myPolicies.length === 0) {
        polContainer.innerHTML = `<p class="muted-text" style="margin-top:12px;">You have no active policies yet. Click "+ Purchase New Policy" to get started.</p>`;
    } else {
        polContainer.innerHTML = myPolicies.map(p => {
            const statusClass = p.paymentStatus === 'Paid' ? 'status-Paid' : (p.paymentStatus === 'Overdue' ? 'status-Overdue' : 'status-Due');
            return `
            <div class="user-policy-item">
                <div class="flex-between">
                    <strong>${p.planName} (${p.policyNumber})</strong>
                    <span class="status-badge ${statusClass}">${p.paymentStatus}</span>
                </div>
                <p class="muted-sm" style="margin:6px 0;">Type: ${p.type} | Monthly Premium: <strong>$${p.premium}</strong> | Due Date: <strong>${p.dueDate}</strong></p>
                <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
                    ${p.paymentStatus !== 'Paid' ? `<button class="btn-primary btn-xs" onclick="payUserPremium('${p.policyNumber}')">💳 Pay Premium ($${p.premium})</button>` : ''}
                    <button class="btn-secondary btn-xs" onclick="renewUserPolicy('${p.policyNumber}')">🔄 Renew Policy (+1 Yr)</button>
                </div>
            </div>
            `;
        }).join('');

        myPolicies.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.policyNumber;
            opt.textContent = `${p.policyNumber} - ${p.planName}`;
            claimSelect.appendChild(opt);
        });
    }

    // Render SMS Alerts for this user
    const mySms = smsAlerts.filter(s => s.customerId === currentUser.id || s.customerName.toLowerCase() === currentUser.name.toLowerCase());
    document.getElementById('smsUnreadBadge').textContent = `${mySms.length} SMS Alert(s)`;
    const smsBox = document.getElementById('userSmsList');
    if (mySms.length === 0) {
        smsBox.innerHTML = `<p class="muted-sm">No SMS alerts received yet.</p>`;
    } else {
        smsBox.innerHTML = mySms.map(s => `
            <div class="sms-item ${s.alertType === 'Exceeded Due Date' ? 'urgent' : ''}">
                <div class="flex-between" style="margin-bottom:4px;">
                    <strong>📲 ${s.alertType}</strong>
                    <span class="muted-sm">${s.timestamp}</span>
                </div>
                <p>${s.message}</p>
                <span class="muted-sm">From: ${s.sentBy}</span>
            </div>
        `).join('');
    }

    // Render Claims
    const myClaims = claims.filter(c => c.customerEmail.toLowerCase() === currentUser.email.toLowerCase());
    document.getElementById('userClaimsHistory').innerHTML = myClaims.map(c => `
        <div class="sms-item" style="margin-top:8px;">
            <strong>Claim #${c.id}</strong> (${c.policyNumber}) — $${c.amount} &bull; <span class="status-badge status-Approved">${c.status}</span>
            <p class="muted-sm">${c.reason}</p>
        </div>
    `).join('');
}

function payUserPremium(policyNumber) {
    const pol = userPolicies.find(p => p.policyNumber === policyNumber);
    if (!pol) return;
    pol.paymentStatus = 'Paid';
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + 30);
    pol.dueDate = nextDue.toISOString().split('T')[0];
    saveAll();
    renderUserDashboard();
    showToast(`Premium paid for ${policyNumber}! Next due date: ${pol.dueDate}`);
}

function renewUserPolicy(policyNumber) {
    const pol = userPolicies.find(p => p.policyNumber === policyNumber);
    if (!pol) return;
    pol.paymentStatus = 'Paid';
    const d = new Date(pol.dueDate);
    d.setFullYear(d.getFullYear() + 1);
    pol.dueDate = d.toISOString().split('T')[0];
    saveAll();
    renderUserDashboard();
    showToast(`Policy ${policyNumber} renewed through ${pol.dueDate}!`);
}

function submitUserClaim(e) {
    e.preventDefault();
    const policyNumber = document.getElementById('claimPolicySelect').value;
    const amount = document.getElementById('claimAmount').value;
    const reason = document.getElementById('claimReason').value.trim();
    claims.unshift({
        id: "CLM-" + Math.floor(1000 + Math.random() * 8999),
        policyNumber,
        customerEmail: currentUser.email,
        amount,
        reason,
        status: "Under Review"
    });
    saveAll();
    e.target.reset();
    renderUserDashboard();
    showToast("Claim submitted! Our team will process it within 24 hours.");
}

// AGENT PORTAL (Create Customer, Manage Customer Details, Manage Policy Details, Send SMS Alert)
function switchAgentTab(tab, btn) {
    document.querySelectorAll('#agentDashboardView .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('agentCustomersTab').style.display = tab === 'customers' ? 'block' : 'none';
    document.getElementById('agentPoliciesTab').style.display = tab === 'policies' ? 'block' : 'none';
    document.getElementById('agentSmsTab').style.display = tab === 'sms' ? 'block' : 'none';
}

function calculateAgentCommission(agentId) {
    const managed = userPolicies.filter(p => p.agentId === agentId);
    return managed.reduce((sum, pol) => {
        const plan = plans.find(pl => pl.id === pol.planId);
        const rate = plan ? plan.commissionRate : 0.10;
        return sum + (pol.premium * 12 * rate);
    }, 0);
}

function renderAgentDashboard() {
    const comm = calculateAgentCommission(currentUser.id);
    document.getElementById('agentCommissionTotal').textContent = `$${comm.toFixed(2)}`;

    // 1. Render Customers Table
    const custTbody = document.getElementById('agentCustomersTable');
    custTbody.innerHTML = customers.map((c, idx) => `
        <tr>
            <td><strong>${c.id}</strong></td>
            <td><input type="text" id="cust-name-${idx}" value="${c.name}"></td>
            <td><input type="email" id="cust-email-${idx}" value="${c.email}"></td>
            <td><input type="text" id="cust-phone-${idx}" value="${c.phone}"></td>
            <td><input type="text" id="cust-addr-${idx}" value="${c.address || ''}"></td>
            <td><button class="btn-primary btn-xs" onclick="agentSaveCustomer(${idx})">Update</button></td>
        </tr>
    `).join('');

    // Populate dropdowns for Policy Assignment & SMS Alert
    const assignCust = document.getElementById('assignCustSelect');
    const smsCust = document.getElementById('smsCustomerSelect');
    assignCust.innerHTML = '';
    smsCust.innerHTML = '';
    customers.forEach(c => {
        assignCust.innerHTML += `<option value="${c.id}">${c.name} (${c.id})</option>`;
        smsCust.innerHTML += `<option value="${c.id}">${c.name} — ${c.phone}</option>`;
    });

    const assignPlan = document.getElementById('assignPlanSelect');
    assignPlan.innerHTML = plans.map(p => `<option value="${p.id}">${p.name} ($${p.monthlyPremium}/mo)</option>`).join('');

    // 2. Render Policies Table
    const polTbody = document.getElementById('agentPoliciesTable');
    polTbody.innerHTML = userPolicies.map((p, idx) => `
        <tr>
            <td><strong>${p.policyNumber}</strong></td>
            <td>${p.customerName}<br><small class="muted-sm">${p.customerPhone}</small></td>
            <td>${p.planName}</td>
            <td><input type="number" id="pol-prem-${idx}" value="${p.premium}" style="width:80px;"></td>
            <td><input type="date" id="pol-due-${idx}" value="${p.dueDate}"></td>
            <td>
                <select id="pol-stat-${idx}">
                    ${["Paid", "Due Soon", "Overdue"].map(st => `<option value="${st}" ${p.paymentStatus === st ? 'selected' : ''}>${st}</option>`).join('')}
                </select>
            </td>
            <td><button class="btn-primary btn-xs" onclick="agentSavePolicy(${idx})">Save</button></td>
        </tr>
    `).join('');

    // 3. Render Sent SMS Log & Prefill Template
    prefillSmsTemplate();
    renderAgentSmsLog();
}

function agentCreateCustomer(e) {
    e.preventDefault();
    const newCust = {
        id: "CUST-" + Math.floor(600 + Math.random() * 399),
        name: document.getElementById('newCustName').value.trim(),
        email: document.getElementById('newCustEmail').value.trim(),
        phone: document.getElementById('newCustPhone').value.trim(),
        address: document.getElementById('newCustAddress').value.trim(),
        agentId: currentUser.id
    };
    customers.unshift(newCust);
    saveAll();
    e.target.reset();
    renderAgentDashboard();
    showToast(`Customer ${newCust.name} (${newCust.id}) created!`);
}

function agentSaveCustomer(idx) {
    customers[idx].name = document.getElementById(`cust-name-${idx}`).value.trim();
    customers[idx].email = document.getElementById(`cust-email-${idx}`).value.trim();
    customers[idx].phone = document.getElementById(`cust-phone-${idx}`).value.trim();
    customers[idx].address = document.getElementById(`cust-addr-${idx}`).value.trim();
    saveAll();
    renderAgentDashboard();
    showToast(`Updated customer details for ${customers[idx].name}`);
}

function agentAssignPolicy(e) {
    e.preventDefault();
    const custId = document.getElementById('assignCustSelect').value;
    const planId = document.getElementById('assignPlanSelect').value;
    const dueDate = document.getElementById('assignDueDate').value;
    const paymentStatus = document.getElementById('assignPayStatus').value;

    const cust = customers.find(c => c.id === custId);
    const plan = plans.find(p => p.id === planId);

    userPolicies.unshift({
        policyNumber: "POL-" + Math.floor(1000 + Math.random() * 8999),
        customerId: cust.id,
        customerName: cust.name,
        customerEmail: cust.email,
        customerPhone: cust.phone,
        planId: plan.id,
        planName: plan.name,
        type: plan.type,
        premium: plan.monthlyPremium,
        dueDate,
        paymentStatus,
        agentId: currentUser.id
    });
    saveAll();
    renderAgentDashboard();
    showToast(`Issued ${plan.name} to ${cust.name}`);
}

function agentSavePolicy(idx) {
    userPolicies[idx].premium = parseFloat(document.getElementById(`pol-prem-${idx}`).value);
    userPolicies[idx].dueDate = document.getElementById(`pol-due-${idx}`).value;
    userPolicies[idx].paymentStatus = document.getElementById(`pol-stat-${idx}`).value;
    saveAll();
    renderAgentDashboard();
    showToast(`Updated policy ${userPolicies[idx].policyNumber}`);
}

function prefillSmsTemplate() {
    const custId = document.getElementById('smsCustomerSelect').value;
    const alertType = document.getElementById('smsAlertType').value;
    const cust = customers.find(c => c.id === custId);
    if (!cust) return;
    const pol = userPolicies.find(p => p.customerId === cust.id);
    const polText = pol ? `${pol.planName} (${pol.policyNumber}) of $${pol.premium} due on ${pol.dueDate}` : `active insurance policy`;

    let msg = "";
    if (alertType === "Before Due Date") {
        msg = `InsureEasy Reminder: Dear ${cust.name}, your ${polText} is approaching its due date. Please pay before the due date to ensure uninterrupted coverage.`;
    } else if (alertType === "Exceeded Due Date") {
        msg = `URGENT InsureEasy Alert: Dear ${cust.name}, your ${polText} has EXCEEDED its due date. Please complete your payment immediately to prevent policy lapse.`;
    } else {
        msg = `InsureEasy Renewal Notice: Dear ${cust.name}, your ${polText} is up for annual renewal. Log in to InsureEasy to review and renew seamlessly.`;
    }
    document.getElementById('smsMessageBody').value = msg;
}

function agentSendSms(e) {
    e.preventDefault();
    const custId = document.getElementById('smsCustomerSelect').value;
    const alertType = document.getElementById('smsAlertType').value;
    const message = document.getElementById('smsMessageBody').value.trim();
    const cust = customers.find(c => c.id === custId);

    smsAlerts.unshift({
        id: "SMS-" + Math.floor(100 + Math.random() * 899),
        customerId: cust.id,
        customerName: cust.name,
        phone: cust.phone,
        alertType,
        message,
        sentBy: `${currentUser.name} (${currentUser.id})`,
        timestamp: new Date().toLocaleString()
    });
    saveAll();
    renderAgentSmsLog();
    showToast(`SMS Alert sent to ${cust.name} (${cust.phone})!`);
}

function renderAgentSmsLog() {
    const log = document.getElementById('agentSentSmsLog');
    log.innerHTML = smsAlerts.map(s => `
        <div class="sms-item ${s.alertType === 'Exceeded Due Date' ? 'urgent' : ''}">
            <div class="flex-between">
                <strong>To: ${s.customerName} (${s.phone})</strong>
                <span class="muted-sm">${s.timestamp}</span>
            </div>
            <span class="status-badge ${s.alertType === 'Exceeded Due Date' ? 'status-Overdue' : 'status-Due'}" style="display:inline-block; margin:4px 0;">${s.alertType}</span>
            <p>${s.message}</p>
        </div>
    `).join('');
}

// ADMIN CONSOLE (Approve Agent login, View all agent details)
function renderAdminDashboard() {
    const pendingCount = agents.filter(a => !a.approved).length;
    const totalComm = agents.reduce((sum, a) => sum + calculateAgentCommission(a.id), 0);

    document.getElementById('statTotalAgents').textContent = agents.length;
    document.getElementById('statPendingAgents').textContent = pendingCount;
    document.getElementById('statTotalPolicies').textContent = userPolicies.length;
    document.getElementById('statTotalCommissions').textContent = `$${totalComm.toFixed(2)}`;

    const tbody = document.getElementById('adminAgentsTable');
    tbody.innerHTML = agents.map((a, idx) => {
        const managedCount = userPolicies.filter(p => p.agentId === a.id).length;
        const commDue = calculateAgentCommission(a.id);
        return `
        <tr>
            <td><strong>${a.id}</strong></td>
            <td>${a.name}</td>
            <td>${a.email}</td>
            <td>${a.license}</td>
            <td>${a.phone}</td>
            <td>${managedCount}</td>
            <td><strong>$${commDue.toFixed(2)}</strong></td>
            <td>
                <span class="status-badge ${a.approved ? 'status-Approved' : 'status-Pending'}">
                    ${a.approved ? 'Approved' : 'Pending Approval'}
                </span>
            </td>
            <td>
                ${!a.approved
                    ? `<button class="btn-primary btn-xs" onclick="toggleAgentApproval(${idx}, true)">Approve Login</button>`
                    : `<button class="btn-secondary btn-xs" onclick="toggleAgentApproval(${idx}, false)">Revoke</button>`
                }
            </td>
        </tr>
        `;
    }).join('');
}

function toggleAgentApproval(idx, status) {
    agents[idx].approved = status;
    saveAll();
    renderAdminDashboard();
    showToast(status ? `Approved login access for Agent ${agents[idx].name}` : `Revoked access for ${agents[idx].name}`);
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }
window.onclick = function(e) { if (e.target.classList.contains('modal')) e.target.style.display = 'none'; };
