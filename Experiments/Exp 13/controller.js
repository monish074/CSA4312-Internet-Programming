let accounts = JSON.parse(localStorage.getItem('ce_accounts')) || INITIAL_ACCOUNTS;
let complaints = JSON.parse(localStorage.getItem('ce_complaints')) || INITIAL_COMPLAINTS;
let kbItems = JSON.parse(localStorage.getItem('ce_kb')) || INITIAL_KB;
let bulletins = JSON.parse(localStorage.getItem('ce_bulletins')) || INITIAL_BULLETINS;
let adminContact = JSON.parse(localStorage.getItem('ce_adminContact')) || INITIAL_ADMIN_CONTACT;
let featureFlags = JSON.parse(localStorage.getItem('ce_features')) || DEFAULT_FEATURES;
let sessionUser = JSON.parse(localStorage.getItem('ce_session')) || null;
let authMode = 'login';

function persistAll() {
    localStorage.setItem('ce_accounts', JSON.stringify(accounts));
    localStorage.setItem('ce_complaints', JSON.stringify(complaints));
    localStorage.setItem('ce_kb', JSON.stringify(kbItems));
    localStorage.setItem('ce_bulletins', JSON.stringify(bulletins));
    localStorage.setItem('ce_adminContact', JSON.stringify(adminContact));
    localStorage.setItem('ce_features', JSON.stringify(featureFlags));
    localStorage.setItem('ce_session', JSON.stringify(sessionUser));
}

document.addEventListener('DOMContentLoaded', () => {
    applyFeatureVisibility();
    renderOverview();
    updateRoleUI();
});

function toast(msg) {
    const el = document.getElementById('toastBanner');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3300);
}

// Apply Admin Feature Visibility Rules across Users & Officers
function applyFeatureVisibility() {
    const isAdmin = sessionUser && sessionUser.role === 'admin';

    // Nav buttons with data-feature
    document.querySelectorAll('[data-feature]').forEach(el => {
        const key = el.getAttribute('data-feature');
        if (featureFlags[key]) {
            el.style.display = (isAdmin || featureFlags[key].enabled) ? 'block' : 'none';
        }
    });

    // Map widget inside Post Complaint view
    const mapBox = document.getElementById('sec-mapMarker');
    if (mapBox) {
        mapBox.style.display = (isAdmin || featureFlags.mapMarker.enabled) ? 'block' : 'none';
    }
}

function switchWorkspace(viewName, btn) {
    document.querySelectorAll('.workspace-panel').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.rail-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const target = document.getElementById(`view-${viewName}`);
    if (target) target.style.display = 'block';

    if (viewName === 'overview') renderOverview();
    if (viewName === 'tracker') renderUserComplaints();
    if (viewName === 'officer') renderOfficerDesk();
    if (viewName === 'admin') renderAdminConsole();
    if (viewName === 'contact') renderAdminContactPage();
}

// OVERVIEW & KNOWLEDGE BASE
function renderOverview() {
    document.getElementById('kpiTotal').textContent = complaints.length;
    document.getElementById('kpiProgress').textContent = complaints.filter(c => c.status === 'In Progress' || c.status === 'Submitted').length;
    document.getElementById('kpiResolved').textContent = complaints.filter(c => c.status === 'Resolved').length;
    document.getElementById('kpiOfficers').textContent = accounts.filter(a => a.role === 'officer').length;

    const bContainer = document.getElementById('oesBulletinContainer');
    bContainer.innerHTML = bulletins.map(b => `
        <div class="bulletin-item">
            <strong>📢 ${b.title}:</strong> ${b.detail}
        </div>
    `).join('');

    renderKnowledgeBase();
}

function renderKnowledgeBase() {
    const q = (document.getElementById('faqSearchInput').value || '').toLowerCase().trim();
    const filtered = kbItems.filter(item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q));
    const grid = document.getElementById('knowledgeBaseGrid');
    if (!filtered.length) {
        grid.innerHTML = `<p class="muted-sm">No matching solutions found. Submit a new complaint for direct officer assistance.</p>`;
        return;
    }
    grid.innerHTML = filtered.map(item => `
        <div class="kb-card">
            <h4>${item.q}</h4>
            <p>${item.a}</p>
        </div>
    `).join('');
}

