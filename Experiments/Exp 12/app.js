let items = JSON.parse(localStorage.getItem('bg_items')) || DEFAULT_GIFT_ITEMS;
let cart = JSON.parse(localStorage.getItem('bg_cart')) || [];
let checkouts = JSON.parse(localStorage.getItem('bg_checkouts')) || SAMPLE_CHECKOUTS;
let currentUser = JSON.parse(localStorage.getItem('bg_user')) || null;
let discountRate = 0;

function saveData() {
    localStorage.setItem('bg_items', JSON.stringify(items));
    localStorage.setItem('bg_cart', JSON.stringify(cart));
    localStorage.setItem('bg_checkouts', JSON.stringify(checkouts));
    localStorage.setItem('bg_user', JSON.stringify(currentUser));
}

document.addEventListener('DOMContentLoaded', () => {
    renderHomeCategories();
    populateFilterMenus();
    applyFilters();
    updateAuthHeader();
    updateCartUI();
});

function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3300);
}

function navigateTo(view) {
    document.getElementById('homeView').style.display = view === 'home' ? 'block' : 'none';
    document.getElementById('ordersView').style.display = view === 'orders' ? 'block' : 'none';
    document.getElementById('adminView').style.display = view === 'admin' ? 'block' : 'none';

    if (view === 'orders') renderOrdersView();
    if (view === 'admin') {
        if (!currentUser || currentUser.role !== 'admin') {
            showToast("Administrator login required.");
            openAuthModal();
            return;
        }
        renderAdminItemsTable();
        renderAdminCheckouts();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Render all categories (most popular first) & all subcategories on Home Page
function renderHomeCategories() {
    const grid = document.getElementById('homeCategoriesGrid');
    const sorted = [...GIFT_CATEGORIES].sort((a, b) => a.rank - b.rank);
    grid.innerHTML = sorted.map(cat => `
        <div class="cat-card">
            <div class="cat-header">
                <h3 onclick="filterByCategory('${cat.name}')">${cat.name}</h3>
                <span class="rank-badge">#${cat.rank} ${cat.tag}</span>
            </div>
            <p class="muted-text" style="font-size:0.8rem;">Subcategories:</p>
            <div class="subcat-list">
                ${cat.subcategories.map(sub => `
                    <span class="subcat-chip" onclick="filterByCategoryAndSub('${cat.name}', '${sub}')">${sub}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function populateFilterMenus() {
    const navCat = document.getElementById('navCategorySelect');
    const subCat = document.getElementById('subCategoryFilter');
    const allSubs = new Set();

    GIFT_CATEGORIES.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.textContent = `${c.name} (#${c.rank})`;
        navCat.appendChild(opt);
        c.subcategories.forEach(s => allSubs.add(s));
    });

    allSubs.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        subCat.appendChild(opt);
    });
}

function filterByCategory(catName) {
    document.getElementById('navCategorySelect').value = catName;
    document.getElementById('subCategoryFilter').value = 'all';
    applyFilters();
    document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
}

function filterByCategoryAndSub(catName, subName) {
    document.getElementById('navCategorySelect').value = catName;
    document.getElementById('subCategoryFilter').value = subName;
    applyFilters();
    document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('navCategorySelect').value = 'all';
    document.getElementById('subCategoryFilter').value = 'all';
    document.getElementById('recipientFilter').value = 'all';
    document.getElementById('priceRangeFilter').value = 'all';
    document.getElementById('sortFilter').value = 'popular';
    applyFilters();
}

function handleSearch(e) {
    if (e.key === 'Enter' || e.target.value.length === 0 || e.target.value.length >= 2) {
        applyFilters();
    }
}

