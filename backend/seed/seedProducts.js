/**
 * Seed script — creates sample categories and products.
 * Run: node seed/seedProducts.js
 *
 * NOTE: Run seedUsers.js first if you also want user data.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../config/db');
const Category  = require('../models/Category');
const Product   = require('../models/Product');

const PLACEHOLDER = '/uploads/products/placeholder.jpg';

const categoryDefs = [
  { name: 'Electronics',   description: 'Gadgets and electronic devices' },
  { name: 'Clothing',      description: 'Fashion and apparel' },
  { name: 'Home & Kitchen', description: 'Home décor and kitchen essentials' },
  { name: 'Books',         description: 'Fiction, non-fiction, and educational books' },
  { name: 'Sports',        description: 'Sports equipment and accessories' },
];

(async () => {
  try {
    await connectDB();

    await Category.deleteMany({});
    await Product.deleteMany({});

    const cats = await Category.create(categoryDefs);
    console.log(`✅ Seeded ${cats.length} categories`);

    const byName = (name) => cats.find((c) => c.name === name)._id;

    const products = [
      {
        name:             'Wireless Bluetooth Headphones',
        description:      'Premium noise-cancelling wireless headphones with 30-hour battery life and foldable design.',
        shortDescription: 'ANC wireless headphones, 30 hr battery',
        price:            2999,
        comparePrice:     3999,
        category:         byName('Electronics'),
        stock:            50,
        brand:            'SoundMax',
        tags:             ['headphones', 'wireless', 'audio', 'bluetooth'],
        isFeatured:       true,
        images:           [{ url: PLACEHOLDER, isMain: true }],
      },
      {
        name:        'Adjustable Smartphone Stand',
        description: 'Aluminum desktop phone stand, height-adjustable, compatible with all devices up to 7".',
        price:       499,
        comparePrice: 699,
        category:    byName('Electronics'),
        stock:       200,
        brand:       'DeskPro',
        tags:        ['stand', 'phone', 'accessories', 'desk'],
        images:      [{ url: PLACEHOLDER, isMain: true }],
      },
      {
        name:        "Men's Classic Cotton T-Shirt",
        description: '100 % ringspun cotton, regular-fit crew neck. Available in S–XL.',
        price:       399,
        comparePrice: 599,
        category:    byName('Clothing'),
        stock:       150,
        brand:       'BasicWear',
        tags:        ['tshirt', 'men', 'cotton', 'casual'],
        isFeatured:  true,
        variants: [
          { size: 'S',  color: 'White', stock: 30 },
          { size: 'M',  color: 'White', stock: 50 },
          { size: 'L',  color: 'White', stock: 40 },
          { size: 'XL', color: 'White', stock: 30 },
        ],
        images: [{ url: PLACEHOLDER, isMain: true }],
      },
      {
        name:        'Vacuum Insulated Water Bottle 1L',
        description: 'Stainless steel double-wall vacuum bottle. Keeps drinks cold 24 hr / hot 12 hr.',
        price:       899,
        comparePrice: 1200,
        category:    byName('Home & Kitchen'),
        stock:       80,
        brand:       'HydroPure',
        tags:        ['bottle', 'water', 'stainless', 'eco', 'insulated'],
        isFeatured:  true,
        images:      [{ url: PLACEHOLDER, isMain: true }],
      },
      {
        name:        'Granite-Coated Non-Stick Frying Pan 28 cm',
        description: 'Premium granite-coated non-stick pan. PFOA-free. Compatible with all cooktops including induction.',
        price:       1499,
        comparePrice: 2000,
        category:    byName('Home & Kitchen'),
        stock:       60,
        brand:       'ChefMate',
        tags:        ['pan', 'kitchen', 'cookware', 'non-stick'],
        images:      [{ url: PLACEHOLDER, isMain: true }],
      },
      {
        name:        'Yoga Mat – 6mm Anti-Slip',
        description: 'Eco-friendly TPE yoga mat, 183 × 61 cm, 6 mm thick. Non-slip surface, carry strap included.',
        price:       799,
        comparePrice: 1100,
        category:    byName('Sports'),
        stock:       120,
        brand:       'FlexFit',
        tags:        ['yoga', 'mat', 'fitness', 'sports', 'exercise'],
        isFeatured:  true,
        images:      [{ url: PLACEHOLDER, isMain: true }],
      },
      {
        name:        'Clean Code – Robert C. Martin',
        description: 'A handbook of agile software craftsmanship. Essential reading for every developer.',
        price:       549,
        comparePrice: 699,
        category:    byName('Books'),
        stock:       40,
        brand:       'Pearson',
        tags:        ['book', 'programming', 'software', 'clean-code'],
        images:      [{ url: PLACEHOLDER, isMain: true }],
      },
    ];

    const created = await Product.create(products);
    console.log(`✅ Seeded ${created.length} products:`);
    created.forEach((p) => console.log(`   • ${p.name}  (₹${p.price})`));

    process.exit(0);
  } catch (err) {
    console.error('❌ Product seed failed:', err.message);
    process.exit(1);
  }
})();
