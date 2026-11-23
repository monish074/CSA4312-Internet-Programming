// High-resolution embedded SVG travel illustrations so every photo, cover, and gallery slide works offline
function createScenicArt(title, subtitle, c1, c2, icon) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="480" viewBox="0 0 800 480">
        <defs>
            <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="${c1}"/>
                <stop offset="100%" stop-color="${c2}"/>
            </linearGradient>
        </defs>
        <rect width="800" height="480" fill="url(#g)"/>
        <circle cx="640" cy="110" r="65" fill="rgba(255,255,255,0.16)"/>
        <path d="M0,370 Q220,280 430,360 T800,330 L800,480 L0,480 Z" fill="rgba(0,0,0,0.22)"/>
        <text x="50%" y="42%" dominant-baseline="middle" text-anchor="middle" font-size="54">${icon}</text>
        <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Georgia, serif" font-size="30" font-weight="bold">${title}</text>
        <text x="50%" y="67%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-family="sans-serif" font-size="16">${subtitle}</text>
    </svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

const TRAVEL_ARTICLES = [
    {
        id: "art-kyoto",
        title: "Dawn Through the Vermilion Gates of Kyoto & Uji Tea Trails",
        destination: "Kyoto, Japan",
        region: "Asia",
        category: "Cultural Insights",
        date: "November 14, 2026",
        readTime: "7 min read",
        featured: true,
        mapX: 82.5,
        mapY: 31.5,
        coverImage: createScenicArt("Kyoto & Uji Tea Trails", "Fushimi Inari • Arashiyama • Matcha Houses", "#7f1d1d", "#c2410c", "⛩️"),
        coverCaption: "Early morning sunlight filtering through the torii gates of Mount Inari before the crowds arrive.",
        excerpt: "Walking the silent forest paths of Fushimi Inari at 5:30 AM, followed by ceremonial matcha whisking in family-run Uji teahouses.",
        paragraphs: [
            "Arriving at Fushimi Inari Taisha before sunrise transforms one of Japan's most photographed landmarks into a quiet sanctuary. Beyond the Yotsutsuji intersection, the cedar forest swallows the city hum, leaving only the crunch of gravel and distant temple bells.",
            "Twenty minutes south by local train lies Uji, the historic heartland of Japanese green tea. Along the Uji River, third-generation tea masters stone-grind shade-grown tencha leaves into vibrant ceremonial matcha.",
            "Whether you are wandering bamboo groves in Arashiyama or sharing charred yuba skewers at Nishiki Market, Kyoto rewards travelers who slow their pace and explore side alleys on foot."
        ],
        tips: [
            "Arrive at Fushimi Inari before 6:15 AM for empty pathways and golden morning light.",
            "Carry a small coin purse for neighborhood temples and family-run soba noodle counters.",
            "Take the Keihan Main Line to Uji for authentic matcha tastings away from central tourist crowds."
        ],
        videoCaption: "Field Vlog Dispatch: Morning Walk Through Kyoto's Cedar Trails & Uji Tea Ceremony (04:18)",
        gallery: [
            { src: createScenicArt("Fushimi Inari Sunrise", "Thousand Vermilion Torii Gates", "#991b1b", "#ea580c", "⛩️"), caption: "Golden hour light along the upper mountain torii trail" },
            { src: createScenicArt("Uji Matcha Ceremony", "Stone-Ground Ceremonial Tea", "#14532d", "#15803d", "🍵"), caption: "Traditional whisked matcha served with seasonal wagashi sweets" },
            { src: createScenicArt("Arashiyama Bamboo Grove", "Misty Morning Walk", "#064e3b", "#0d9488", "🎋"), caption: "Towering stalks of moso bamboo in western Kyoto" }
        ],
        comments: [
            { author: "Elena Rostova", date: "Nov 16, 2026", text: "The tip about taking the Keihan line down to Uji saved our afternoon—best matcha ice cream ever!" },
            { author: "Vikram Patel", date: "Nov 18, 2026", text: "Did you need advance reservations for the Uji teahouse tasting?" }
        ]
    },
    {
        id: "art-amalfi",
        title: "Cliffside Lemon Groves & Coastal Trattorias of the Amalfi Coast",
        destination: "Ravello & Amalfi, Italy",
        region: "Europe",
        category: "Food Experiences",
        date: "October 28, 2026",
        readTime: "6 min read",
        featured: false,
        mapX: 50.5,
        mapY: 26.5,
        coverImage: createScenicArt("Amalfi Coast & Ravello", "Sentiero dei Limoni • Handmade Scialatielli", "#0369a1", "#0284c7", "🍋"),
        coverCaption: "Terraced Sfusato Amalfitano lemon orchards overlooking the Tyrrhenian Sea.",
        excerpt: "Hiking the fragrant Path of the Lemons between Maiori and Minori and learning handmade pasta secrets in a cliffside kitchen.",
        paragraphs: [
            "Suspended high above the cobalt waters of southern Italy, the Sentiero dei Limoni connects the coastal villages of Maiori and Minori through centuries-old stone stairways shaded by pergola lemon groves.",
            "In family-run trattorias, local chefs toss thick ribbons of handmade scialatielli pasta with sweet Vesuvio tomatoes, fresh basil, and aromatic grated Amalfi lemon zest.",
            "End the afternoon in Ravello's Villa Cimbrone gardens, where the Terrace of Infinity frames the coastline in warm Mediterranean gold."
        ],
        tips: [
            "Use SITA coastal ferries between towns instead of buses during peak afternoon hours.",
            "Try Delizia al Limone at a historic pastry shop in Minori right after completing the lemon trail hike.",
            "Book Villa Cimbrone entry tickets early in the morning for unobstructed coastal views."
        ],
        videoCaption: "Culinary Field Note: Making Lemon Scialatielli Pasta Overlooking Ravello (03:45)",
        gallery: [
            { src: createScenicArt("Sentiero dei Limoni", "Pergola Lemon Orchards", "#ca8a04", "#eab308", "🍋"), caption: "Fragrant Sfusato lemons ripening along the cliffside trail" },
            { src: createScenicArt("Ravello Coastal Vista", "Terrace of Infinity Viewpoint", "#1d4ed8", "#0ea5e9", "🌊"), caption: "Late afternoon light across the Gulf of Salerno" },
            { src: createScenicArt("Handmade Scialatielli", "Amalfi Coastal Trattoria", "#b45309", "#d97706", "🍝"), caption: "Freshly rolled lemon-herb pasta served family style" }
        ],
        comments: [
            { author: "Marco Bellini", date: "Nov 02, 2026", text: "Minori is truly the hidden culinary gem of the Amalfi Coast!" }
        ]
    },
    {
        id: "art-patagonia",
        title: "Crossing the Granite Spires & Glacial Lagoons of Patagonia",
        destination: "El Chaltén, Argentina",
        region: "South America",
        category: "Travel Guides",
        date: "September 19, 2026",
        readTime: "8 min read",
        featured: false,
        mapX: 28.0,
        mapY: 79.0,
        coverImage: createScenicArt("Patagonia Granite Spires", "Mount Fitz Roy • Laguna de los Tres", "#1e3a8a", "#0f766e", "🏔️"),
        coverCaption: "Alpenglow illuminating the jagged granite peaks of Mount Fitz Roy above Laguna de los Tres.",
        excerpt: "A complete trailhead-to-summit trekking guide for El Chaltén, weather-layering strategies, and glacial viewpoints.",
        paragraphs: [
            "Known as Argentina's trekking capital, El Chaltén sits at the edge of Los Glaciares National Park where trailheads begin directly at the end of town—no shuttle required.",
            "The 20-kilometer round-trip hike to Laguna de los Tres climbs steadily through lenga beech forests before ascending a dramatic moraine to reveal turquoise glacial waters beneath Mount Fitz Roy.",
            "Patagonian weather can cycle through four seasons in a single hour, making windproof outer shells and trekking poles indispensable companions."
        ],
        tips: [
            "Start the Laguna de los Tres trail by 6:00 AM with a headlamp to catch sunrise alpenglow on Fitz Roy.",
            "Carry cash (Argentine Pesos) in El Chaltén, as satellite ATM connectivity can be intermittent.",
            "Pack a windproof hardshell jacket and merino base layers even during mid-summer hikes."
        ],
        videoCaption: "Trail Dispatch: Sunrise Alpenglow at Laguna de los Tres, El Chaltén (05:12)",
        gallery: [
            { src: createScenicArt("Mount Fitz Roy Sunrise", "Laguna de los Tres", "#1e40af", "#3b82f6", "🏔️"), caption: "First light hitting the granite massif above the glacial lake" },
            { src: createScenicArt("Lenga Beech Trail", "Los Glaciares National Park", "#065f46", "#059669", "🌲"), caption: "Autumn foliage along the Rio Blanco valley approach" }
        ],
        comments: []
    },
    {
        id: "art-nilgiris",
        title: "Misty Cloud Forests & Heritage Toy Train of the Nilgiri Hills",
        destination: "Ooty & Coonoor, India",
        region: "Asia",
        category: "Destinations",
        date: "August 30, 2026",
        readTime: "5 min read",
        featured: false,
        mapX: 69.5,
        mapY: 44.5,
        coverImage: createScenicArt("Nilgiri Blue Mountains", "Heritage Mountain Railway • Tea Estates", "#065f46", "#047857", "🚂"),
        coverCaption: "The UNESCO-listed Nilgiri Mountain Railway winding across stone viaducts in Tamil Nadu.",
        excerpt: "Riding the historic blue-and-cream rack railway from Mettupalayam to Coonoor through emerald tea plantations and eucalyptus mist.",
        paragraphs: [
            "Climbing more than 2,000 meters through 16 tunnels and over 250 bridges, the Nilgiri Mountain Railway offers one of South India's most enchanting slow-travel journeys.",
            "Around Coonoor, rolling emerald tea estates cling to steep slopes where pluckers harvest delicate two-leaves-and-a-bud shoots in the cool mountain air.",
            "Pair an afternoon estate tasting of fragrant Nilgiri frost tea with freshly baked scones and locally roasted filter coffee."
        ],
        tips: [
            "Book First Class or window seats on the Mettupalayam–Coonoor morning train weeks in advance.",
            "Visit Highfield or Glendale tea estates in Coonoor for guided orthodox tea processing tours.",
            "Pack a warm fleece jacket—evenings drop below 12°C even when the plains are warm."
        ],
        videoCaption: "Railway Dispatch: Crossing Viaducts on the Nilgiri Mountain Train (03:20)",
        gallery: [
            { src: createScenicArt("Nilgiri Mountain Train", "Mettupalayam to Coonoor", "#14532d", "#16a34a", "🚂"), caption: "Climbing through misty mountain tunnels on the rack railway" },
            { src: createScenicArt("Coonoor Tea Plantations", "Emerald Nilgiri Slopes", "#047857", "#10b981", "🍃"), caption: "Morning mist rolling across high-altitude tea gardens" }
        ],
        comments: [
            { author: "Karthik N.", date: "Sep 04, 2026", text: "The stretch between Kallar and Hillgrove is pure magic during the post-monsoon mist!" }
        ]
    }
];

const DEFAULT_PACKING_ITEMS = [
    { label: "35L Carry-On Clamshell Backpack", checked: true },
    { label: "Weatherproof Wind & Rain Hardshell Jacket", checked: true },
    { label: "Universal Travel Adapter + 20,000mAh Power Bank", checked: false },
    { label: "Mirrorless Camera + Spare Batteries & Dual SD Cards", checked: false },
    { label: "Offline Regional Maps & Digital Passport Copies", checked: true },
    { label: "Reusable Insulated Water Bottle & First-Aid Pouch", checked: false }
];
