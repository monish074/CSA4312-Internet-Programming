let tolls = JSON.parse(localStorage.getItem('et_tolls')) || INITIAL_TOLLS;
let users = JSON.parse(localStorage.getItem('et_users')) || INITIAL_USERS;
let gateOperators = JSON.parse(localStorage.getItem('et_gates')) || INITIAL_GATE_OPERATORS;
let vehicles = JSON.parse(localStorage.getItem('et_vehicles')) || INITIAL_VEHICLES;
let passes = JSON.parse(localStorage.getItem('et_passes')) || INITIAL_PASSES;
let eTickets = JSON.parse(localStorage.getItem('et_etickets')) || INITIAL_ETICKETS;
let transactions = JSON.parse(localStorage.getItem('et_txns')) || INITIAL_TRANSACTIONS;
let gateLogs = JSON.parse(localStorage.getItem('et_gatelogs')) || [];

let activeDriver = users[0];
let activeOperator = gateOperators[0];
let activeRole = 'driver';
let authMode = 'login';

function syncStorage() {
    localStorage.setItem('et_tolls', JSON.stringify(tolls));
    localStorage.setItem('et_users', JSON.stringify(users));
    localStorage.setItem('et_gates', JSON.stringify(gateOperators));
    localStorage.setItem('et_vehicles', JSON.stringify(vehicles));
    localStorage.setItem('et_passes', JSON.stringify(passes));
    localStorage.setItem('et_etickets', JSON.stringify(eTickets));
    localStorage.setItem('et_txns', JSON.stringify(transactions));
    localStorage.setItem('et_gatelogs', JSON.stringify(gateLogs));
}

document.addEventListener('DOMContentLoaded', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('eticketDate').value = tomorrow.toISOString().split('T')[0];

    renderDriverPortal();
    renderGatePortal();
    renderAdminPortal();
});

function showToast(msg) {
    const t = document.getElementById('toastMsg');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3200);
}

// Deterministic SVG QR Code Generator (Zero external dependencies)
function buildQrSvg(codeText) {
    let hash = 0;
    for (let i = 0; i < codeText.length; i++) {
        hash = ((hash << 5) - hash) + codeText.charCodeAt(i);
        hash |= 0;
    }
    const size = 21;
    let cells = '';
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const isFinder = (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
            let filled = false;
            if (isFinder) {
                const lr = r >= size - 7 ? r - (size - 7) : r;
                const lc = c >= size - 7 ? c - (size - 7) : c;
                filled = (lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4));
            } else {
                filled = ((Math.abs(hash + r * 31 + c * 17) % 3) === 0);
            }
            if (filled) {
                cells += `<rect x="${c * 10 + 10}" y="${r * 10 + 10}" width="10" height="10" fill="#0b132b"/>`;
            }
        }
    }
    return `<svg viewBox="0 0 230 230" xmlns="http://www.w3.org/2000/svg">
        <rect width="230" height="230" fill="#ffffff"/>
        ${cells}
        <text x="115" y="226" text-anchor="middle" font-family="monospace" font-size="11" font-weight="bold" fill="#0b132b">${codeText}</text>
    </svg>`;
}