// INTERACTIVE GOOGLE MAP PIN DROPPER
function dropMapPin(e) {
    const box = document.getElementById('interactiveMapBox');
    const rect = box.getBoundingClientRect();
    const xPct = Math.max(5, Math.min(95, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(8, Math.min(92, ((e.clientY - rect.top) / rect.height) * 100));

    const pin = document.getElementById('mapPinMarker');
    pin.style.left = xPct.toFixed(1) + '%';
    pin.style.top = yPct.toFixed(1) + '%';

    // Compute realistic coordinates around Mevalurkuppam / Chennai corridor
    const lat = (13.0400 - (yPct / 100) * 0.0300).toFixed(4);
    const lng = (79.9950 + (xPct / 100) * 0.0350).toFixed(4);
    const coordStr = `${lat}° N, ${lng}° E`;

    document.getElementById('compCoords').value = coordStr;
    document.getElementById('mapLocationLabel').innerHTML = `Pinned Coordinates: <strong>${coordStr}</strong>`;
    document.getElementById('openExternalGmaps').href = `https://maps.google.com/?q=${lat},${lng}`;
}

// USER: POST COMPLAINT
function handleComplaintSubmit(e) {
    e.preventDefault();
    const newTicket = {
        id: "CMP-2026-" + Math.floor(810 + Math.random() * 189),
        userId: sessionUser ? sessionUser.id : "GUEST",
        userName: sessionUser ? sessionUser.name : "Citizen Guest",
        category: document.getElementById('compCategory').value,
        title: document.getElementById('compTitle').value.trim(),
        description: document.getElementById('compDesc').value.trim(),
        docRef: document.getElementById('compDocName').value.trim() || "No attachment",
        coords: document.getElementById('compCoords').value,
        notifyChannel: document.getElementById('compNotify').value,
        status: "Submitted",
        assignedOfficer: "OFF-101 (Inspector Vikram Rao)",
        proofOfWork: "",
        userFeedback: "",
        additionalNotes: [],
        createdAt: new Date().toISOString().split('T')[0]
    };

    complaints.unshift(newTicket);
    persistAll();
    e.target.reset();
    document.getElementById('compCoords').value = "13.0285° N, 80.0112° E (Mevalurkuppam Hub)";
    toast(`Complaint ${newTicket.id} registered! Confirmation sent via ${newTicket.notifyChannel}.`);
    switchWorkspace('tracker', document.getElementById('navTrackComplaints'));
}

// USER: VIEW COMPLAINT STATUS, ADD EVIDENCE & FEEDBACK
function renderUserComplaints() {
    const filter = document.getElementById('statusFilterSelect').value;
    const list = filter === 'All' ? complaints : complaints.filter(c => c.status === filter);
    const container = document.getElementById('userComplaintsList');

    if (!list.length) {
        container.innerHTML = `<p class="muted-sm">No complaints match this filter.</p>`;
        return;
    }

    container.innerHTML = list.map((c, idx) => {
        const stClass = c.status === 'Resolved' ? 'st-Resolved' : (c.status === 'In Progress' ? 'st-InProgress' : 'st-Submitted');
        return `
        <div class="ticket-card">
            <div class="ticket-top">
                <div>
                    <strong>${c.id}</strong> &bull; <span class="muted-xs">${c.category} &bull; Filed: ${c.createdAt}</span>
                    <h4 style="margin-top:4px;">${c.title}</h4>
                </div>
                <span class="status-tag ${stClass}">${c.status}</span>
            </div>
            <p style="font-size:0.88rem; margin-bottom:8px;">${c.description}</p>
            <div class="muted-xs">
                📍 Location: <strong>${c.coords}</strong> | 📎 Attachment: ${c.docRef} | 👮 Assigned: ${c.assignedOfficer}
            </div>

            ${c.proofOfWork ? `
                <div class="proof-box">
                    <strong>✅ Officer Proof of Work:</strong> ${c.proofOfWork}
                </div>
            ` : ''}

            ${c.additionalNotes && c.additionalNotes.length ? `
                <div class="muted-xs" style="margin-top:8px;">
                    <strong>Additional Info Provided:</strong> ${c.additionalNotes.join(' | ')}
                </div>
            ` : ''}

            <!-- Add Additional Information / Evidence -->
            <div style="display:flex; gap:8px; margin-top:10px;">
                <input type="text" id="extra-info-${idx}" placeholder="Provide additional info or evidence link..." style="flex:1; padding:6px 10px; border:1px solid var(--border); border-radius:6px; font-size:0.83rem;">
                <button class="btn-secondary" onclick="addUserEvidence('${c.id}', ${idx})">+ Add Info</button>
            </div>

            <!-- Feedback Section -->
            <div class="feedback-strip">
                ${c.userFeedback
                    ? `<strong>⭐ Citizen Feedback:</strong> "${c.userFeedback}"`
                    : `<div style="display:flex; gap:8px; align-items:center;">
                        <input type="text" id="fb-input-${idx}" placeholder="Share feedback on resolution quality..." style="flex:1; padding:6px 10px; border:1px solid var(--border); border-radius:6px; font-size:0.83rem;">
                        <button class="btn-primary" style="padding:6px 12px; font-size:0.82rem;" onclick="submitUserFeedback('${c.id}', ${idx})">Send Feedback</button>
                       </div>`
                }
            </div>
        </div>
        `;
    }).join('');
}

function addUserEvidence(compId, idx) {
    const val = document.getElementById(`extra-info-${idx}`).value.trim();
    if (!val) return;
    const target = complaints.find(c => c.id === compId);
    target.additionalNotes = target.additionalNotes || [];
    target.additionalNotes.push(val);
    persistAll();
    renderUserComplaints();
    toast(`Additional evidence appended to ${compId}`);
}

function submitUserFeedback(compId, idx) {
    const val = document.getElementById(`fb-input-${idx}`).value.trim();
    if (!val) return;
    const target = complaints.find(c => c.id === compId);
    target.userFeedback = val;
    persistAll();
    renderUserComplaints();
    toast(`Thank you! Feedback recorded for ${compId}`);
}

// OFFICER DESK: VIEW COMPLAINT, UPDATE STATUS, UPDATE PROOF OF WORK
function renderOfficerDesk() {
    document.getElementById('officerBadgeInfo').textContent = sessionUser ? `${sessionUser.name} (${sessionUser.loginId})` : 'Officer Desk';
    const container = document.getElementById('officerComplaintsList');

    container.innerHTML = complaints.map((c, idx) => `
        <div class="ticket-card">
            <div class="ticket-top">
                <div>
                    <strong>${c.id}</strong> &bull; Citizen: <strong>${c.userName}</strong> (${c.category})
                    <h4 style="margin-top:4px;">${c.title}</h4>
                </div>
                <span class="status-tag ${c.status === 'Resolved' ? 'st-Resolved' : (c.status === 'In Progress' ? 'st-InProgress' : 'st-Submitted')}">${c.status}</span>
            </div>
            <p style="font-size:0.88rem; margin-bottom:6px;">${c.description}</p>
            <p class="muted-xs" style="margin-bottom:12px;">📍 Geo-Pin: ${c.coords} | 📎 Supporting Doc: ${c.docRef}</p>

            <div class="form-row-2" style="background:#fff; padding:12px; border-radius:8px; border:1px solid var(--border);">
                <div>
                    <label style="font-size:0.8rem; font-weight:700;">Update Complaint Status</label>
                    <select id="off-status-${idx}" style="width:100%; padding:7px; border-radius:6px; border:1px solid var(--border); margin-top:4px;">
                        ${["Submitted", "In Progress", "Resolved"].map(s => `<option value="${s}" ${c.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label style="font-size:0.8rem; font-weight:700;">Update Proof of Work / Resolution Log</label>
                    <input type="text" id="off-proof-${idx}" value="${c.proofOfWork || ''}" placeholder="Enter work order #, inspection notes, or photo ref..." style="width:100%; padding:7px; border-radius:6px; border:1px solid var(--border); margin-top:4px;">
                </div>
            </div>
            <div style="margin-top:10px; text-align:right;">
                <button class="btn-primary" style="padding:7px 14px; font-size:0.84rem;" onclick="officerSaveUpdate('${c.id}', ${idx})">Save Status & Proof of Work</button>
            </div>
        </div>
    `).join('');
}

function officerSaveUpdate(compId, idx) {
    const newStatus = document.getElementById(`off-status-${idx}`).value;
    const newProof = document.getElementById(`off-proof-${idx}`).value.trim();
    const target = complaints.find(c => c.id === compId);
    target.status = newStatus;
    target.proofOfWork = newProof;
    if (sessionUser) target.assignedOfficer = `${sessionUser.loginId} (${sessionUser.name})`;
    persistAll();
    renderOfficerDesk();
    toast(`Updated ${compId} -> Status: ${newStatus} (Citizen notified)`);
}

// ADMIN CONSOLE
function switchAdminSubtab(tabName, btn) {
    document.querySelectorAll('.admin-subnav .subtab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    ['officers', 'accounts', 'features', 'oesinfo'].forEach(t => {
        document.getElementById(`admin-tab-${t}`).style.display = t === tabName ? 'block' : 'none';
    });
}

function renderAdminConsole() {
    // 1. Officer Credentials Table
    const officers = accounts.filter(a => a.role === 'officer');
    document.getElementById('adminOfficersTableBody').innerHTML = officers.map(o => `
        <tr>
            <td><strong>${o.loginId}</strong></td>
            <td>${o.name}</td>
            <td>${o.extra || 'General Ward'}</td>
            <td><code>${o.password}</code></td>
            <td><button class="btn-danger" onclick="adminDeleteAccount('${o.id}')">Remove</button></td>
        </tr>
    `).join('');

    // 2. All Accounts Table (View, Change Password, Delete)
    document.getElementById('adminAllAccountsTable').innerHTML = accounts.map((a, idx) => `
        <tr>
            <td><strong>${a.id}</strong></td>
            <td>${a.name}</td>
            <td><span class="badge-indigo">${a.role.toUpperCase()}</span></td>
            <td>${a.loginId}</td>
            <td>
                <div style="display:flex; gap:6px;">
                    <input type="text" id="new-pw-${idx}" value="${a.password}">
                    <button class="btn-secondary" onclick="adminChangePassword('${a.id}', ${idx})">Save</button>
                </div>
            </td>
            <td>
                ${a.role !== 'admin' ? `<button class="btn-danger" onclick="adminDeleteAccount('${a.id}')">Delete</button>` : '<span class="muted-xs">Protected</span>'}
            </td>
        </tr>
    `).join('');

    // 3. Feature Visibility Toggles
    const toggleContainer = document.getElementById('featureTogglesList');
    toggleContainer.innerHTML = Object.keys(featureFlags).map(key => {
        const f = featureFlags[key];
        return `
        <div class="toggle-item">
            <div>
                <strong style="font-size:0.9rem;">${f.label}</strong><br>
                <span class="muted-xs">${f.enabled ? 'Visible to Users' : 'Hidden by Admin'}</span>
            </div>
            <button class="${f.enabled ? 'btn-primary' : 'btn-danger'}" style="padding:6px 12px; font-size:0.8rem;" onclick="adminToggleFeature('${key}')">
                ${f.enabled ? 'Hide Feature' : 'Show Feature'}
            </button>
        </div>
        `;
    }).join('');

    // 4. Prefill Admin Contact Form
    document.getElementById('admContactName').value = adminContact.name;
    document.getElementById('admContactEmail').value = adminContact.email;
    document.getElementById('admContactPhone').value = adminContact.phone;
    document.getElementById('admContactOffice').value = adminContact.office;
}

function adminGenerateOfficer(e) {
    e.preventDefault();
    const name = document.getElementById('genOffName').value.trim();
    const dept = document.getElementById('genOffDept').value.trim();
    const customId = document.getElementById('genOffCustomId').value.trim() || ("OFF-" + Math.floor(103 + Math.random() * 890));
    const password = document.getElementById('genOffPassword').value.trim();

    accounts.push({ id: customId, name, loginId: customId, password, role: "officer", extra: dept });
    persistAll();
    e.target.reset();
    renderAdminConsole();

    const alertBox = document.getElementById('generatedCredsAlert');
    alertBox.style.display = 'block';
    alertBox.innerHTML = `✅ Generated Officer Credentials — <strong>Officer ID:</strong> ${customId} | <strong>Password:</strong> ${password} (${name})`;
    toast(`Generated credentials for Officer ${customId}`);
}

function adminCreateAccount(e) {
    e.preventDefault();
    const name = document.getElementById('accNewName').value.trim();
    const loginId = document.getElementById('accNewLogin').value.trim();
    const password = document.getElementById('accNewPass').value.trim();
    const role = document.getElementById('accNewRole').value;
    const idPrefix = role === 'officer' ? 'OFF-' : 'USR-';

    accounts.push({
        id: idPrefix + Math.floor(200 + Math.random() * 799),
        name, loginId, password, role,
        extra: role === 'officer' ? 'Field Operations' : 'Registered Citizen'
    });
    persistAll();
    e.target.reset();
    renderAdminConsole();
    toast(`Created ${role} account for ${name}`);
}

function adminChangePassword(accId, idx) {
    const newPw = document.getElementById(`new-pw-${idx}`).value.trim();
    if (!newPw) return;
    const acc = accounts.find(a => a.id === accId);
    acc.password = newPw;
    persistAll();
    toast(`Password updated for ${acc.name} (${acc.loginId})`);
}

function adminDeleteAccount(accId) {
    accounts = accounts.filter(a => a.id !== accId);
    persistAll();
    renderAdminConsole();
    toast(`Deleted account ${accId}`);
}

function adminToggleFeature(key) {
    featureFlags[key].enabled = !featureFlags[key].enabled;
    persistAll();
    applyFeatureVisibility();
    renderAdminConsole();
    toast(`${featureFlags[key].label} is now ${featureFlags[key].enabled ? 'VISIBLE' : 'HIDDEN'}`);
}

function adminAddOesBulletin(e) {
    e.preventDefault();
    const title = document.getElementById('oesInfoTitle').value.trim();
    const detail = document.getElementById('oesInfoDetail').value.trim();
    bulletins.unshift({ title, detail });
    persistAll();
    e.target.reset();
    toast("Inserted new OES information notice!");
}

function adminUpdateContactDetails(e) {
    e.preventDefault();
    adminContact = {
        name: document.getElementById('admContactName').value.trim(),
        email: document.getElementById('admContactEmail').value.trim(),
        phone: document.getElementById('admContactPhone').value.trim(),
        office: document.getElementById('admContactOffice').value.trim()
    };
    persistAll();
    toast("Admin contact details updated!");
}

function renderAdminContactPage() {
    document.getElementById('adminContactDisplayCard').innerHTML = `
        <p><strong>Authority:</strong> ${adminContact.name}</p>
        <p><strong>Official Email:</strong> <a href="mailto:${adminContact.email}">${adminContact.email}</a></p>
        <p><strong>24/7 Helpline Phone:</strong> ${adminContact.phone}</p>
        <p><strong>Headquarters Address:</strong> ${adminContact.office}</p>
    `;
}

// AUTHENTICATION (User Register/Login, Officer Register/Login, Admin Login)
function openAuthDrawer(mode = 'login') {
    setAuthMode(mode);
    document.getElementById('authModal').style.display = 'block';
}

function closeAuthDrawer() {
    document.getElementById('authModal').style.display = 'none';
}

function setAuthMode(mode) {
    authMode = mode;
    document.getElementById('btnModeLogin').classList.toggle('active', mode === 'login');
    document.getElementById('btnModeRegister').classList.toggle('active', mode === 'register');
    document.getElementById('registerFieldsGroup').style.display = mode === 'register' ? 'block' : 'none';
    document.getElementById('authActionBtn').textContent = mode === 'login' ? 'Sign In' : 'Complete Registration';
    updateAuthFormFields();
}

function updateAuthFormFields() {
    const role = document.getElementById('loginRoleSelect').value;
    document.getElementById('loginIdLabel').textContent = role === 'officer' ? 'Officer ID (e.g. OFF-101)' : 'Email Address';
    document.getElementById('regExtraLabel').textContent = role === 'officer' ? 'Assigned Department' : 'Mobile Phone (for SMS Updates)';
}

function processAuthForm(e) {
    e.preventDefault();
    const role = document.getElementById('loginRoleSelect').value;
    const loginId = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPasscode').value.trim();

    if (authMode === 'register') {
        if (role === 'admin') {
            toast("Admin accounts are pre-provisioned. Use Admin Demo login.");
            return;
        }
        const name = document.getElementById('regFullName').value.trim() || loginId;
        const extra = document.getElementById('regExtraInput').value.trim() || 'Standard';
        const newId = (role === 'officer' ? 'OFF-' : 'USR-') + Math.floor(300 + Math.random() * 699);
        const finalLogin = role === 'officer' && !loginId.startsWith('OFF-') ? newId : loginId;

        const created = { id: newId, name, loginId: finalLogin, password, role, extra };
        accounts.push(created);
        sessionUser = created;
        persistAll();
        updateRoleUI();
        closeAuthDrawer();
        toast(`Registered & logged in as ${name} (${finalLogin})`);
        if (role === 'officer') switchWorkspace('officer', document.getElementById('navOfficerDesk'));
        return;
    }

    // Login mode
    const found = accounts.find(a => a.role === role && a.loginId.toLowerCase() === loginId.toLowerCase() && a.password === password);
    if (!found) {
        toast("Invalid credentials for selected role. Try 1-Click Demo buttons.");
        return;
    }
    sessionUser = found;
    persistAll();
    updateRoleUI();
    closeAuthDrawer();
    toast(`Welcome back, ${found.name}!`);
    if (role === 'admin') switchWorkspace('admin', document.getElementById('navAdminConsole'));
    else if (role === 'officer') switchWorkspace('officer', document.getElementById('navOfficerDesk'));
}

function instantDemoRole(role) {
    const acc = accounts.find(a => a.role === role);
    if (!acc) return;
    sessionUser = acc;
    persistAll();
    updateRoleUI();
    closeAuthDrawer();
    toast(`Switched to ${acc.name} (${role.toUpperCase()})`);
    if (role === 'admin') switchWorkspace('admin', document.getElementById('navAdminConsole'));
    else if (role === 'officer') switchWorkspace('officer', document.getElementById('navOfficerDesk'));
    else switchWorkspace('lodge', document.getElementById('navPostComplaint'));
}

function logoutSession() {
    sessionUser = null;
    persistAll();
    updateRoleUI();
    switchWorkspace('overview');
    toast("Signed out safely.");
}

function updateRoleUI() {
    const rolePill = document.getElementById('activeRoleIndicator');
    const offBtn = document.getElementById('navOfficerDesk');
    const admBtn = document.getElementById('navAdminConsole');
    const footer = document.getElementById('railAuthFooter');

    if (sessionUser) {
        rolePill.textContent = `${sessionUser.role.toUpperCase()}: ${sessionUser.name}`;
        offBtn.style.display = sessionUser.role === 'officer' ? 'block' : 'none';
        admBtn.style.display = sessionUser.role === 'admin' ? 'block' : 'none';
        footer.innerHTML = `<button class="btn-secondary full-width" onclick="logoutSession()">Sign Out (${sessionUser.loginId})</button>`;
    } else {
        rolePill.textContent = "Guest Visitor";
        offBtn.style.display = 'none';
        admBtn.style.display = 'none';
        footer.innerHTML = `<button class="btn-primary full-width" onclick="openAuthDrawer('login')">Login / Register</button>`;
    }
    applyFeatureVisibility();
}
