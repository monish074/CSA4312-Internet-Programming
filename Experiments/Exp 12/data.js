// Categories ordered with the most popular categories listed first
const GIFT_CATEGORIES = [
    {
        name: "Floral Arrangements",
        rank: 1,
        tag: "Most Popular",
        subcategories: ["Romantic Roses", "Birthday & Anniversary", "Sympathy & Get Well"]
    },
    {
        name: "Occasion Specials",
        rank: 2,
        tag: "Trending",
        subcategories: ["Birthday & Anniversary", "Wedding & Congrats", "Thank You Blooms"]
    },
    {
        name: "Gift Baskets",
        rank: 3,
        tag: "Bestseller",
        subcategories: ["Gourmet & Chocolate", "Spa & Relaxation", "Fresh Fruit Hampers"]
    },
    {
        name: "Personalized Gifts",
        rank: 4,
        tag: "Custom Made",
        subcategories: ["Custom Engraved Keepsakes", "Photo Frames & Mugs", "Monogrammed Gift Boxes"]
    },
    {
        name: "Plants & Succulents",
        rank: 5,
        tag: "Eco Choice",
        subcategories: ["Indoor Air-Purifying Plants", "Desk Succulents", "Orchid Planters"]
    }
];

function generateFloralSVG(title, bgHex) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
        <rect width="400" height="300" fill="${bgHex}"/>
        <circle cx="200" cy="120" r="52" fill="rgba(255,255,255,0.2)"/>
        <text x="50%" y="44%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-size="34">🌸</text>
        <text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="18" font-weight="bold">${title}</text>
        <text x="50%" y="73%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="sans-serif" font-size="12">BlossomGifts Handcrafted</text>
    </svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

const DEFAULT_GIFT_ITEMS = [
    {
        id: "BG-101",
        name: "24 Crimson Velvet Long-Stem Roses",
        category: "Floral Arrangements",
        subcategory: "Romantic Roses",
        recipient: "Partner / Spouse",
        price: 74.99,
        popularity: 99,
        image: generateFloralSVG("24 Crimson Velvet Roses", "#9f1239"),
        description: "Two dozen farm-fresh long-stem crimson roses arranged with baby's breath and eucalyptus in a crystal glass vase."
    },
    {
        id: "BG-102",
        name: "Pastel Peony & Lily Celebration Bouquet",
        category: "Occasion Specials",
        subcategory: "Birthday & Anniversary",
        recipient: "Parents & Family",
        price: 62.00,
        popularity: 96,
        image: generateFloralSVG("Pastel Peony Bouquet", "#be185d"),
        description: "Soft pink peonies, fragrant Oriental lilies, and garden spray roses hand-tied in satin ribbon for milestone birthdays."
    },
    {
        id: "BG-103",
        name: "Artisan Belgian Truffle & Fruit Basket",
        category: "Gift Baskets",
        subcategory: "Gourmet & Chocolate",
        recipient: "Friends & Colleagues",
        price: 89.00,
        popularity: 94,
        image: generateFloralSVG("Belgian Truffle Basket", "#78350f"),
        description: "Woven wicker hamper filled with assorted Belgian dark & milk chocolate truffles, roasted almonds, and orchard fruits."
    },
    {
        id: "BG-104",
        name: "Custom Engraved Rosewood Keepsake Box",
        category: "Personalized Gifts",
        subcategory: "Custom Engraved Keepsakes",
        recipient: "Partner / Spouse",
        price: 54.50,
        popularity: 91,
        image: generateFloralSVG("Engraved Keepsake Box", "#581c87"),
        description: "Hand-finished rosewood memory box custom-engraved with your recipient's name, special date, and personal dedication."
    },
    {
        id: "BG-105",
        name: "White Phalaenopsis Double-Stem Orchid",
        category: "Plants & Succulents",
        subcategory: "Orchid Planters",
        recipient: "Anyone",
        price: 46.00,
        popularity: 88,
        image: generateFloralSVG("White Phalaenopsis Orchid", "#065f46"),
        description: "Elegant blooming white orchid potted in a minimalist matte ceramic planter—easy care and long-lasting beauty."
    },
    {
        id: "BG-106",
        name: "Lavender Botanical Spa & Candle Hamper",
        category: "Gift Baskets",
        subcategory: "Spa & Relaxation",
        recipient: "Parents & Family",
        price: 112.00,
        popularity: 90,
        image: generateFloralSVG("Lavender Spa Hamper", "#6b21a8"),
        description: "Luxury relaxation gift set featuring French lavender soy candle, organic bath salts, shea butter lotion, and herbal tea."
    },
    {
        id: "BG-107",
        name: "Sunshine Gerbera & Daisy Cheer Vase",
        category: "Floral Arrangements",
        subcategory: "Sympathy & Get Well",
        recipient: "Friends & Colleagues",
        price: 44.00,
        popularity: 86,
        image: generateFloralSVG("Sunshine Daisy Vase", "#b45309"),
        description: "Bright yellow gerbera daisies and white chrysanthemums designed to uplift spirits and brighten any room."
    }
];

const SAMPLE_CHECKOUTS = [
    {
        orderId: "BLM-40918",
        customerName: "Ananya Krishnan",
        customerEmail: "ananya@example.com",
        customerPhone: "+91 98401-55210",
        recipientName: "Meera Krishnan",
        deliveryAddress: "14 Boat Club Road, Chennai, TN 600028",
        deliveryDate: "2026-11-20",
        deliveryTime: "Morning (9:00 AM – 12:00 PM)",
        alertChannel: "Email & SMS",
        paymentMethod: "UPI / Digital Wallet",
        status: "Out for Delivery",
        items: [
            { name: "Pastel Peony & Lily Celebration Bouquet", qty: 1, price: 62.00, customNote: "Happy Birthday Mom!" }
        ],
        total: 62.00
    }
];
