function makeLuxuryVisual(title, subtitle, c1, c2, badge) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="520" viewBox="0 0 900 520">
        <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="${c1}"/>
                <stop offset="100%" stop-color="${c2}"/>
            </linearGradient>
        </defs>
        <rect width="900" height="520" fill="url(#bg)"/>
        <circle cx="450" cy="240" r="155" fill="none" stroke="rgba(212,175,55,0.35)" stroke-width="2"/>
        <circle cx="450" cy="240" r="125" fill="rgba(255,255,255,0.06)"/>
        <text x="50%" y="42%" dominant-baseline="middle" text-anchor="middle" font-size="48">${badge}</text>
        <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Georgia, serif" font-size="30" font-weight="bold">${title}</text>
        <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="#f3e5ab" font-family="sans-serif" font-size="15" letter-spacing="1.5">${subtitle}</text>
    </svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

const CAROUSEL_SLIDES = [
    {
        eyebrow: "SIGNATURE DINING EXPERIENCE",
        title: "An Evening of Hearth-Fired Gastronomy",
        desc: "Savor our 7-course Autumn Tasting Menu inside our candlelit heritage dining salon.",
        image: makeLuxuryVisual("The Main Candlelit Dining Salon", "GOURMET HAVEN • CHENNAI", "#1c1917", "#451a03", "🕯️"),
        ctaText: "Reserve a Table",
        ctaTarget: "reserve"
    },
    {
        eyebrow: "CHEF'S SIGNATURE CREATION",
        title: "Saffron & Black Truffle Lobster Risotto",
        desc: "Aged Acquerello carnaroli rice, butter-poached coastal lobster, and shaved Périgord truffle.",
        image: makeLuxuryVisual("Saffron & Black Truffle Risotto", "SIGNATURE MAIN COURSE", "#292524", "#78350f", "🍽️"),
        ctaText: "Explore Interactive Menu",
        ctaTarget: "menu"
    },
    {
        eyebrow: "HERITAGE EXTERIOR & TERRACE",
        title: "Twilight Courtyard & Sommelier Cellar",
        desc: "Begin your evening with botanical aperitifs beneath our lantern-lit banyan terrace.",
        image: makeLuxuryVisual("Lantern-Lit Heritage Courtyard", "EXTERIOR & GARDEN LOUNGE", "#0f172a", "#1e293b", "🏛️"),
        ctaText: "View Seasonal Events",
        ctaTarget: "events"
    }
];