// Role Portal Switcher
function switchRolePortal(role, btn) {
    activeRole = role;
    document.querySelectorAll('.seg-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.getElementById('portal-driver').style.display = role === 'driver' ? 'block' : 'none';
    document.getElementById('portal-gate').style.display = role === 'gate' ? 'block' : 'none';
    document.getElementById('portal-admin').style.display = role === 'admin' ? 'block' : 'none';

    if (role === 'driver') renderDriverPortal();
    if (role === 'gate') renderGatePortal();
    if (role === 'admin') renderAdminPortal();
}

// =========================================================
// DRIVER / USER PORTAL LOGIC
// =========================================================
function openDriverTab(tabName, btn) {
    document.querySelectorAll('.driver-tab-panel').forEach(p => p.style.display = 'none');
    document.querySelectorAll('#portal-driver .sub-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.getElementById(`dtab-${tabName}`).style.display = 'block';
}

function renderDriverPortal() {
    document.getElementById('heroHolderName').textContent = activeDriver.name;
    document.getElementById('walletBalanceDisplay').textContent = `$${Number(activeDriver.walletBalance).toFixed(2)}`;
    document.getElementById('autoPayCheckbox').checked = activeDriver.autoPay;

    const primaryPass = passes.find(p => p.status === 'Approved') || passes[0];
    if (primaryPass) {
        document.getElementById('heroVehiclePlate').textContent = primaryPass.vehiclePlate;
        document.getElementById('heroPassId').textContent = primaryPass.passId;
        document.getElementById('heroPassExpiry').textContent = primaryPass.validUntil;
        document.getElementById('heroPassStatus').textContent = primaryPass.status.toUpperCase();
    }

    // Populate Toll & Vehicle dropdowns
    const tollOptions = tolls.map(t => `<option value="${t.id}">${t.name} ($${t.baseFee.toFixed(2)})</option>`).join('');
    document.getElementById('eticketTollSelect').innerHTML = tollOptions;
    document.getElementById('passTollSelect').innerHTML = tollOptions;

    const vehOptions = vehicles.map(v => `<option value="${v.plate}">${v.plate} (${v.model})</option>`).join('');
    document.getElementById('eticketVehicleSelect').innerHTML = vehOptions;
    document.getElementById('passVehicleSelect').innerHTML = vehOptions;
    updateETicketFare();

    // Render User eTickets
    document.getElementById('userETicketsGrid').innerHTML = eTickets.map(t => `
        <div class="ticket-tile">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                <strong>${t.ticketId}</strong>
                <span class="badge-ok">${t.status}</span>
            </div>
            <p style="font-size:0.88rem; font-weight:700;">${t.tollName}</p>
            <p class="muted-xs">Vehicle: ${t.vehiclePlate} &bull; ${t.tripType} Trip &bull; Date: ${t.travelDate}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                <strong>Paid: $${Number(t.farePaid).toFixed(2)}</strong>
                <button class="btn-primary btn-xs" style="padding:5px 10px; font-size:0.78rem;" onclick="openQrPopup('${t.ticketId}', '${t.tollName} (${t.vehiclePlate})')">View eTicket QR</button>
            </div>
        </div>
    `).join('');

    // Render User Passes (Renewal & Get QR Code)
    document.getElementById('userPassesList').innerHTML = passes.map((p, idx) => `
        <div class="list-row-card">
            <div>
                <strong>${p.passId}</strong> &bull; ${p.vehiclePlate}
                <span class="${p.status === 'Approved' ? 'badge-ok' : 'badge-wait'}" style="margin-left:6px;">${p.status}</span>
                <div class="muted-xs">${p.tollName} | ${p.plan} | Valid Until: <strong>${p.validUntil}</strong></div>
            </div>
            <div style="display:flex; gap:6px;">
                ${p.status === 'Approved' ? `<button class="btn-primary btn-xs" style="padding:6px 10px; font-size:0.78rem;" onclick="openQrPopup('${p.passId}', 'Toll Pass • ${p.vehiclePlate}')">Get QR Code</button>` : ''}
                <button class="btn-amber btn-xs" style="padding:6px 10px; font-size:0.78rem;" onclick="renewTollPass(${idx})">Renew Pass</button>
            </div>
        </div>
    `).join('');

    // Render Vehicles Table
    document.getElementById('vehiclesTableContainer').innerHTML = `
        <table class="data-table">
            <thead><tr><th>Plate Number</th><th>Class</th><th>Model</th><th>Recurring Auto-Pay Route</th></tr></thead>
            <tbody>
                ${vehicles.map(v => `<tr><td><strong>${v.plate}</strong></td><td>${v.vehicleClass}</td><td>${v.model}</td><td>${v.recurringRoute || 'None'}</td></tr>`).join('')}
            </tbody>
        </table>
    `;

    // Render Transactions & Notifications
    document.getElementById('walletTransactionsList').innerHTML = transactions.map(tx => `
        <div class="list-row-card">
            <div>
                <strong style="font-size:0.88rem;">${tx.title}</strong>
                <div class="muted-xs">${tx.date} &bull; Ref: ${tx.id}</div>
            </div>
            <strong style="color:${tx.type === 'credit' ? 'var(--teal)' : 'var(--text)'};">${tx.amount}</strong>
        </div>
    `).join('');

    document.getElementById('driverNotificationsList').innerHTML = `
        <div class="list-row-card"><div><strong>🔔 Upcoming Travel Alert:</strong> Pre-booked eTicket <code>TKT-5501</code> is ready for Paranur Express Toll Gate.</div></div>
        <div class="list-row-card"><div><strong>🛡️ Auto-Pay Status:</strong> ${activeDriver.autoPay ? 'Enabled — low balance auto-recharge active.' : 'Paused.'}</div></div>
    `;
}

function handleAddMoney(e) {
    e.preventDefault();
    const amt = parseFloat(document.getElementById('topupAmount').value);
    const method = document.getElementById('topupMethod').value;
    if (isNaN(amt) || amt <= 0) return;

    activeDriver.walletBalance += amt;
    transactions.unshift({
        id: "TXN-" + Math.floor(100 + Math.random() * 899),
        date: new Date().toISOString().split('T')[0],
        title: `eWallet Top-Up (${method})`,
        amount: `+$${amt.toFixed(2)}`,
        type: "credit"
    });
    syncStorage();
    renderDriverPortal();
    showToast(`Added $${amt.toFixed(2)} to your EasyToll eWallet!`);
}

function toggleAutoPay() {
    activeDriver.autoPay = document.getElementById('autoPayCheckbox').checked;
    syncStorage();
    showToast(activeDriver.autoPay ? "Automatic toll payment enabled." : "Automatic toll payment disabled.");
}

function updateETicketFare() {
    const tollId = document.getElementById('eticketTollSelect').value;
    const tripType = document.getElementById('eticketTripType').value;
    const toll = tolls.find(t => t.id === tollId) || tolls[0];
    const fare = tripType === 'Return' ? toll.baseFee * 1.8 : toll.baseFee;
    document.getElementById('eticketFarePreview').textContent = `$${fare.toFixed(2)}`;
}

function handleBuyETicket(e) {
    e.preventDefault();
    const tollId = document.getElementById('eticketTollSelect').value;
    const plate = document.getElementById('eticketVehicleSelect').value;
    const tripType = document.getElementById('eticketTripType').value;
    const travelDate = document.getElementById('eticketDate').value;

    const toll = tolls.find(t => t.id === tollId);
    const fare = tripType === 'Return' ? toll.baseFee * 1.8 : toll.baseFee;

    if (activeDriver.walletBalance < fare) {
        showToast("Insufficient eWallet balance! Please add money first.");
        return;
    }

    activeDriver.walletBalance -= fare;
    const newTicket = {
        ticketId: "TKT-" + Math.floor(5510 + Math.random() * 4400),
        userId: activeDriver.id,
        tollName: toll.name,
        vehiclePlate: plate,
        tripType,
        travelDate,
        farePaid: fare,
        status: "Valid - Unused"
    };
    eTickets.unshift(newTicket);
    transactions.unshift({
        id: "TXN-" + Math.floor(100 + Math.random() * 899),
        date: new Date().toISOString().split('T')[0],
        title: `Advance Toll eTicket (${newTicket.ticketId})`,
        amount: `-$${fare.toFixed(2)}`,
        type: "debit"
    });
    syncStorage();
    renderDriverPortal();
    openQrPopup(newTicket.ticketId, `${toll.name} • ${plate}`);
    showToast(`Toll eTicket ${newTicket.ticketId} booked!`);
}

function handleApplyTollPass(e) {
    e.preventDefault();
    const plate = document.getElementById('passVehicleSelect').value;
    const tollId = document.getElementById('passTollSelect').value;
    const plan = document.getElementById('passPlanType').value;
    const toll = tolls.find(t => t.id === tollId);

    const newPass = {
        passId: "PASS-" + Math.floor(8000 + Math.random() * 1900),
        userId: activeDriver.id,
        holderName: activeDriver.name,
        vehiclePlate: plate,
        tollName: toll.name,
        plan,
        validUntil: "2027-06-30",
        status: "Pending Approval"
    };
    passes.unshift(newPass);
    syncStorage();
    renderDriverPortal();
    showToast(`Toll Pass ${newPass.passId} submitted for Admin approval!`);
}

function renewTollPass(idx) {
    const p = passes[idx];
    const fee = p.plan.includes('Annual') ? 420 : 45;
    if (activeDriver.walletBalance < fee) {
        showToast(`Need $${fee} in eWallet to renew this pass.`);
        return;
    }
    activeDriver.walletBalance -= fee;
    const curDate = new Date(p.validUntil);
    curDate.setMonth(curDate.getMonth() + (p.plan.includes('Annual') ? 12 : 1));
    p.validUntil = curDate.toISOString().split('T')[0];

    transactions.unshift({
        id: "TXN-" + Math.floor(100 + Math.random() * 899),
        date: new Date().toISOString().split('T')[0],
        title: `Toll Pass Renewal (${p.passId})`,
        amount: `-$${fee.toFixed(2)}`,
        type: "debit"
    });
    syncStorage();
    renderDriverPortal();
    showToast(`Renewed ${p.passId} through ${p.validUntil}!`);
}

function handleAddVehicle(e) {
    e.preventDefault();
    vehicles.push({
        plate: document.getElementById('vehPlateInput').value.trim().toUpperCase(),
        vehicleClass: document.getElementById('vehClassInput').value,
        model: document.getElementById('vehModelInput').value.trim(),
        recurringRoute: tolls[0].name
    });
    syncStorage();
    e.target.reset();
    renderDriverPortal();
    showToast("Vehicle added to your EasyToll profile!");
}

function showUserPassQR() {
    const p = passes.find(item => item.status === 'Approved') || passes[0];
    if (p) openQrPopup(p.passId, `Smart Toll Pass • ${p.vehiclePlate}`);
}

function openQrPopup(code, subtitle) {
    document.getElementById('qrModalTitle').textContent = `QR Code: ${code}`;
    document.getElementById('qrModalSub').textContent = subtitle;
    document.getElementById('qrModalGraphic').innerHTML = buildQrSvg(code);
    document.getElementById('qrModal').style.display = 'block';
}

// =========================================================
// TOLL GATE USER (OPERATOR) PORTAL LOGIC
// =========================================================
function renderGatePortal() {
    document.getElementById('gateBoothIdentity').innerHTML = `Active Booth: <strong>${activeOperator.plazaName} (${activeOperator.lane})</strong> | GPS: ${activeOperator.gps} | Operator: <strong>${activeOperator.name} (${activeOperator.id})</strong>`;
    document.getElementById('gatePlazaSelect').innerHTML = tolls.map(t => `<option value="${t.id}" ${t.id === activeOperator.plazaId ? 'selected' : ''}>${t.name} (${t.location})</option>`).join('');
    document.getElementById('gateLaneInput').value = activeOperator.lane;
    document.getElementById('gateGpsInput').value = activeOperator.gps;

    document.getElementById('gateLogsList').innerHTML = gateLogs.length
        ? gateLogs.map(l => `<div class="list-row-card"><div><strong>${l.code}</strong> &bull; ${l.detail}<div class="muted-xs">${l.booth} &bull; ${l.time}</div></div><span class="badge-ok">CLEARED</span></div>`).join('')
        : `<p class="muted-sm">No vehicles scanned in this shift yet.</p>`;
}

function simulateQrScan(sampleCode) {
    document.getElementById('gateCodeInput').value = sampleCode;
    verifyGateCode(null, sampleCode);
}

function verifyGateCode(e, overrideCode = null) {
    if (e) e.preventDefault();
    const rawCode = (overrideCode || document.getElementById('gateCodeInput').value).trim().toUpperCase();
    const resBox = document.getElementById('gateVerificationResult');
    resBox.style.display = 'block';

    // Check Toll Pass ID
    const foundPass = passes.find(p => p.passId.toUpperCase() === rawCode);
    if (foundPass) {
        if (foundPass.status === 'Approved') {
            resBox.className = 'verify-result-box res-valid';
            resBox.innerHTML = `✅ <strong>VALID TOLL PASS (${foundPass.passId})</strong><br>Vehicle: <strong>${foundPass.vehiclePlate}</strong> | Holder: ${foundPass.holderName} | Valid Until: ${foundPass.validUntil}<br><em>Boom Barrier Opened Automatically.</em>`;
            gateLogs.unshift({ code: foundPass.passId, detail: `Pass Verified (${foundPass.vehiclePlate})`, booth: activeOperator.plazaName, time: new Date().toLocaleTimeString() });
            syncStorage();
            renderGatePortal();
        } else {
            resBox.className = 'verify-result-box res-invalid';
            resBox.innerHTML = `⚠️ <strong>PASS PENDING APPROVAL (${foundPass.passId})</strong><br>This toll pass has not been approved by Admin yet.`;
        }
        return;
    }

    // Check Toll eTicket ID
    const foundTicket = eTickets.find(t => t.ticketId.toUpperCase() === rawCode);
    if (foundTicket) {
        resBox.className = 'verify-result-box res-valid';
        resBox.innerHTML = `✅ <strong>VALID PRE-PAID TOLL eTICKET (${foundTicket.ticketId})</strong><br>Vehicle: <strong>${foundTicket.vehiclePlate}</strong> | Plaza: ${foundTicket.tollName} | Trip: ${foundTicket.tripType}<br><em>Zero Queue — Boom Barrier Opened!</em>`;
        foundTicket.status = "Verified at Gate";
        gateLogs.unshift({ code: foundTicket.ticketId, detail: `eTicket Cleared (${foundTicket.vehiclePlate})`, booth: activeOperator.plazaName, time: new Date().toLocaleTimeString() });
        syncStorage();
        renderGatePortal();
        return;
    }

    resBox.className = 'verify-result-box res-invalid';
    resBox.innerHTML = `❌ <strong>INVALID CODE (${rawCode})</strong><br>No matching Toll Pass ID or Toll eTicket found.`;
}

function updateGateLocation(e) {
    e.preventDefault();
    const plazaId = document.getElementById('gatePlazaSelect').value;
    const plaza = tolls.find(t => t.id === plazaId);
    activeOperator.plazaId = plaza.id;
    activeOperator.plazaName = plaza.name;
    activeOperator.lane = document.getElementById('gateLaneInput').value.trim();
    activeOperator.gps = document.getElementById('gateGpsInput').value.trim();
    syncStorage();
    renderGatePortal();
    showToast(`Toll booth location updated to ${plaza.name} (${activeOperator.lane})`);
}

// =========================================================
// ADMIN PORTAL LOGIC
// =========================================================
function openAdminTab(tabName, btn) {
    document.querySelectorAll('.admin-tab-panel').forEach(p => p.style.display = 'none');
    document.querySelectorAll('#portal-admin .sub-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.getElementById(`atab-${tabName}`).style.display = 'block';
}

function renderAdminPortal() {
    // 1. Approve Toll Passes
    document.getElementById('adminPassApprovalList').innerHTML = passes.map((p, idx) => `
        <div class="list-row-card">
            <div>
                <strong>${p.passId}</strong> &bull; ${p.holderName} (${p.vehiclePlate})<br>
                <span class="muted-xs">${p.tollName} | ${p.plan}</span>
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
                <span class="${p.status === 'Approved' ? 'badge-ok' : 'badge-wait'}">${p.status}</span>
                ${p.status !== 'Approved' ? `<button class="btn-primary btn-xs" style="padding:5px 10px; font-size:0.78rem;" onclick="adminApprovePass(${idx})">Approve Pass</button>` : ''}
                <button class="btn-amber btn-xs" style="padding:5px 10px; font-size:0.78rem;" onclick="adminGenerateQrPreview('${p.passId}')">Generate QR</button>
            </div>
        </div>
    `).join('');

    adminGenerateQrPreview('PASS-7741');

    // 2. Tolls Table
    document.getElementById('adminTollsTableBody').innerHTML = tolls.map((t, idx) => `
        <tr>
            <td><strong>${t.id}</strong></td>
            <td>${t.name}</td>
            <td>${t.highway}</td>
            <td>${t.location}</td>
            <td>$${Number(t.baseFee).toFixed(2)}</td>
            <td><button class="btn-outline-dark btn-xs" style="padding:4px 8px; font-size:0.76rem;" onclick="adminDeleteToll(${idx})">Delete</button></td>
        </tr>
    `).join('');

    // 3. Toll Gate Logins Table
    document.getElementById('newGateOpPlaza').innerHTML = tolls.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    document.getElementById('adminGateLoginsTable').innerHTML = gateOperators.map((g, idx) => `
        <tr>
            <td><strong>${g.id}</strong></td>
            <td>${g.name}</td>
            <td>${g.plazaName} (${g.lane})</td>
            <td><code>${g.password}</code></td>
            <td><button class="btn-outline-dark btn-xs" style="padding:4px 8px; font-size:0.76rem;" onclick="adminDeleteGateOp(${idx})">Remove</button></td>
        </tr>
    `).join('');

    // 4. Users Table
    document.getElementById('adminUsersTableBody').innerHTML = users.map((u, idx) => `
        <tr>
            <td><strong>${u.id}</strong></td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>$${Number(u.walletBalance).toFixed(2)}</td>
            <td><button class="btn-amber btn-xs" style="padding:4px 9px; font-size:0.76rem;" onclick="adminBonusCredit(${idx})">+$25 Credit</button></td>
        </tr>
    `).join('');
}

function adminApprovePass(idx) {
    passes[idx].status = "Approved";
    syncStorage();
    renderAdminPortal();
    showToast(`Approved Toll Pass ${passes[idx].passId}!`);
}

function adminGenerateQrPreview(seed = null) {
    const code = (seed || document.getElementById('adminQrSeedInput').value || 'PASS-7741').trim().toUpperCase();
    document.getElementById('adminQrSeedInput').value = code;
    document.getElementById('adminQrOutputBox').innerHTML = `
        <div class="qr-frame">${buildQrSvg(code)}</div>
        <p style="margin-top:10px; font-weight:700;">Generated QR Token: ${code}</p>
    `;
}

function adminCreateToll(e) {
    e.preventDefault();
    tolls.push({
        id: "TOLL-0" + (tolls.length + 1),
        name: document.getElementById('newTollName').value.trim(),
        highway: document.getElementById('newTollHighway').value.trim(),
        location: document.getElementById('newTollLocation').value.trim(),
        baseFee: parseFloat(document.getElementById('newTollFee').value)
    });
    syncStorage();
    e.target.reset();
    renderAdminPortal();
    showToast("New Toll Plaza created!");
}

function adminDeleteToll(idx) {
    tolls.splice(idx, 1);
    syncStorage();
    renderAdminPortal();
    showToast("Toll Plaza deleted.");
}

function adminCreateGateLogin(e) {
    e.preventDefault();
    const plazaId = document.getElementById('newGateOpPlaza').value;
    const plaza = tolls.find(t => t.id === plazaId);
    gateOperators.push({
        id: document.getElementById('newGateOpId').value.trim().toUpperCase(),
        name: document.getElementById('newGateOpName').value.trim(),
        plazaId: plaza.id,
        plazaName: plaza.name,
        lane: "FAST-LANE 01",
        gps: "13.0100° N, 80.0200° E",
        password: document.getElementById('newGateOpPass').value.trim()
    });
    syncStorage();
    e.target.reset();
    renderAdminPortal();
    showToast("Toll Gate Operator login created!");
}

function adminDeleteGateOp(idx) {
    gateOperators.splice(idx, 1);
    syncStorage();
    renderAdminPortal();
    showToast("Toll Gate Operator removed.");
}

function adminBonusCredit(idx) {
    users[idx].walletBalance += 25;
    syncStorage();
    renderAdminPortal();
    showToast(`Credited $25.00 to ${users[idx].name}`);
}

// =========================================================
// AUTH MODAL
// =========================================================
function openAuthDialog(tab = 'login', defaultRole = 'driver') {
    setAuthTab(tab);
    document.getElementById('authAccountType').value = defaultRole;
    document.getElementById('authModal').style.display = 'block';
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function setAuthTab(tab) {
    authMode = tab;
    document.getElementById('authTabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('authTabRegister').classList.toggle('active', tab === 'register');
    document.getElementById('authRegFields').style.display = tab === 'register' ? 'block' : 'none';
    document.getElementById('authSubmitLabel').textContent = tab === 'login' ? 'Sign In' : 'Create Driver Account';
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const role = document.getElementById('authAccountType').value;
    const loginId = document.getElementById('authLoginId').value.trim();

    if (authMode === 'register' && role === 'driver') {
        const name = document.getElementById('authRegName').value.trim() || loginId.split('@')[0];
        const plate = document.getElementById('authRegPlate').value.trim().toUpperCase() || 'TN-01-XY-1234';
        const newUser = { id: "USR-" + Math.floor(200 + Math.random() * 799), name, email: loginId, password: "user123", walletBalance: 50.00, autoPay: true };
        users.push(newUser);
        vehicles.unshift({ plate, vehicleClass: "Car / Jeep / Van", model: "Registered Vehicle", recurringRoute: tolls[0].name });
        activeDriver = newUser;
        syncStorage();
        closeModal('authModal');
        switchRolePortal('driver', document.querySelectorAll('.seg-btn')[0]);
        showToast(`Registered & signed in as ${name}!`);
        return;
    }

    if (role === 'gate') {
        const foundGate = gateOperators.find(g => g.id.toLowerCase() === loginId.toLowerCase());
        if (foundGate) activeOperator = foundGate;
        closeModal('authModal');
        switchRolePortal('gate', document.querySelectorAll('.seg-btn')[1]);
        showToast(`Signed in as Gate Operator ${activeOperator.name}`);
    } else if (role === 'admin') {
        closeModal('authModal');
        switchRolePortal('admin', document.querySelectorAll('.seg-btn')[2]);
        showToast("Signed in as System Administrator");
    } else {
        const foundUser = users.find(u => u.email.toLowerCase() === loginId.toLowerCase());
        if (foundUser) activeDriver = foundUser;
        closeModal('authModal');
        switchRolePortal('driver', document.querySelectorAll('.seg-btn')[0]);
        showToast(`Signed in as ${activeDriver.name}`);
    }
}

window.onclick = function(e) { if (e.target.classList.contains('modal-overlay')) e.target.style.display = 'none'; };