function applyFilters() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const cat = document.getElementById('navCategorySelect').value;
    const sub = document.getElementById('subCategoryFilter').value;
    const rec = document.getElementById('recipientFilter').value;
    const priceRange = document.getElementById('priceRangeFilter').value;
    const sort = document.getElementById('sortFilter').value;

    let filtered = items.filter(item => {
        const matchQuery = item.name.toLowerCase().includes(query) ||
                           item.description.toLowerCase().includes(query) ||
                           item.category.toLowerCase().includes(query) ||
                           item.subcategory.toLowerCase().includes(query);
        const matchCat = cat === 'all' || item.category === cat;
        const matchSub = sub === 'all' || item.subcategory === sub;
        const matchRec = rec === 'all' || item.recipient === rec;

        let matchPrice = true;
        if (priceRange === 'under50') matchPrice = item.price < 50;
        else if (priceRange === '50to100') matchPrice = item.price >= 50 && item.price <= 100;
        else if (priceRange === 'over100') matchPrice = item.price > 100;

        return matchQuery && matchCat && matchSub && matchRec && matchPrice;
    });

    if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
    else filtered.sort((a, b) => (b.popularity || 50) - (a.popularity || 50));

    document.getElementById('catalogHeading').textContent = cat === 'all' ? 'All Flowers & Gifts' : cat;
    document.getElementById('catalogSubheading').textContent = `Showing ${filtered.length} handcrafted item(s)`;
    renderProducts(filtered);
}

function renderProducts(list) {
    const grid = document.getElementById('productsGrid');
    if (!list.length) {
        grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:30px; color:var(--muted);">No gifts match your current filters.</p>`;
        return;
    }
    grid.innerHTML = list.map(p => `
        <div class="product-card">
            <div class="prod-img" onclick="openProductDetail('${p.id}')">
                <img src="${p.image}" alt="${p.name}">
            </div>
            <div class="prod-body">
                <div class="prod-meta">${p.category} &bull; ${p.subcategory}</div>
                <div class="prod-title" onclick="openProductDetail('${p.id}')">${p.name}</div>
                <div class="prod-desc">${p.description}</div>
                <div class="prod-footer">
                    <span class="prod-price">$${Number(p.price).toFixed(2)}</span>
                    <div style="display:flex; gap:6px;">
                        <button class="btn-secondary btn-xs" onclick="openProductDetail('${p.id}')">Customize</button>
                        <button class="btn-primary btn-xs" onclick="addToCart('${p.id}')">+ Add</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Product Detail & Custom Gift Message Modal
function openProductDetail(itemId) {
    const p = items.find(i => i.id === itemId);
    if (!p) return;

    document.getElementById('productModalBody').innerHTML = `
        <div class="detail-layout">
            <div>
                <img src="${p.image}" alt="${p.name}">
            </div>
            <div>
                <span class="rank-badge">${p.category} / ${p.subcategory}</span>
                <h2 style="margin:8px 0; color:var(--primary);">${p.name}</h2>
                <p class="muted-text" style="margin-bottom:8px;">Ideal For: <strong>${p.recipient}</strong> &bull; Item ID: ${p.id}</p>
                <h3 style="font-size:1.6rem; color:var(--accent); margin-bottom:12px;">$${Number(p.price).toFixed(2)}</h3>
                <p style="margin-bottom:16px;">${p.description}</p>

                <div class="stacked-form">
                    <label>Personalize Gift Card Message (Optional)</label>
                    <input type="text" id="customCardMsg" placeholder="e.g. Wishing you a wonderful birthday!">
                    <label>Add-On Upgrade</label>
                    <select id="customAddon">
                        <option value="Standard Wrapping (Included)">Standard Satin Ribbon Wrapping (Free)</option>
                        <option value="Deluxe Glass Vase & Chocolates (+$15)">Deluxe Glass Vase & Truffles (+$15.00)</option>
                    </select>
                    <button class="btn-primary full-width" onclick="addCustomItemToCart('${p.id}')">Add Customized Gift to Bag</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('productModal').style.display = 'block';
}

function addCustomItemToCart(itemId) {
    const msg = document.getElementById('customCardMsg').value.trim();
    const addon = document.getElementById('customAddon').value;
    const extraCost = addon.includes('+$15') ? 15 : 0;
    addToCart(itemId, msg, extraCost);
    closeModal('productModal');
}

// Shopping Cart Functions
function toggleCart() {
    document.getElementById('cartDrawer').classList.toggle('open');
}

function addToCart(itemId, customNote = '', extraCost = 0) {
    const prod = items.find(i => i.id === itemId);
    if (!prod) return;
    const finalPrice = Number(prod.price) + extraCost;
    const existing = cart.find(c => c.id === itemId && c.customNote === customNote && c.price === finalPrice);

    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({
            id: prod.id,
            name: prod.name,
            price: finalPrice,
            image: prod.image,
            qty: 1,
            customNote: customNote || 'Standard Gift Card'
        });
    }
    saveData();
    updateCartUI();
    showToast(`Added "${prod.name}" to your gift bag!`);
}