const MENU_ITEMS = [
    {
        id: "M-101",
        category: "Appetizers",
        name: "Hokkaido Scallop & Yuzu Crudo",
        price: 28,
        description: "Hand-dived sea scallops thinly sliced with aged white soy, pickled sea buckthorn, and crisp lotus root.",
        ingredients: "Hokkaido Scallop, Yuzu Kosho, White Soy, Sea Buckthorn, Micro Shiso",
        image: makeLuxuryVisual("Hokkaido Scallop Crudo", "APPETIZER • RAW BAR", "#1e293b", "#0f766e", "🦪")
    },
    {
        id: "M-102",
        category: "Appetizers",
        name: "Charred Burrata & Heirloom Fig Tartine",
        price: 24,
        description: "Artisanal pugliese burrata over wood-grilled sourdough with black mission figs, roasted hazelnuts, and aged balsamic.",
        ingredients: "Pugliese Burrata, Black Figs, Sourdough, Piedmont Hazelnuts, 25-Yr Balsamic",
        image: makeLuxuryVisual("Burrata & Heirloom Fig Tartine", "APPETIZER • VEGETARIAN", "#3f1d2e", "#831843", "🥗")
    },
    {
        id: "M-201",
        category: "Main Courses",
        name: "Saffron & Black Truffle Lobster Risotto",
        price: 58,
        description: "Acquerello carnaroli rice simmered in roasted shellfish bisque with Kashmiri saffron and butter-poached lobster tail.",
        ingredients: "Carnaroli Rice, Coastal Lobster, Kashmiri Saffron, Black Truffle, Parmigiano 36M",
        image: makeLuxuryVisual("Saffron Lobster Risotto", "SIGNATURE MAIN COURSE", "#451a03", "#92400e", "🦞")
    },
    {
        id: "M-202",
        category: "Main Courses",
        name: "Hearth-Roasted Wagyu Tenderloin",
        price: 68,
        description: "A5 grass-fed tenderloin seared over white oak embers, served with smoked bone-marrow jus and celeriac mille-feuille.",
        ingredients: "Wagyu Tenderloin, Celeriac, Black Garlic Jus, Charred Shallot, Thyme",
        image: makeLuxuryVisual("Hearth-Roasted Wagyu Tenderloin", "WOOD-FIRED GRILL", "#1c1917", "#7f1d1d", "🥩")
    },
    {
        id: "M-203",
        category: "Main Courses",
        name: "Wild Morel & Forest Mushroom Wellington",
        price: 46,
        description: "Himalayan morels and roasted chestnut duxelles encased in flaky golden puff pastry with truffle madeira reduction.",
        ingredients: "Himalayan Morels, Chestnuts, Puff Pastry, Baby Leeks, Truffle Jus",
        image: makeLuxuryVisual("Wild Morel Wellington", "PLANT-FORWARD SIGNATURE", "#14532d", "#365314", "🍄")
    },
    {
        id: "M-301",
        category: "Desserts",
        name: "Valrhona Dark Chocolate & Gold Leaf Sphere",
        price: 22,
        description: "70% Guanaja dark chocolate dome melted tableside with warm salted espresso caramel and hazelnut praline.",
        ingredients: "Valrhona 70% Chocolate, Salted Caramel, Hazelnut Praline, 24K Edible Gold",
        image: makeLuxuryVisual("Valrhona Gold Leaf Sphere", "ARTISANAL DESSERT", "#271710", "#78350f", "🍫")
    },
    {
        id: "M-302",
        category: "Desserts",
        name: "Cardamom Pistachio Mille-Feuille",
        price: 19,
        description: "Caramelized puff pastry layered with green cardamom diplomat cream, Iranian pistachios, and rosewater gel.",
        ingredients: "Green Cardamom, Iranian Pistachio, Vanilla Bean Cream, Damask Rosewater",
        image: makeLuxuryVisual("Cardamom Pistachio Mille-Feuille", "PASTRY ATELIER", "#1e3a2f", "#065f46", "🍰")
    },
    {
        id: "M-401",
        category: "Cellar & Elixirs",
        name: "Smoked Rosemary & Blood Orange Elixir",
        price: 16,
        description: "Zero-proof botanical distillate infused with charred garden rosemary, Sicilian blood orange, and tonic mist.",
        ingredients: "Botanical Distillate, Blood Orange, Smoked Rosemary, Elderflower",
        image: makeLuxuryVisual("Smoked Rosemary Elixir", "BOTANICAL CELLAR", "#4c0519", "#9f1239", "🥂")
    }
];

const CULINARY_TEAM = [
    {
        name: "Chef Raghavendra Iyer",
        role: "Executive Chef & Culinary Director",
        bio: "Trained in Lyon and Tokyo, Chef Raghav blends classical French precision with coastal South Indian aromatics and wood-fire cooking.",
        image: makeLuxuryVisual("Chef Raghavendra Iyer", "EXECUTIVE CHEF", "#1c1917", "#78350f", "👨‍🍳")
    },
    {
        name: "Chef Claire Moreau",
        role: "Head Pastry Chef",
        bio: "Former Paris pâtissière renowned for architectural chocolate sculptures, botanical infusions, and low-sugar seasonal desserts.",
        image: makeLuxuryVisual("Chef Claire Moreau", "HEAD PASTRY CHEF", "#3f1d2e", "#831843", "👩‍🍳")
    },
    {
        name: "Siddharth Kulkarni",
        role: "Head Sommelier & Beverage Director",
        bio: "Curates Gourmet Haven's 400-label old-world cellar alongside house-fermented zero-proof botanical pairings.",
        image: makeLuxuryVisual("Siddharth Kulkarni", "HEAD SOMMELIER", "#0f172a", "#1e3a8a", "🍷")
    }
];

