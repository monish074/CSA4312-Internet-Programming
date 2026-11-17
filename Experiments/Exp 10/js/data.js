const CATEGORIES_DATA = [
    { name: "Women", popularityRank: 1, badge: "Most Popular", subcategories: ["Casual Wear", "Formal Attire", "Seasonal Collections"] },
    { name: "Men", popularityRank: 2, badge: "Trending", subcategories: ["Casual Wear", "Formal Attire", "Seasonal Collections"] },
    { name: "Footwear", popularityRank: 3, badge: "Bestseller", subcategories: ["Sneakers & Boots", "Formal Shoes", "Seasonal Sandals"] },
    { name: "Accessories", popularityRank: 4, badge: "Top Rated", subcategories: ["Bags & Watches", "Sunglasses & Belts", "Jewelry"] },
    { name: "Children", popularityRank: 5, badge: "New Season", subcategories: ["Casual Wear", "Seasonal Collections", "School & Formal"] }
];

function createPlaceholderSVG(title, bgColor) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="320" viewBox="0 0 400 320">
        <rect width="400" height="320" fill="${bgColor}"/>
        <circle cx="200" cy="130" r="55" fill="rgba(255,255,255,0.2)"/>
        <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="20" font-weight="bold">${title}</text>
        <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="sans-serif" font-size="13">StyleHub Collection</text>
    </svg>`;
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

const DEFAULT_PRODUCTS = [
    {
        id: "SH-101", name: "Tailored Linen Blend Blazer", category: "Women", subcategory: "Formal Attire",
        price: 119.00, stock: 18, popularity: 98, flashSale: true, rating: 4.9, sizes: ["XS", "S", "M", "L", "XL"],
        image: createPlaceholderSVG("Women's Linen Blazer", "#7c2d12"),
        description: "Breathable tailored linen-blend blazer with structured shoulders, satin lining, and minimalist horn buttons. Ideal for office elegance or smart-casual evenings.",
        reviews: [{ user: "Sophia M.", rating: 5, comment: "Impeccable fit and super lightweight fabric!" }, { user: "Elena R.", rating: 5, comment: "Pairs effortlessly with trousers and denim." }]
    },
    {
        id: "SH-102", name: "Silk-Touch Wrap Midi Dress", category: "Women", subcategory: "Seasonal Collections",
        price: 89.50, stock: 24, popularity: 95, flashSale: false, rating: 4.8, sizes: ["XS", "S", "M", "L"],
        image: createPlaceholderSVG("Wrap Midi Dress", "#9d174d"),
        description: "Flowing seasonal wrap midi dress crafted from eco-friendly modal satin with adjustable waist tie and flutter sleeves.",
        reviews: [{ user: "Chloe K.", rating: 5, comment: "Gorgeous drape and flattering silhouette." }]
    },
    {
        id: "SH-103", name: "Slim-Fit Oxford Button-Down", category: "Men", subcategory: "Casual Wear",
        price: 54.00, stock: 35, popularity: 94, flashSale: true, rating: 4.7, sizes: ["S", "M", "L", "XL", "XXL"],
        image: createPlaceholderSVG("Men's Oxford Shirt", "#1e3a8a"),
        description: "100% organic combed cotton Oxford shirt featuring a button-down collar, tailored chest pocket, and pre-washed softness.",
        reviews: [{ user: "Liam T.", rating: 5, comment: "My go-to shirt for both work and weekends." }]
    },
    {
        id: "SH-104", name: "Merino Wool Structured Suit", category: "Men", subcategory: "Formal Attire",
        price: 245.00, stock: 9, popularity: 91, flashSale: false, rating: 4.9, sizes: ["38R", "40R", "42R", "44L"],
        image: createPlaceholderSVG("Merino Formal Suit", "#111827"),
        description: "Two-piece Italian-milled Merino wool suit with notch lapels, double-vented jacket, and tailored flat-front trousers.",
        reviews: [{ user: "Marcus V.", rating: 5, comment: "Tailoring feels custom-made right out of the box." }]
    },
    {
        id: "SH-105", name: "Urban Court Leather Sneakers", category: "Footwear", subcategory: "Sneakers & Boots",
        price: 98.00, stock: 22, popularity: 93, flashSale: true, rating: 4.8, sizes: ["7", "8", "9", "10", "11", "12"],
        image: createPlaceholderSVG("Court Leather Sneakers", "#374151"),
        description: "Full-grain minimalist leather sneakers with memory-foam cushioned insoles and high-traction rubber cupsoles.",
        reviews: [{ user: "Noah B.", rating: 5, comment: "Zero break-in time, comfortable all day." }]
    },
    {
        id: "SH-106", name: "Chronograph Minimalist Watch", category: "Accessories", subcategory: "Bags & Watches",
        price: 145.00, stock: 14, popularity: 89, flashSale: false, rating: 4.7, sizes: ["One Size"],
        image: createPlaceholderSVG("Chronograph Watch", "#065f46"),
        description: "Brushed stainless steel 40mm case with sapphire-coated mineral crystal, Japanese quartz movement, and interchangeable Italian leather strap.",
        reviews: [{ user: "Daniel S.", rating: 5, comment: "Sleek dial and substantial build quality." }]
    },
    {
        id: "SH-107", name: "Kids Organic Fleece Hoodie Set", category: "Children", subcategory: "Casual Wear",
        price: 42.00, stock: 30, popularity: 87, flashSale: true, rating: 4.9, sizes: ["4Y", "6Y", "8Y", "10Y", "12Y"],
        image: createPlaceholderSVG("Kids Fleece Set", "#b45309"),
        description: "Ultra-soft brushed organic cotton hoodie and jogger set designed for active comfort and easy machine washing.",
        reviews: [{ user: "Hannah P.", rating: 5, comment: "Super cozy and holds up great after washing!" }]
    },
    {
        id: "SH-108", name: "Structured Vegan Leather Tote", category: "Accessories", subcategory: "Bags & Watches",
        price: 79.00, stock: 0, popularity: 85, flashSale: false, rating: 4.6, sizes: ["One Size"],
        image: createPlaceholderSVG("Structured Tote Bag", "#581c87"),
        description: "Spacious everyday tote with padded 15-inch laptop sleeve, interior zip organizer, and gold-tone hardware.",
        reviews: [{ user: "Grace L.", rating: 4, comment: "Fits everything I need for work and travel." }]
    }
];

const SAMPLE_ORDERS = [
    {
        orderId: "ORD-88412", customerName: "Jane Doe", customerEmail: "user@stylehub.com", customerPhone: "+1 (555) 234-5678",
        shippingAddress: "742 Evergreen Terrace, New York, NY 10001", paymentMethod: "Credit / Debit Card",
        date: "2026-11-12", status: "Shipped",
        items: [{ id: "SH-101", name: "Tailored Linen Blend Blazer", size: "M", qty: 1, price: 119.00 }],
        total: 119.00
    }
];