function changeCartQty(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveData();
    updateCartUI();
}

function applyPromo() {
    const code = document.getElementById('promoCodeInput').value.trim().toUpperCase();
    if (code === 'BLOOM20') {
        discountRate = 0.20;
        showToast("Loyalty code BLOOM20 applied (20% OFF)!");
    } else {
        discountRate = 0;
        showToast("Invalid code. Try BLOOM20");
    }
    updateCartUI();
}

function updateCartUI() {
    const count = cart.reduce((sum, i) => sum + i.qty, 0);
    document.getElementById('cartCount').textContent = count;

    const container = document.getElementById('cartItemsList');
    if (!cart.length) {
        container.innerHTML = `<p style="text-align:center; color:var(--muted); margin-top:40px;">Your gift bag is currently empty.</p>`;
    } else {
        container.innerHTML = cart.map((c, idx) => `
            <div class="cart-row">
                <img src="${c.image}" alt="${c.name}">
                <div style="flex:1;">
                    <strong style="font-size:0.9rem;">${c.name}</strong>
                    <div class="muted-text" style="font-size:0.78rem;">Note: "${c.customNote}"</div>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:6px;">
                        <span>$${(c.price * c.qty).toFixed(2)}</span>
                        <div>
                            <button class="btn-secondary btn-xs" onclick="changeCartQty(${idx}, -1)">-</button>
                            <span style="margin:0 6px; font-weight:700;">${c.qty}</span>
                            <button class="btn-secondary btn-xs" onclick="changeCartQty(${idx}, 1)">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const discount = subtotal * discountRate;
    const total = subtotal - discount;

    document.getElementById('cartSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('cartDiscount').textContent = `-$${discount.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
}

// Checkout & Delivery Scheduling
function openCheckoutModal() {
    if (!cart.length) {
        showToast("Please add flowers or gifts to your bag first.");
        return;
    }
    toggleCart();
    if (currentUser) {
        document.getElementById('chkCustomerName').value = currentUser.name || '';
        document.getElementById('chkCustomerEmail').value = currentUser.email || '';
        document.getElementById('chkCustomerPhone').value = currentUser.phone || '';
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('chkDeliveryDate').value = tomorrow.toISOString().split('T')[0];

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const total = subtotal - (subtotal * discountRate);

    document.getElementById('checkoutReviewBox').innerHTML = `
        <strong>Gift Summary (${cart.reduce((s, i) => s + i.qty, 0)} item(s)):</strong><br>
        ${cart.map(i => `${i.qty}x ${i.name} ($${(i.price * i.qty).toFixed(2)})`).join('<br>')}
        <hr style="margin:8px 0; border:none; border-top:1px solid var(--border);">
        <strong>Total Payable: $${total.toFixed(2)}</strong>
    `;
    document.getElementById('checkoutModal').style.display = 'block';
}

function completeCheckout(e) {
    e.preventDefault();
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const total = subtotal - (subtotal * discountRate);
    const alertChannel = document.getElementById('chkAlertChannel').value;

    const newOrder = {
        orderId: "BLM-" + Math.floor(10000 + Math.random() * 89999),
        customerName: document.getElementById('chkCustomerName').value.trim(),
        customerEmail: document.getElementById('chkCustomerEmail').value.trim(),
        customerPhone: document.getElementById('chkCustomerPhone').value.trim(),
        recipientName: document.getElementById('chkRecipientName').value.trim(),
        deliveryAddress: document.getElementById('chkDeliveryAddress').value.trim(),
        deliveryDate: document.getElementById('chkDeliveryDate').value,
        deliveryTime: document.getElementById('chkDeliveryTime').value,
        alertChannel,
        paymentMethod: document.getElementById('chkPaymentMethod').value,
        status: "Order Confirmed",
        items: cart.map(c => ({ ...c })),
        total
    };

    checkouts.unshift(newOrder);
    cart = [];
    discountRate = 0;
    saveData();
    updateCartUI();
    closeModal('checkoutModal');

    showToast(`Order ${newOrder.orderId} scheduled! Confirmation sent via ${alertChannel}.`);
    navigateTo('orders');
}

// Real-Time Order Tracking
function renderOrdersView() {
    const container = document.getElementById('ordersContainer');
    const stages = ["Order Confirmed", "Florist Crafting", "Out for Delivery", "Delivered"];

    container.innerHTML = checkouts.map(o => {
        const activeIdx = stages.indexOf(o.status);
        return `
        <div class="order-box">
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px;">
                <div>
                    <strong>Order #${o.orderId}</strong> &bull; Recipient: <strong>${o.recipientName}</strong><br>
                    <span class="muted-text">Scheduled Delivery: <strong>${o.deliveryDate}</strong> (${o.deliveryTime})</span><br>
                    <span class="muted-text">Address: ${o.deliveryAddress} | Confirmation: ${o.alertChannel}</span>
                </div>
                <div style="text-align:right;">
                    <span class="rank-badge">${o.status}</span><br>
                    <strong style="font-size:1.15rem;">$${Number(o.total).toFixed(2)}</strong>
                </div>
            </div>
            <div class="tracker-bar">
                ${stages.map((st, idx) => `<span class="${idx <= activeIdx ? 'step-done' : ''}">${idx <= activeIdx ? '✔' : '○'} ${st}</span>`).join('')}
            </div>
            <div style="font-size:0.88rem;">
                ${o.items.map(i => `<div>&bull; ${i.qty}x ${i.name} — <em>"${i.customNote}"</em></div>`).join('')}
            </div>
        </div>
        `;
    }).join('');
}

// Auth Modal (User & Admin)
let authMode = 'login';
function openAuthModal() { document.getElementById('authModal').style.display = 'block'; }
function switchAuthMode(mode) {
    authMode = mode;
    document.getElementById('loginTab').classList.toggle('active', mode === 'login');
    document.getElementById('registerTab').classList.toggle('active', mode === 'register');
    document.getElementById('regOnlyFields').style.display = mode === 'register' ? 'block' : 'none';
    document.getElementById('authSubmitBtn').textContent = mode === 'login' ? 'Sign In' : 'Create Account';
}

function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const role = document.getElementById('authRole').value;
    const name = authMode === 'register' ? document.getElementById('regFullName').value.trim() : (role === 'admin' ? 'Blossom Admin' : email.split('@')[0]);
    const phone = authMode === 'register' ? document.getElementById('regPhone').value.trim() : '+1 555-234-9876';

    currentUser = { name, email, phone, role };
    saveData();
    updateAuthHeader();
    closeModal('authModal');
    showToast(`Welcome, ${currentUser.name}!`);
    if (role === 'admin') navigateTo('admin');
}

function quickLogin(role) {
    if (role === 'admin') {
        currentUser = { name: "Store Administrator", email: "admin@blossomgifts.com", phone: "+1 555-000-1111", role: "admin" };
        saveData(); updateAuthHeader(); closeModal('authModal');
        showToast("Logged in as Administrator");
        navigateTo('admin');
    } else {
        currentUser = { name: "Ananya Krishnan", email: "ananya@example.com", phone: "+91 98401-55210", role: "customer" };
        saveData(); updateAuthHeader(); closeModal('authModal');
        showToast("Logged in as Ananya Krishnan");
    }
}

function logout() {
    currentUser = null;
    saveData();
    updateAuthHeader();
    navigateTo('home');
    showToast("Logged out successfully.");
}

function updateAuthHeader() {
    const authArea = document.getElementById('authArea');
    const adminBtn = document.getElementById('adminNavBtn');
    if (currentUser) {
        adminBtn.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
        authArea.innerHTML = `
            <span style="font-size:0.84rem; font-weight:600; margin-right:6px;">Hi, ${currentUser.name}</span>
            <button class="btn-secondary btn-xs" onclick="logout()">Logout</button>
        `;
    } else {
        adminBtn.style.display = 'none';
        authArea.innerHTML = `<button class="btn-primary btn-sm" onclick="openAuthModal()">Login / Register</button>`;
    }
}

// ADMIN FUNCTIONS: Add new particulars, Remove items, Modify price, View customer checkouts
function switchAdminTab(tab, btn) {
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('adminItemsTab').style.display = tab === 'items' ? 'block' : 'none';
    document.getElementById('adminCheckoutsTab').style.display = tab === 'checkouts' ? 'block' : 'none';
}

function adminAddItem(e) {
    e.preventDefault();
    const name = document.getElementById('addItemName').value.trim();
    const category = document.getElementById('addItemCategory').value;
    const subcategory = document.getElementById('addItemSubCategory').value;
    const recipient = document.getElementById('addItemRecipient').value;
    const price = parseFloat(document.getElementById('addItemPrice').value);
    const customImg = document.getElementById('addItemImage').value.trim();
    const description = document.getElementById('addItemDesc').value.trim();

    items.unshift({
        id: "BG-" + Math.floor(200 + Math.random() * 799),
        name, category, subcategory, recipient, price,
        popularity: 92,
        image: customImg || generateFloralSVG(name, "#831843"),
        description
    });

    saveData();
    e.target.reset();
    renderAdminItemsTable();
    applyFilters();
    showToast(`Added "${name}" to BlossomGifts catalog!`);
}

function renderAdminItemsTable() {
    const tbody = document.getElementById('adminItemsTableBody');
    tbody.innerHTML = items.map((item, idx) => `
        <tr>
            <td><strong>${item.id}</strong></td>
            <td>${item.name}</td>
            <td>${item.category}<br><small class="muted-text">${item.subcategory}</small></td>
            <td>${item.recipient}</td>
            <td><input type="number" step="0.01" id="admin-price-${idx}" value="${item.price}"></td>
            <td>
                <button class="btn-primary btn-xs" onclick="adminUpdatePrice(${idx})">Update Price</button>
                <button class="btn-secondary btn-xs" style="background:#fee2e2; color:#991b1b;" onclick="adminRemoveItem(${idx})">Remove</button>
            </td>
        </tr>
    `).join('');
}

function adminUpdatePrice(idx) {
    const newPrice = parseFloat(document.getElementById(`admin-price-${idx}`).value);
    if (isNaN(newPrice) || newPrice <= 0) {
        showToast("Please enter a valid price.");
        return;
    }
    items[idx].price = newPrice;
    saveData();
    applyFilters();
    showToast(`Updated price of "${items[idx].name}" to $${newPrice.toFixed(2)}`);
}

function adminRemoveItem(idx) {
    const removed = items.splice(idx, 1)[0];
    saveData();
    renderAdminItemsTable();
    applyFilters();
    showToast(`Removed "${removed.name}" from catalog.`);
}

function renderAdminCheckouts() {
    const container = document.getElementById('adminCheckoutsList');
    if (!checkouts.length) {
        container.innerHTML = `<p class="muted-text">No customer checkouts recorded yet.</p>`;
        return;
    }
    container.innerHTML = checkouts.map(c => `
        <div class="order-box">
            <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:8px;">
                <div>
                    <strong>Order #${c.orderId}</strong> &bull; Customer: <strong>${c.customerName}</strong> (${c.customerEmail} | ${c.customerPhone})<br>
                    <span class="muted-text">Recipient: ${c.recipientName} &bull; Address: ${c.deliveryAddress}</span><br>
                    <span class="muted-text">Scheduled: ${c.deliveryDate} (${c.deliveryTime}) &bull; Payment: ${c.paymentMethod}</span>
                </div>
                <div style="text-align:right;">
                    <span class="rank-badge">${c.status}</span><br>
                    <strong>Total: $${Number(c.total).toFixed(2)}</strong>
                </div>
            </div>
            <div style="font-size:0.86rem; background:var(--bg); padding:8px 12px; border-radius:6px;">
                <strong>Checked-Out Items:</strong>
                ${c.items.map(i => `<div>&bull; ${i.qty}x ${i.name} ($${(i.price * i.qty).toFixed(2)}) — Note: "${i.customNote}"</div>`).join('')}
            </div>
        </div>
    `).join('');
}

function closeModal(id) { document.getElementById(id).style.display = 'none'; }
window.onclick = function(e) { if (e.target.classList.contains('modal')) e.target.style.display = 'none'; };