const SPECIAL_EVENTS = [
    {
        tag: "SEASONAL TASTING MENU",
        title: "Autumn 7-Course Truffle & Harvest Gala",
        schedule: "Every Friday & Saturday Evening • $135 per guest",
        details: "Experience seven curated courses celebrating Himalayan morels, coastal seafood, and shaved black truffles with optional cellar pairings.",
        image: makeLuxuryVisual("Autumn 7-Course Tasting Gala", "LIMITED SEATING • WEEKENDS", "#451a03", "#92400e", "✨")
    },
    {
        tag: "TWILIGHT LOUNGE PRIVILEGE",
        title: "Golden Hour Aperitif & Canapé Flights",
        schedule: "Tuesday – Friday • 6:00 PM – 7:30 PM",
        details: "Enjoy complimentary artisanal amuse-bouche platters with every signature botanical elixir or sommelier glass flight on the courtyard terrace.",
        image: makeLuxuryVisual("Golden Hour Terrace Flights", "TUE – FRI • 6:00 PM – 7:30 PM", "#1e293b", "#0f766e", "🍸")
    },
    {
        tag: "UPCOMING CELEBRATION",
        title: "New Year's Eve Candlelight Symphony Dinner",
        schedule: "December 31, 2026 • 8:00 PM – Midnight",
        details: "An unforgettable gala evening featuring live acoustic string quartet, eight-course tasting menu, and midnight toast.",
        image: makeLuxuryVisual("New Year's Eve Symphony Gala", "DECEMBER 31, 2026", "#1c1917", "#7f1d1d", "🎻")
    }
];

const TESTIMONIALS = [
    {
        quote: "An extraordinary culinary sanctuary. The Saffron Lobster Risotto and tableside Valrhona Chocolate Sphere rival Michelin-starred dining rooms anywhere in the world.",
        author: "Meenakshi Sundaram",
        occasion: "Anniversary Tasting Dinner"
    },
    {
        quote: "Impeccable warmth from the moment we stepped into the lantern-lit courtyard. Every course arrived with thoughtful storytelling from the sommelier and kitchen team.",
        author: "Jonathan & Priya Mercer",
        occasion: "Chef's Table Experience"
    },
    {
        quote: "The botanical zero-proof pairings were a revelation alongside the Wild Morel Wellington. Easily our favorite fine-dining destination in Chennai.",
        author: "Dr. Arvind Krishnan",
        occasion: "Weekend Dinner Patron"
    }
];

const GALLERY_PHOTOS = [
    { src: makeLuxuryVisual("Velvet Dining Salon", "Main Interior Dining Room", "#1c1917", "#451a03", "🕯️"), caption: "Main Dining Room — Handcrafted brass chandeliers and intimate velvet booths" },
    { src: makeLuxuryVisual("Heritage Courtyard Exterior", "Evening Lantern Entrance", "#0f172a", "#1e293b", "🏛️"), caption: "Restored 1920s Heritage Exterior & Banyan Garden Terrace" },
    { src: makeLuxuryVisual("Saffron & Truffle Lobster Risotto", "Signature Main Course", "#451a03", "#92400e", "🦞"), caption: "Saffron & Black Truffle Lobster Risotto plated in artisanal stoneware" },
    { src: makeLuxuryVisual("Hokkaido Scallop Crudo", "Cold Raw Bar Appetizer", "#1e293b", "#0f766e", "🦪"), caption: "Hokkaido Scallop & Yuzu Crudo with pickled sea buckthorn" },
    { src: makeLuxuryVisual("Valrhona Gold Leaf Sphere", "Signature Dessert", "#271710", "#78350f", "🍫"), caption: "Valrhona 70% Dark Chocolate & 24K Gold Leaf Sphere" },
    { src: makeLuxuryVisual("Private Wine Cellar Salon", "12-Guest Private Dining", "#3f1d2e", "#7f1d1d", "🍷"), caption: "Subterranean Sommelier Cellar for private celebrations" }
];
