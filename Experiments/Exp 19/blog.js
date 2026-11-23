let articles = JSON.parse(localStorage.getItem('wc_articles')) || TRAVEL_ARTICLES;
let packingItems = JSON.parse(localStorage.getItem('wc_packing')) || DEFAULT_PACKING_ITEMS;
let activeCategory = 'All';
let currentArticleId = null;
let currentGallery = [];
let currentSlideIdx = 0;

function persistBlog() {
    localStorage.setItem('wc_articles', JSON.stringify(articles));
    localStorage.setItem('wc_packing', JSON.stringify(packingItems));
}

document.addEventListener('DOMContentLoaded', () => {
    renderHeroCover();
    renderInteractiveMapPins();
    renderArticlesFeed();
    renderDestinationsDirectory();
    renderAboutPortrait();
    renderPackingChecklist();
});

function showToast(msg) {
    const t = document.getElementById('toastBanner');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3200);
}

// Section Navigation
function openSection(sectionName, navBtn = null) {
    document.querySelectorAll('.page-section').forEach(s => s.style.display = 'none');
    document.getElementById(`section-${sectionName}`).style.display = 'block';

    if (navBtn) {
        document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
        navBtn.classList.add('active');
    } else {
        document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
        const matching = document.getElementById(`nav-${sectionName}`);
        if (matching) matching.classList.add('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 1. Homepage Hero Featured Article
function renderHeroCover() {
    const featured = articles.find(a => a.featured) || articles[0];
    document.getElementById('heroCoverBox').innerHTML = `
        <div class="container hero-inner">
            <div>
                <span class="eyebrow-label">FEATURED DISPATCH &bull; ${featured.destination.toUpperCase()}</span>
                <h1>${featured.title}</h1>
                <p>${featured.excerpt}</p>
                <button class="btn-terracotta" onclick="openArticleReader('${featured.id}')">Read Full Story & View Gallery &rarr;</button>
            </div>
            <div>
                <img src="${featured.coverImage}" alt="${featured.title}" class="hero-cover-img" style="cursor:pointer;" onclick="openArticleReader('${featured.id}')">
            </div>
        </div>
    `;
}

// 4. Interactive Map Markers -> Clicking a marker opens the respective travel article
function renderInteractiveMapPins() {
    const overlay = document.getElementById('mapMarkersOverlay');
    overlay.innerHTML = articles.map(a => `
        <button class="map-marker-btn"
                style="left: ${a.mapX}%; top: ${a.mapY}%;"
                onclick="openArticleReader('${a.id}')"
                title="Read travel story from ${a.destination}">
            📍 ${a.destination}
        </button>
    `).join('');
}

// 3. Filter Articles by Destination/Region & Category
function setCategoryFilter(cat, btn) {
    activeCategory = cat;
    document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
    if (btn) btn.classList.add('active');
    renderArticlesFeed();
}

function renderArticlesFeed() {
    const region = document.getElementById('regionSelectFilter').value;
    const filtered = articles.filter(a => {
        const matchReg = region === 'All' || a.region === region;
        const matchCat = activeCategory === 'All' || a.category === activeCategory;
        return matchReg && matchCat;
    });

    const grid = document.getElementById('articlesGrid');
    if (!filtered.length) {
        grid.innerHTML = `<p class="muted-text" style="grid-column:1/-1; text-align:center; padding:30px;">No travel dispatches match this region and category filter.</p>`;
        return;
    }

    grid.innerHTML = filtered.map(a => `
        <article class="blog-card">
            <div class="blog-card-img" onclick="openArticleReader('${a.id}')">
                <img src="${a.coverImage}" alt="${a.title}">
            </div>
            <div class="blog-card-body">
                <div class="card-meta-line">${a.category} &bull; 📍 ${a.destination}</div>
                <h3 class="blog-card-title" onclick="openArticleReader('${a.id}')">${a.title}</h3>
                <p class="blog-card-excerpt">${a.excerpt}</p>
                <div class="blog-card-footer">
                    <span>${a.date} &bull; ${a.readTime}</span>
                    <span>💬 ${a.comments.length} &bull; 🖼️ ${a.gallery.length}</span>
                </div>
            </div>
        </article>
    `).join('');
}

// 2, 5 & 6. Individual Blog Article View with Photo Gallery Slideshow, Video Dispatch, Social Share & Comments
function openArticleReader(articleId) {
    const art = articles.find(a => a.id === articleId);
    if (!art) return;
    currentArticleId = articleId;
    currentGallery = art.gallery || [];

    const container = document.getElementById('articleReaderContent');
    container.innerHTML = `
        <span class="eyebrow-label">${art.category} &bull; 📍 ${art.destination} (${art.region})</span>
        <h1 class="article-title-main">${art.title}</h1>
        <p class="muted-sm">Published on ${art.date} &bull; ${art.readTime} &bull; By Aarav Menon</p>

        <figure class="article-figure">
            <img src="${art.coverImage}" alt="${art.title}">
            <figcaption>${art.coverCaption}</figcaption>
        </figure>

        <div class="article-prose">
            ${art.paragraphs.map(p => `<p>${p}</p>`).join('')}
        </div>

        <!-- Travel Tips Callout -->
        <div class="travel-tips-box">
            <strong>🧭 Field-Tested Travel Tips for ${art.destination}:</strong>
            <ul>
                ${art.tips.map(t => `<li>${t}</li>`).join('')}
            </ul>
        </div>

        <!-- Video Dispatch Box -->
        <div class="video-dispatch-box">
            <div style="font-size:2.2rem; margin-bottom:6px;">🎬</div>
            <strong>${art.videoCaption}</strong>
            <p class="muted-sm" style="color:#d6d3d1; margin-top:4px;">4K Travelogue Audio-Visual Field Note</p>
        </div>

        <!-- 5. Photo Gallery with Slideshow Lightbox -->
        <div class="gallery-section">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <h3>📸 Photo Gallery (${art.gallery.length} Photos)</h3>
                <button class="btn-terracotta" style="padding:7px 14px; font-size:0.84rem;" onclick="openLightbox(0)">▶ View Full-Screen Slideshow</button>
            </div>
            <div class="gallery-thumbs-grid">
                ${art.gallery.map((g, idx) => `
                    <div class="gallery-thumb" onclick="openLightbox(${idx})">
                        <img src="${g.src}" alt="${g.caption}">
                        <span class="gallery-zoom-tag">🔍 Enlarge</span>
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- 6. Social Media Sharing -->
        <div class="share-bar">
            <strong>Share this Adventure:</strong>
            <div class="share-btns">
                <button class="share-btn" onclick="shareArticle('Instagram Story', '${art.title}')">📸 Instagram</button>
                <button class="share-btn" onclick="shareArticle('X / Twitter', '${art.title}')">𝕏 Post</button>
                <button class="share-btn" onclick="shareArticle('Facebook', '${art.title}')">📘 Facebook</button>
                <button class="share-btn" onclick="shareArticle('Copy Link', '${art.title}')">🔗 Copy Link</button>
            </div>
        </div>

        <!-- 6. Reader Comments & Engagement -->
        <div class="comments-section">
            <h3>💬 Reader Comments & Questions (${art.comments.length})</h3>
            <form onsubmit="postReaderComment(event)" class="comment-form">
                <input type="text" id="commenterName" placeholder="Your Name" required>
                <textarea id="commenterText" rows="3" placeholder="Share your thoughts, ask a travel question, or leave a tip..." required></textarea>
                <button type="submit" class="btn-terracotta" style="width:fit-content;">Post Comment</button>
            </form>

            <div id="articleCommentsList">
                ${art.comments.length ? art.comments.map(c => `
                    <div class="comment-item">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <strong>${c.author}</strong>
                            <span class="muted-sm">${c.date}</span>
                        </div>
                        <p style="font-size:0.92rem;">${c.text}</p>
                    </div>
                `).join('') : '<p class="muted-sm">No comments yet. Start the conversation above!</p>'}
            </div>
        </div>
    `;

    openSection('article');
}

function shareArticle(platform, title) {
    showToast(`Shared "${title}" via ${platform}!`);
}

function postReaderComment(e) {
    e.preventDefault();
    const author = document.getElementById('commenterName').value.trim();
    const text = document.getElementById('commenterText').value.trim();
    if (!author || !text) return;

    const art = articles.find(a => a.id === currentArticleId);
    art.comments.unshift({
        author,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        text
    });
    persistBlog();
    openArticleReader(currentArticleId);
    showToast("Thank you! Your comment has been published.");
}

// Photo Gallery Slideshow Lightbox
function openLightbox(idx) {
    if (!currentGallery.length) return;
    currentSlideIdx = idx;
    updateLightboxSlide();
    document.getElementById('lightboxModal').classList.add('open');
}

function closeLightbox() {
    document.getElementById('lightboxModal').classList.remove('open');
}

function stepSlideshow(delta) {
    currentSlideIdx = (currentSlideIdx + delta + currentGallery.length) % currentGallery.length;
    updateLightboxSlide();
}

function updateLightboxSlide() {
    const slide = currentGallery[currentSlideIdx];
    document.getElementById('lbImage').src = slide.src;
    document.getElementById('lbCaption').textContent = slide.caption;
    document.getElementById('lbCounter').textContent = `Photo ${currentSlideIdx + 1} of ${currentGallery.length}`;
}

// Destinations Directory
function renderDestinationsDirectory() {
    const grid = document.getElementById('destinationsDirectoryGrid');
    grid.innerHTML = articles.map(a => `
        <div class="dest-card">
            <span class="eyebrow-label">${a.region}</span>
            <h3 style="font-family:Georgia,serif; margin-bottom:6px;">${a.destination}</h3>
            <p class="muted-sm" style="margin-bottom:12px;">${a.excerpt}</p>
            <button class="btn-terracotta" style="padding:7px 14px; font-size:0.84rem;" onclick="openArticleReader('${a.id}')">Explore ${a.destination} &rarr;</button>
        </div>
    `).join('');
}

// About Page Portrait
function renderAboutPortrait() {
    const portrait = createScenicArt("Aarav Menon", "Travel Photographer & Writer • 34 Countries", "#14532d", "#1e3a8a", "📷");
    document.getElementById('travelerPortraitBox').innerHTML = `<img src="${portrait}" alt="Aarav Menon Traveler Portrait">`;
}

// Resources Packing List
function renderPackingChecklist() {
    const box = document.getElementById('packingChecklistBox');
    box.innerHTML = packingItems.map((item, idx) => `
        <label class="pack-row">
            <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="togglePackItem(${idx})">
            <span style="${item.checked ? 'text-decoration:line-through; color:var(--muted);' : ''}">${item.label}</span>
        </label>
    `).join('');
}

function togglePackItem(idx) {
    packingItems[idx].checked = !packingItems[idx].checked;
    persistBlog();
    renderPackingChecklist();
}
