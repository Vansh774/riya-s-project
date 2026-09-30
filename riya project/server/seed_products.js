// Seed 15 sample products for freshfarmer@freshfield.test (farmer_id = 9)
const mysql = require('mysql2/promise');

const FARMER_ID = 9;

const products = [
    {
        name: 'Organic Basmati Rice',
        category: 'Grains',
        description: 'Premium long-grain basmati rice grown without pesticides. Aromatic and fluffy when cooked. Harvested from our fertile fields in Gujarat.',
        price: 85.00,
        quantity: 500,
        unit: 'kg',
        image_url: null,
        is_available: true
    },
    {
        name: 'Fresh Bitter Gourd (Karela)',
        category: 'Vegetables',
        description: 'Freshly harvested bitter gourd, rich in antioxidants and vitamins. Ideal for traditional Indian recipes and health juices.',
        price: 35.00,
        quantity: 80,
        unit: 'kg',
        image_url: null,
        is_available: true
    },
    {
        name: 'Farm Fresh Turmeric (Haldi)',
        category: 'Spices',
        description: 'Sun-dried raw turmeric fingers from our organic farm. High curcumin content, deep golden color, intensely aromatic.',
        price: 120.00,
        quantity: 150,
        unit: 'kg',
        image_url: null,
        is_available: true
    },
    {
        name: 'Fresh Green Coriander (Dhania)',
        category: 'Herbs',
        description: 'Lush, vibrant coriander bunches freshly cut from the garden. Excellent fragrance, perfect for garnishing curries and chutneys.',
        price: 20.00,
        quantity: 60,
        unit: 'bunch',
        image_url: null,
        is_available: true
    },
    {
        name: 'Desi Cow Ghee',
        category: 'Dairy',
        description: 'Pure A2 ghee hand-churned from our Gir cows. Golden, aromatic, with a rich buttery taste. No additives or preservatives.',
        price: 650.00,
        quantity: 40,
        unit: 'litre',
        image_url: null,
        is_available: true
    },
    {
        name: 'Sweet Coconuts (Nariyal)',
        category: 'Fruits',
        description: 'Tender green coconuts with sweet water and soft malai. Handpicked at the peak of ripeness from our coastal farm.',
        price: 45.00,
        quantity: 200,
        unit: 'piece',
        image_url: null,
        is_available: true
    },
    {
        name: 'Organic Moong Dal (Split)',
        category: 'Pulses',
        description: 'Organically grown split moong lentils. Protein-rich, quick-cooking, and perfect for dal, khichdi, or soups.',
        price: 110.00,
        quantity: 300,
        unit: 'kg',
        image_url: null,
        is_available: true
    },
    {
        name: 'Fresh Bottle Gourd (Lauki)',
        category: 'Vegetables',
        description: 'Tender bottle gourd freshly picked from the vine. Light, nutritious, and easy to digest. Perfect for sabzi, juice, and koftas.',
        price: 25.00,
        quantity: 100,
        unit: 'kg',
        image_url: null,
        is_available: true
    },
    {
        name: 'Alphonso Mangoes (Hapus)',
        category: 'Fruits',
        description: 'The King of Mangoes! Naturally ripened Alphonso mangoes with rich pulp, sweet flavor, and no fiber. Seasonal delight from our orchard.',
        price: 320.00,
        quantity: 50,
        unit: 'dozen',
        image_url: null,
        is_available: true
    },
    {
        name: 'Fresh Fenugreek Leaves (Methi)',
        category: 'Leafy Greens',
        description: 'Freshly harvested methi (fenugreek) leaves packed with iron and vitamins. Perfect for methi paratha, thepla, or sabzi.',
        price: 18.00,
        quantity: 75,
        unit: 'bunch',
        image_url: null,
        is_available: true
    },
    {
        name: 'Organic Groundnuts (Mungfali)',
        category: 'Nuts & Seeds',
        description: 'Sun-dried raw groundnuts from our fields. No chemicals, perfect for roasting, chutney, or making homemade peanut butter.',
        price: 90.00,
        quantity: 200,
        unit: 'kg',
        image_url: null,
        is_available: true
    },
    {
        name: 'Farm Fresh Okra (Bhindi)',
        category: 'Vegetables',
        description: 'Tender, crisp bhindi freshly harvested in the morning. Vibrant green color, no blemishes, ideal for dry sabzi or curry.',
        price: 40.00,
        quantity: 90,
        unit: 'kg',
        image_url: null,
        is_available: true
    },
    {
        name: 'Raw Sugarcane Jaggery (Gur)',
        category: 'Natural Sweeteners',
        description: 'Handcrafted jaggery made from freshly pressed sugarcane. No chemical processing — natural minerals and molasses retained.',
        price: 75.00,
        quantity: 100,
        unit: 'kg',
        image_url: null,
        is_available: true
    },
    {
        name: 'Fresh Drumstick (Moringa / Saragva)',
        category: 'Vegetables',
        description: 'Tender moringa pods packed with vitamins and minerals. Freshly harvested, great for sambar, curry, or stir-fry.',
        price: 50.00,
        quantity: 70,
        unit: 'kg',
        image_url: null,
        is_available: true
    },
    {
        name: 'Cold-Pressed Groundnut Oil',
        category: 'Oils',
        description: 'Traditional wooden-pressed (kacchi ghani) groundnut oil. Unrefined, chemical-free, rich flavor ideal for Indian cooking.',
        price: 220.00,
        quantity: 80,
        unit: 'litre',
        image_url: null,
        is_available: true
    }
];

async function seed() {
    const db = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'farmer_marketplace'
    });

    console.log(`\nSeeding ${products.length} products for farmer_id=${FARMER_ID}...\n`);

    let inserted = 0;
    for (const p of products) {
        const [result] = await db.execute(
            `INSERT INTO products (farmer_id, name, category, description, price, quantity, unit, image_url, is_available)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [FARMER_ID, p.name, p.category, p.description, p.price, p.quantity, p.unit, p.image_url, p.is_available]
        );
        console.log(`  ✓ [${result.insertId}] ${p.name} — ₹${p.price}/${p.unit} (${p.category})`);
        inserted++;
    }

    console.log(`\n✅ Done! ${inserted} products added.\n`);

    // Verify total
    const [rows] = await db.execute('SELECT COUNT(*) as total FROM products WHERE farmer_id = ?', [FARMER_ID]);
    console.log(`Total products for farmer_id=${FARMER_ID}: ${rows[0].total}`);

    await db.end();
}

seed().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
});
