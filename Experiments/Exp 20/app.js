let currentSlide = 0;
let carouselTimer = null;
let reservations = JSON.parse(localStorage.getItem('gh_reservations')) || [
    {
        code: "GH-8821",
        name: "Vikramaditya Menon",
        party: "2 Guests (Intimate Table)",
        date: "2026-11-28",
        time: "7:30 PM — Prime Candlelight Seating",
        notes: "Window terrace preferred"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    renderCarousel();
    startCarouselAutoPlay();
    renderHomeExtras();
    filterMenuCategory('Appetizers');
    renderAboutTeam();
    renderEvents();
    renderGallery();
    renderReservationsList();

    const nextSat = new Date();
    nextSat.setDate(nextSat.getDate() + 2);
    document.getElementById('resDate').value = nextSat.toISOString().split('T')[0];
});

function showToast(msg) {
    const t = document.getElementById('toastNotice');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3300);
}

// Page Navigation
function showPage(pageId, navBtn = null) {
    document.querySelectorAll('.view-section').forEach(sec => sec.style.display = 'none');
    document.getElementById(`page-${pageId}`).style.display = 'block';

    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    if (navBtn) {
        navBtn.classList.add('active');
    } else {
        const matched = document.getElementById(`btn-${pageId}`);
        if (matched) matched.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 1. Rotating Hero Carousel
function renderCarousel() {
    const slide = CAROUSEL_SLIDES[currentSlide];
    document.getElementById('carouselSlideDisplay').innerHTML = `
        <img src="${slide.image}" alt="${slide.title}" class="carousel-bg-img">
        <div class="carousel-caption-overlay">
            <span class="gold-eyebrow">${slide.eyebrow}</span>
            <h1>${slide.title}</h1>
            <p>${slide.desc}</p>
            <button class="btn-gold" onclick="showPage('${slide.ctaTarget}')">${slide.ctaText}</button>
        </div>
    `;

    document.getElementById('carouselDots').innerHTML = CAROUSEL_SLIDES.map((_, idx) => `
        <button class="dot-btn ${idx === currentSlide ? 'active' : ''}" onclick="goToSlide(${idx})" aria-label="Slide ${idx + 1}"></button>
    `).join('');
}

function moveCarousel(delta) {
    currentSlide = (currentSlide + delta + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length;
    renderCarousel();
}

function goToSlide(idx) {
    currentSlide = idx;
    renderCarousel();
}

function startCarouselAutoPlay() {
    if (carouselTimer) clearInterval(carouselTimer);
    carouselTimer = setInterval(() => moveCarousel(1), 5500);
}

function renderHomeExtras() {
    // Interior, Exterior & Signature Dish Preview Cards
    const highlights = [
        { label: "Velvet Dining Interior", img: GALLERY_PHOTOS[0].src },
        { label: "Heritage Courtyard Exterior", img: GALLERY_PHOTOS[1].src },
        { label: "Signature Tasting Plates", img: GALLERY_PHOTOS[2].src }
    ];
    document.getElementById('homeAmbianceCards').innerHTML = highlights.map(h => `
        <div class="amb-card" style="cursor:pointer;" onclick="showPage('gallery')">
            <img src="${h.img}" alt="${h.label}">
            <span>${h.label}</span>
        </div>
    `).join('');

    // Testimonials
    document.getElementById('testimonialsGrid').innerHTML = TESTIMONIALS.map(t => `
        <div class="review-tile">
            <div class="stars">★★★★★</div>
            <p style="font-style:italic; color:#e7e5e4; margin-bottom:14px;">"${t.quote}"</p>
            <strong>${t.author}</strong><br>
            <span class="muted-light" style="font-size:0.8rem;">${t.occasion}</span>
        </div>
    `).join('');
}

// 2. Interactive Menu Page
function filterMenuCategory(category, tabBtn = null) {
    if (tabBtn) {
        document.querySelectorAll('.menu-tab').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
    }
    const dishes = MENU_ITEMS.filter(m => m.category === category);
    document.getElementById('menuItemsGrid').innerHTML = dishes.map(d => `
        <div class="dish-card">
            <img src="${d.image}" alt="${d.name}">
            <div class="dish-body">
                <div class="dish-title-row">
                    <h3>${d.name}</h3>
                    <span class="dish-price">$${d.price}</span>
                </div>
                <p class="dish-desc">${d.description}</p>
                <div class="dish-ingredients"><strong>Key Ingredients:</strong> ${d.ingredients}</div>
            </div>
        </div>
    `).join('');
}

// 4. Table Reservation System
function submitTableReservation(e) {
    e.preventDefault();
    const newRes = {
        code: "GH-" + Math.floor(1000 + Math.random() * 8999),
        name: document.getElementById('resGuestName').value.trim(),
        email: document.getElementById('resGuestEmail').value.trim(),
        phone: document.getElementById('resGuestPhone').value.trim(),
        party: document.getElementById('resPartySize').value,
        date: document.getElementById('resDate').value,
        time: document.getElementById('resTimeSlot').value,
        notes: document.getElementById('resNotes').value.trim() || "Standard dining preference"
    };
    reservations.unshift(newRes);
    localStorage.setItem('gh_reservations', JSON.stringify(reservations));
    e.target.reset();
    renderReservationsList();
    showToast(`Table confirmed (${newRes.code}) for ${newRes.date} at ${newRes.time}!`);
}

function renderReservationsList() {
    const box = document.getElementById('reservationsList');
    box.innerHTML = reservations.map(r => `
        <div class="res-ticket">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <strong style="color:var(--gold);">${r.code} &bull; ${r.name}</strong>
                <span>${r.party}</span>
            </div>
            <div>📅 <strong>${r.date}</strong> | 🕰️ ${r.time}</div>
            <div class="muted-light" style="font-size:0.8rem; margin-top:4px;">Notes: ${r.notes}</div>
        </div>
    `).join('');
}

// 5. About Us Culinary Team
function renderAboutTeam() {
    document.getElementById('culinaryTeamGrid').innerHTML = CULINARY_TEAM.map(c => `
        <div class="chef-card">
            <img src="${c.image}" alt="${c.name}">
            <div class="chef-info">
                <span class="chef-role">${c.role}</span>
                <h3 style="font-family:Georgia,serif; margin-bottom:8px;">${c.name}</h3>
                <p class="muted-light">${c.bio}</p>
            </div>
        </div>
    `).join('');
}

// 6. Special Offers & Events
function renderEvents() {
    document.getElementById('eventsOffersGrid').innerHTML = SPECIAL_EVENTS.map(ev => `
        <div class="event-card">
            <img src="${ev.image}" alt="${ev.title}">
            <div class="event-info">
                <span class="gold-eyebrow">${ev.tag}</span>
                <h3 style="font-family:Georgia,serif; margin-bottom:6px;">${ev.title}</h3>
                <p style="color:var(--gold-light); font-size:0.84rem; font-weight:700; margin-bottom:10px;">${ev.schedule}</p>
                <p class="muted-light" style="margin-bottom:14px;">${ev.details}</p>
                <button class="btn-outline-gold" style="padding:7px 14px; font-size:0.82rem;" onclick="showPage('reserve')">Reserve for Event</button>
            </div>
        </div>
    `).join('');
}

// Gallery & Lightbox
function renderGallery() {
    document.getElementById('fullGalleryGrid').innerHTML = GALLERY_PHOTOS.map((g, idx) => `
        <div class="gallery-tile" onclick="openGalleryLightbox(${idx})">
            <img src="${g.src}" alt="${g.caption}">
            <div class="gallery-overlay-label">${g.caption}</div>
        </div>
    `).join('');
}

function openGalleryLightbox(idx) {
    const item = GALLERY_PHOTOS[idx];
    document.getElementById('lbFullImg').src = item.src;
    document.getElementById('lbFullCaption').textContent = item.caption;
    document.getElementById('galleryModal').classList.add('open');
}

function closeGalleryModal() {
    document.getElementById('galleryModal').classList.remove('open');
}

// 3. Contact Form
function submitContactForm(e) {
    e.preventDefault();
    const name = document.getElementById('cntName').value.trim();
    const type = document.getElementById('cntType').value;
    e.target.reset();
    showToast(`Thank you, ${name}! Your ${type} has been sent to our concierge.`);
}
