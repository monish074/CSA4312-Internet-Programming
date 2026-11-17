let products = JSON.parse(localStorage.getItem('sh_products')) || DEFAULT_PRODUCTS;
let cart = JSON.parse(localStorage.getItem('sh_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('sh_wishlist')) || [];
let orders = JSON.parse(localStorage.getItem('sh_orders')) || SAMPLE_ORDERS;
let currentUser = JSON.parse(localStorage.getItem('sh_user')) || null;
let activeDiscount = 0;

function saveState() {
    localStorage.setItem('sh_products', JSON.stringify(products));
    localStorage.setItem('sh_cart', JSON.stringify(cart));
    localStorage.setItem('sh_wishlist', JSON.stringify(wishlist));
    localStorage.setItem('sh_orders', JSON.stringify(orders));
    localStorage.setItem('sh_user', JSON.stringify(currentUser));
}

document.addEventListener('DOMContentLoaded', () => {
    renderCategoriesShowcase();
    populateFilterDropdowns();
    renderRecommendations();
    applyFilters();
    updateHeaderUI();
    updateCartUI();
});

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
}

function navigateTo(view) {
    document.getElementById('homeView').style.display = view === 'home' ? 'block' : 'none';
    document.getElementById('wishlistView').style.display = view === 'wishlist' ? 'block' : 'none';
    document.getElementById('ordersView').style.display = view === 'orders' ? 'block' : 'none';
    document.getElementById('adminView').style.display = view === 'admin' ? 'block' : 'none';

    if (view === 'wishlist') renderWishlist();
    if (view === 'orders') renderOrders();
    if (view === 'admin') {
        if (!currentUser || currentUser.role !== 'admin') {
            showToast("Admin privileges required.");
            navigateTo('home');
            return;
        }
        renderAdminProducts();
        renderAdminCustomerOrders();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCategoriesShowcase() {
    const grid = document.getElementById('categoriesGrid');
    const sortedCats = [...CATEGORIES_DATA].sort((a, b) => a.popularityRank - b.popularityRank);
    grid.innerHTML = sortedCats.map(cat => `
        <div class="category-card">
            <div class="cat-title-row">
                <h3 onclick="filterByCategory('${cat.name}')">${cat.name}</h3>
                <span class="pop-badge">#${cat.popularityRank} ${cat.badge}</span>
            </div>
            <p class="muted-text" style="font-size:0.82rem; margin-bottom:10px;">Available Subcategories:</p>
            <div class="subcat-pills">
                ${cat.subcategories.map(sub => `
                    <span class="subcat-pill" onclick="filterByCategoryAndSub('${cat.name}', '${sub}')">${sub}</span>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function populateFilterDropdowns() {
    const catSelect = document.getElementById('categoryFilter');
    const subSelect = document.getElementById('subCategoryFilter');
    const allSubs = new Set();
    CATEGORIES_DATA.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.textContent = `${c.name} (#${c.popularityRank})`;
        catSelect.appendChild(opt);
        c.subcategories.forEach(s => allSubs.add(s));
    });
    allSubs.forEach(sub => {
        const opt = document.createElement('option');
        opt.value = sub;
        opt.textContent = sub;
        subSelect.appendChild(opt);
    });
}

function filterByCategory(catName) {
    document.getElementById('categoryFilter').value = catName;
    document.getElementById('subCategoryFilter').value = 'all';
    applyFilters();
    document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
}

function filterByCategoryAndSub(catName, subName) {
    document.getElementById('categoryFilter').value = catName;
    document.getElementById('subCategoryFilter').value = subName;
    applyFilters();
    document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
}

function filterByTag(tag) {
    if (tag === 'flash') {
        const flashItems = products.filter(p => p.flashSale);
        renderProductCards(flashItems, 'productGrid');
        document.getElementById('catalogTitle').textContent = "⚡ Flash Sale Deals";
        document.getElementById('catalogSubtitle').textContent = `Showing ${flashItems.length} limited-time discounted items`;
        document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
    }
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = 'all';
    document.getElementById('subCategoryFilter').value = 'all';
    document.getElementById('availabilityFilter').value = 'all';
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
    const cat = document.getElementById('categoryFilter').value;
    const sub = document.getElementById('subCategoryFilter').value;
    const avail = document.getElementById('availabilityFilter').value;
    const sort = document.getElementById('sortFilter').value;

    let filtered = products.filter(p => {
        const matchesQuery = p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query) || p.category.toLowerCase().includes(query) || p.subcategory.toLowerCase().includes(query);
        const matchesCat = cat === 'all' || p.category === cat;
        const matchesSub = sub === 'all' || p.subcategory === sub;
        const matchesAvail = avail === 'all' || (avail === 'in-stock' && p.stock > 0);
        return matchesQuery && matchesCat && matchesSub && matchesAvail;
    });

    if (sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
    else filtered.sort((a, b) => (b.popularity || 50) - (a.popularity || 50));

    document.getElementById('catalogTitle').textContent = cat === 'all' ? 'All Products' : `${cat} Collection`;
    document.getElementById('catalogSubtitle').textContent = `Showing ${filtered.length} product(s)`;
    renderProductCards(filtered, 'productGrid');
}

function renderRecommendations() {
    const topPicks = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);
    renderProductCards(topPicks, 'recommendationsGrid');
}

function renderProductCards(list, containerId) {
    const grid = document.getElementById(containerId);
    if (!list.length) {
        grid.innerHTML = `<p style="grid-column:1/-1; text-align:center; padding:30px; color:var(--muted);">No products match your criteria. Try adjusting filters.</p>`;
        return;
    }

    grid.innerHTML = list.map(p => {
        const isWished = wishlist.includes(p.id);
        const inStock = p.stock > 0;
        return `
        <div class="product-card">
            <div class="product-img-wrap" onclick="openProductDetail('${p.id}')">
                <img src="${p.image}" alt="${p.name}">
                ${p.flashSale ? '<span class="badge-flash">FLASH DEAL</span>' : ''}
                <button class="wishlist-icon-btn" onclick="event.stopPropagation(); toggleWishlist('${p.id}')" title="Save to Wishlist">
                    ${isWished ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="product-info">
                <div class="product-meta">${p.category} &bull; ${p.subcategory}</div>
                <div class="product-title" onclick="openProductDetail('${p.id}')">${p.name}</div>
                <div class="product-rating">★ ${p.rating} (${p.reviews ? p.reviews.length : 0} reviews)</div>
                <div class="product-price-row">
                    <span class="price">$${Number(p.price).toFixed(2)}</span>
                    <span class="stock-tag ${inStock ? 'in-stock' : 'out-stock'}">
                        ${inStock ? `In Stock (${p.stock})` : 'Out of Stock'}
                    </span>
                </div>
                <div class="card-actions">
                    <button class="btn-secondary btn-sm" style="flex:1;" onclick="openProductDetail('${p.id}')">Details</button>
                    <button class="btn-primary btn-sm" style="flex:1.4;" ${!inStock ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''} onclick="addToCart('${p.id}')">
                        ${inStock ? '+ Add to Cart' : 'Sold Out'}
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

let selectedDetailSize = null;
function openProductDetail(productId) {
    const p = products.find(item => item.id === productId);
    if (!p) return;
    selectedDetailSize = p.sizes && p.sizes.length ? p.sizes[0] : 'M';

    const modalBody = document.getElementById('productModalBody');
    modalBody.innerHTML = `
        <div class="detail-grid">
            <div>
                <img src="${p.image}" alt="${p.name}" class="detail-img">
            </div>
            <div>
                <span class="pop-badge">${p.category} / ${p.subcategory}</span>
                <h2 style="margin:8px 0;">${p.name}</h2>
                <div class="product-rating">★ ${p.rating} / 5.0 &bull; Item Code: ${p.id}</div>
                <h3 style="font-size:1.6rem; color:var(--primary); margin:10px 0;">$${Number(p.price).toFixed(2)}</h3>
                <p style="margin-bottom:14px;">
                    <strong>Availability Status:</strong> 
                    <span class="stock-tag ${p.stock > 0 ? 'in-stock' : 'out-stock'}">
                        ${p.stock > 0 ? `Available (${p.stock} units ready to ship)` : 'Currently Out of Stock'}
                    </span>
                </p>
                <p style="color:var(--text); margin-bottom:16px;">${p.description}</p>
                <div>
                    <strong>Select Size:</strong> <a href="#" onclick="event.preventDefault(); showPolicyModal('size')" style="font-size:0.82rem; margin-left:8px;">📏 View Size Guide</a>
                    <div class="size-selector" id="modalSizeSelector">
                        ${(p.sizes || ['S', 'M', 'L', 'XL']).map((sz, idx) => `
                            <button type="button" class="size-btn ${idx === 0 ? 'active' : ''}" onclick="selectModalSize('${sz}', this)">${sz}</button>
                        `).join('')}
                    </div>
                </div>
                <div style="display:flex; gap:10px; margin-top:16px;">
                    <button class="btn-primary" style="flex:2;" ${p.stock <= 0 ? 'disabled' : ''} onclick="addToCart('${p.id}', selectedDetailSize); closeModal('productModal');">
                        ${p.stock > 0 ? 'Add Selected Size to Cart' : 'Out of Stock'}
                    </button>
                    <button class="btn-secondary" style="flex:1;" onclick="toggleWishlist('${p.id}')">
                        ${wishlist.includes(p.id) ? '❤️ Saved' : '🤍 Wishlist'}
                    </button>
                </div>
                <div class="reviews-box">
                    <h4>Customer Reviews (${p.reviews ? p.reviews.length : 0})</h4>
                    <div id="modalReviewsList" style="margin-top:8px;">
                        ${(p.reviews && p.reviews.length) ? p.reviews.map(r => `
                            <div class="review-item">
                                <strong>${r.user}</strong> <span style="color:#f59e0b;">${'★'.repeat(r.rating)}</span>
                                <p style="margin-top:3px;">${r.comment}</p>
                            </div>
                        `).join('') : '<p class="muted-text">No reviews yet. Be the first to review!</p>'}
                    </div>
                    <form onsubmit="addReview(event, '${p.id}')" style="margin-top:10px; display:flex; gap:8px;">
                        <input type="text" id="newReviewText" placeholder="Write a review..." required style="flex:1; padding:7px; border:1px solid var(--border); border-radius:6px;">
                        <button type="submit" class="btn-secondary btn-sm">Post</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.getElementById('productModal').style.display = 'block';
}

function selectModalSize(size, btn) {
    selectedDetailSize = size;
    document.querySelectorAll('#modalSizeSelector .size-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function addReview(e, productId) {
    e.preventDefault();
    const text = document.getElementById('newReviewText').value.trim();
    if (!text) return;
    const p = products.find(item => item.id === productId);
    p.reviews = p.reviews || [];
    p.reviews.push({ user: currentUser ? currentUser.name : "Verified Shopper", rating: 5, comment: text });
    saveState();
    openProductDetail(productId);
    showToast("Thank you! Your review has been posted.");
}

function toggleWishlist(productId) {
    const idx = wishlist.indexOf(productId);
    if (idx === -1) {
        wishlist.push(productId);
        showToast("Added to your Wishlist ❤️");
    } else {
        wishlist.splice(idx, 1);
        showToast("Removed from Wishlist");
    }
    saveState();
    updateHeaderUI();
    applyFilters();
    if (document.getElementById('wishlistView').style.display === 'block') renderWishlist();
}

function renderWishlist() {
    const wishedProducts = products.filter(p => wishlist.includes(p.id));
    renderProductCards(wishedProducts, 'wishlistGrid');
}

function toggleCart() {
    document.getElementById('cartDrawer').classList.toggle('open');
}

function addToCart(productId, size = 'M') {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) {
        showToast("Sorry, this item is currently out of stock.");
        return;
    }
    const existing = cart.find(item => item.id === productId && item.size === size);
    if (existing) {
        if (existing.qty + 1 > product.stock) {
            showToast(`Only ${product.stock} units available in stock.`);
            return;
        }
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, image: product.image, size: size, qty: 1 });
    }
    saveState();
    updateCartUI();
    showToast(`Added "${product.name}" (Size: ${size}) to cart`);
}

function updateCartItemQty(index, delta) {
    const item = cart[index];
    const product = products.find(p => p.id === item.id);
    const newQty = item.qty + delta;
    if (newQty <= 0) { removeCartItem(index); return; }
    if (product && newQty > product.stock) { showToast(`Maximum available stock is ${product.stock}.`); return; }
    item.qty = newQty;
    saveState();
    updateCartUI();
}

function updateCartItemSize(index, newSize) {
    cart[index].size = newSize;
    saveState();
    updateCartUI();
    showToast("Updated item size in cart");
}

function removeCartItem(index) {
    const removed = cart.splice(index, 1)[0];
    saveState();
    updateCartUI();
    showToast(`Removed "${removed.name}" from cart`);
}

function applyPromoCode() {
    const code = document.getElementById('promoInput').value.trim().toUpperCase();
    if (code === 'STYLE40') { activeDiscount = 0.40; showToast("Promo STYLE40 applied! 40% OFF"); }
    else if (code === 'WELCOME15') { activeDiscount = 0.15; showToast("Promo WELCOME15 applied! 15% OFF"); }
    else { activeDiscount = 0; showToast("Invalid promo code. Try STYLE40"); }
    updateCartUI();
}

function calculateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = subtotal * activeDiscount;
    const afterDiscount = subtotal - discount;
    const shipping = afterDiscount === 0 ? 0 : (afterDiscount >= 75 ? 0 : 8.99);
    const total = afterDiscount + shipping;
    return { subtotal, discount, shipping, total };
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById('cartCount').textContent = count;
    const container = document.getElementById('cartItemsContainer');
    if (cart.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--muted); margin-top:40px;">Your shopping cart is empty.</p>`;
    } else {
        container.innerHTML = cart.map((item, idx) => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <div style="font-weight:700; font-size:0.92rem;">${item.name}</div>
                    <div style="font-size:0.82rem; color:var(--muted); margin:3px 0;">
                        Size: 
                        <select onchange="updateCartItemSize(${idx}, this.value)" style="padding:2px; border-radius:4px;">
                            ${['XS','S','M','L','XL'].map(s => `<option value="${s}" ${item.size === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                        &bull; $${Number(item.price).toFixed(2)}
                    </div>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateCartItemQty(${idx}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="updateCartItemQty(${idx}, 1)">+</button>
                        <button onclick="removeCartItem(${idx})" style="margin-left:auto; background:none; border:none; color:var(--danger); cursor:pointer; font-size:0.8rem;">Remove</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
    const totals = calculateCartTotals();
    document.getElementById('cartSubtotal').textContent = `$${totals.subtotal.toFixed(2)}`;
    document.getElementById('cartDiscount').textContent = `-$${totals.discount.toFixed(2)}`;
    document.getElementById('cartShipping').textContent = totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`;
    document.getElementById('cartTotal').textContent = `$${totals.total.toFixed(2)}`;
}

function openCheckoutModal() {
    if (cart.length === 0) { showToast("Your cart is empty. Add items before checking out."); return; }
    toggleCart();
    if (currentUser) {
        document.getElementById('chkName').value = currentUser.name || '';
        document.getElementById('chkEmail').value = currentUser.email || '';
        document.getElementById('chkAddress').value = currentUser.address || '';
    }
    const totals = calculateCartTotals();
    document.getElementById('checkoutSummaryBox').innerHTML = `
        <strong>Order Summary (${cart.reduce((s, i) => s + i.qty, 0)} items):</strong><br>
        ${cart.map(i => `${i.qty}x ${i.name} (${i.size}) - $${(i.price * i.qty).toFixed(2)}`).join('<br>')}
        <hr style="margin:8px 0; border:none; border-top:1px solid var(--border);">
        <strong>Final Total Payable: $${totals.total.toFixed(2)}</strong>
    `;
    document.getElementById('checkoutModal').style.display = 'block';
}

function processCheckout(e) {
    e.preventDefault();
    const totals = calculateCartTotals();
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const newOrder = {
        orderId: "ORD-" + Math.floor(10000 + Math.random() * 90000),
        customerName: document.getElementById('chkName').value.trim(),
        customerEmail: document.getElementById('chkEmail').value.trim(),
        customerPhone: document.getElementById('chkPhone').value.trim(),
        shippingAddress: `${document.getElementById('chkAddress').value.trim()}, ${document.getElementById('chkCity').value.trim()}`,
        paymentMethod: paymentMethod,
        date: new Date().toISOString().split('T')[0],
        status: "Order Placed",
        items: cart.map(c => ({ ...c })),
        total: totals.total
    };
    cart.forEach(cItem => {
        const prod = products.find(p => p.id === cItem.id);
        if (prod) prod.stock = Math.max(0, prod.stock - cItem.qty);
    });
    orders.unshift(newOrder);
    cart = [];
    activeDiscount = 0;
    saveState();
    updateCartUI();
    applyFilters();
    closeModal('checkoutModal');
    showToast(`Order ${newOrder.orderId} confirmed! E-mail receipt sent to ${newOrder.customerEmail}`);
    navigateTo('orders');
}

function renderOrders() {
    const container = document.getElementById('ordersList');
    const userOrders = currentUser && currentUser.role === 'customer'
        ? orders.filter(o => o.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
        : orders;
    if (!userOrders.length) {
        container.innerHTML = `<p class="muted-text">No order history found. Start shopping to place your first order!</p>`;
        return;
    }
    const stages = ["Order Placed", "Processing", "Shipped", "Delivered"];
    container.innerHTML = userOrders.map(o => {
        const activeIdx = stages.indexOf(o.status);
        return `
        <div class="order-card">
            <div class="order-top">
                <div>
                    <strong>Order #${o.orderId}</strong> &bull; Placed on ${o.date}<br>
                    <span style="font-size:0.85rem; color:var(--muted);">Ship to: ${o.customerName} (${o.shippingAddress})</span>
                </div>
                <div style="text-align:right;">
                    <span class="pop-badge">${o.status}</span><br>
                    <strong style="font-size:1.1rem;">$${Number(o.total).toFixed(2)}</strong>
                </div>
            </div>
            <div class="status-tracker">
                ${stages.map((st, idx) => `<span class="status-step ${idx <= activeIdx ? 'active' : ''}">${idx <= activeIdx ? '✔' : '○'} ${st}</span>`).join('')}
            </div>
            <div style="font-size:0.9rem; margin-bottom:12px;">
                ${o.items.map(i => `<div>&bull; ${i.qty}x <strong>${i.name}</strong> (Size: ${i.size}) — $${(i.price * i.qty).toFixed(2)}</div>`).join('')}
            </div>
            <div style="display:flex; gap:10px;">
                <button class="btn-secondary btn-xs" onclick="showToast('Tracking carrier link copied for ${o.orderId}')">📍 Live Carrier Tracking</button>
                <button class="btn-secondary btn-xs" onclick="requestReturn('${o.orderId}')">🔄 Request Return / Exchange</button>
            </div>
        </div>
        `;
    }).join('');
}

function requestReturn(orderId) {
    showToast(`Easy Return/Exchange label generated for ${orderId} and emailed to you.`);
}

let authMode = 'login';
function openAuthModal() { document.getElementById('authModal').style.display = 'block'; }
function switchAuthMode(mode) {
    authMode = mode;
    document.getElementById('loginTabBtn').classList.toggle('active', mode === 'login');
    document.getElementById('registerTabBtn').classList.toggle('active', mode === 'register');
    document.getElementById('registerFields').style.display = mode === 'register' ? 'block' : 'none';
    document.getElementById('authSubmitBtn').textContent = mode === 'login' ? 'Sign In' : 'Create Account';
}

function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value.trim();
    const role = document.getElementById('authRole').value;
    const name = authMode === 'register' ? document.getElementById('authName').value.trim() : (role === 'admin' ? 'StyleHub Admin' : email.split('@')[0]);
    const address = authMode === 'register' ? document.getElementById('authAddress').value.trim() : '742 Evergreen Terrace, NY';
    currentUser = { name, email, role, address };
    saveState();
    updateHeaderUI();
    closeModal('authModal');
    showToast(`Welcome back, ${currentUser.name}!`);
    if (role === 'admin') navigateTo('admin');
}

function quickLogin(role) {
    if (role === 'admin') {
        currentUser = { name: "Store Administrator", email: "admin@stylehub.com", role: "admin", address: "StyleHub HQ" };
        saveState(); updateHeaderUI(); closeModal('authModal'); showToast("Logged in as Administrator"); navigateTo('admin');
    } else {
        currentUser = { name: "Jane Doe", email: "user@stylehub.com", role: "customer", address: "742 Evergreen Terrace, New York, NY 10001" };
        saveState(); updateHeaderUI(); closeModal('authModal'); showToast("Logged in as Jane Doe");
    }
}

function logoutUser() {
    currentUser = null; saveState(); updateHeaderUI(); navigateTo('home'); showToast("You have been logged out safely.");
}

function updateHeaderUI() {
    document.getElementById('wishlistCount').textContent = wishlist.length;
    const authArea = document.getElementById('authArea');
    const ordersBtn = document.getElementById('ordersNavBtn');
    const adminBtn = document.getElementById('adminNavBtn');
    if (currentUser) {
        ordersBtn.style.display = 'inline-block';
        adminBtn.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
        authArea.innerHTML = `<span style="font-size:0.85rem; font-weight:600; margin-right:6px;">Hi, ${currentUser.name}</span><button class="btn-secondary btn-xs" onclick="logoutUser()">Logout</button>`;
    } else {
        ordersBtn.style.display = 'inline-block';
        adminBtn.style.display = 'none';
        authArea.innerHTML = `<button class="btn-primary btn-sm" onclick="openAuthModal()">Login / Register</button>`;
    }
}

function switchAdminTab(tab, btn) {
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('adminProductsTab').style.display = tab === 'products' ? 'block' : 'none';
    document.getElementById('adminCustomersTab').style.display = tab === 'customers' ? 'block' : 'none';
}

function handleAddProduct(e) {
    e.preventDefault();
    const name = document.getElementById('newProdName').value.trim();
    const category = document.getElementById('newProdCategory').value;
    const subcategory = document.getElementById('newProdSubCategory').value;
    const price = parseFloat(document.getElementById('newProdPrice').value);
    const stock = parseInt(document.getElementById('newProdStock').value, 10);
    const customImg = document.getElementById('newProdImage').value.trim();
    const description = document.getElementById('newProdDesc').value.trim();
    const newItem = {
        id: "SH-" + Math.floor(200 + Math.random() * 800), name, category, subcategory, price, stock,
        popularity: 90, flashSale: false, rating: 5.0, sizes: ["S", "M", "L", "XL"],
        image: customImg || createPlaceholderSVG(name, "#1f2937"), description, reviews: []
    };
    products.unshift(newItem);
    saveState(); e.target.reset(); renderAdminProducts(); applyFilters();
    showToast(`Added "${name}" to StyleHub catalog!`);
}

function renderAdminProducts() {
    const tbody = document.getElementById('adminProductTableBody');
    tbody.innerHTML = products.map((p, idx) => `
        <tr>
            <td><strong>${p.id}</strong></td>
            <td>${p.name}</td>
            <td>${p.category}<br><small class="muted-text">${p.subcategory}</small></td>
            <td style="width:110px;"><input type="number" step="0.01" id="edit-price-${idx}" value="${p.price}"></td>
            <td style="width:90px;"><input type="number" id="edit-stock-${idx}" value="${p.stock}"></td>
            <td><textarea rows="2" id="edit-desc-${idx}">${p.description}</textarea></td>
            <td style="width:150px;">
                <button class="btn-primary btn-xs" onclick="saveProductEdits(${idx})">Save</button>
                <button class="btn-secondary btn-xs" style="background:#fee2e2; color:#991b1b;" onclick="removeProduct(${idx})">Remove</button>
            </td>
        </tr>
    `).join('');
}

function saveProductEdits(idx) {
    const newPrice = parseFloat(document.getElementById(`edit-price-${idx}`).value);
    const newStock = parseInt(document.getElementById(`edit-stock-${idx}`).value, 10);
    const newDesc = document.getElementById(`edit-desc-${idx}`).value.trim();
    if (isNaN(newPrice) || newPrice < 0) { showToast("Please enter a valid price."); return; }
    products[idx].price = newPrice;
    products[idx].stock = isNaN(newStock) ? products[idx].stock : newStock;
    products[idx].description = newDesc;
    saveState(); applyFilters(); renderRecommendations();
    showToast(`Updated "${products[idx].name}" price & description!`);
}

function removeProduct(idx) {
    const removed = products.splice(idx, 1)[0];
    saveState(); renderAdminProducts(); applyFilters(); renderRecommendations();
    showToast(`Removed "${removed.name}" from catalog.`);
}

function renderAdminCustomerOrders() {
    const container = document.getElementById('adminCustomerOrdersList');
    if (!orders.length) { container.innerHTML = `<p class="muted-text">No customer checkouts recorded yet.</p>`; return; }
    container.innerHTML = orders.map((o, idx) => `
        <div class="order-card" style="margin-top:12px;">
            <div class="order-top">
                <div>
                    <strong>${o.orderId}</strong> &bull; Date: ${o.date}<br>
                    <strong>Customer:</strong> ${o.customerName} | <strong>Email:</strong> ${o.customerEmail} | <strong>Phone:</strong> ${o.customerPhone || 'N/A'}<br>
                    <strong>Shipping Address:</strong> ${o.shippingAddress} | <strong>Payment:</strong> ${o.paymentMethod}
                </div>
                <div>
                    <label style="font-size:0.8rem; font-weight:700;">Order Status:</label><br>
                    <select onchange="updateOrderStatus(${idx}, this.value)" style="padding:5px; border-radius:4px; margin-top:4px;">
                        ${["Order Placed", "Processing", "Shipped", "Delivered"].map(st => `<option value="${st}" ${o.status === st ? 'selected' : ''}>${st}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div>
                <strong>Checked-Out Items (Total: $${Number(o.total).toFixed(2)}):</strong>
                <ul style="margin-left:18px; margin-top:6px; font-size:0.9rem;">
                    ${o.items.map(item => `<li>${item.qty}x ${item.name} (Size: ${item.size}) — $${(item.price * item.qty).toFixed(2)}</li>`).join('')}
                </ul>
            </div>
        </div>
    `).join('');
}

function updateOrderStatus(orderIdx, newStatus) {
    orders[orderIdx].status = newStatus;
    saveState();
    showToast(`Order ${orders[orderIdx].orderId} status updated to "${newStatus}"`);
}

function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }

function showPolicyModal(type) {
    const modalBody = document.getElementById('productModalBody');
    if (type === 'size') {
        modalBody.innerHTML = `
            <h2>Universal Fashion Size Guide</h2>
            <p class="muted-text" style="margin-bottom:14px;">Measurements in inches (Standard Fit)</p>
            <table class="admin-table">
                <thead><tr><th>Size</th><th>Chest / Bust</th><th>Waist</th><th>Hips</th></tr></thead>
                <tbody>
                    <tr><td>XS</td><td>32 - 34"</td><td>25 - 27"</td><td>35 - 37"</td></tr>
                    <tr><td>S</td><td>35 - 37"</td><td>28 - 30"</td><td>38 - 40"</td></tr>
                    <tr><td>M</td><td>38 - 40"</td><td>31 - 33"</td><td>41 - 43"</td></tr>
                    <tr><td>L</td><td>41 - 43"</td><td>34 - 36"</td><td>44 - 46"</td></tr>
                    <tr><td>XL</td><td>44 - 46"</td><td>37 - 40"</td><td>47 - 49"</td></tr>
                </tbody>
            </table>
        `;
    } else {
        modalBody.innerHTML = `
            <h2>30-Day Easy Return & Exchange Policy</h2>
            <p style="margin-top:10px;">At StyleHub, we want you to love every piece in your wardrobe. If an item doesn't fit quite right, enjoy free returns and instant size exchanges within 30 days of delivery.</p>
            <ul style="margin:14px 0 0 20px;">
                <li>Unworn items with original tags attached qualify for a full refund or free exchange.</li>
                <li>Generate prepaid return labels directly from your <strong>My Orders</strong> dashboard.</li>
            </ul>
        `;
    }
    document.getElementById('productModal').style.display = 'block';
}

function leaveSitePrompt() {
    if (confirm("Are you sure you want to leave StyleHub? Your shopping cart and wishlist are saved for your next visit.")) {
        document.body.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; text-align:center; padding:20px;">
                <h1>Thank you for visiting StyleHub!</h1>
                <p style="color:#6b7280; margin:12px 0 20px;">Your cart and preferences have been saved safely.</p>
                <button onclick="location.reload()" class="btn-primary">Return to StyleHub Storefront</button>
            </div>
        `;
    }
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) event.target.style.display = 'none';
};
