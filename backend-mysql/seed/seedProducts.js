/**
 * Seed script — creates sample categories and products.
 * Run: node seed/seedProducts.js
 * NOTE: Run seedUsers.js first.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const sequelize = require("../config/db");
require("../models"); // register associations

const {
  Category,
  Product,
  ProductImage,
  ProductVariant,
} = require("../models");

const PLACEHOLDER = "/uploads/products/placeholder.jpg";

const categoryDefs = [
  { name: "Electronics", description: "Gadgets and electronic devices" },
  { name: "Clothing", description: "Fashion and apparel" },
  { name: "Home & Kitchen", description: "Home décor and kitchen essentials" },
  { name: "Books", description: "Fiction, non-fiction, and educational books" },
  { name: "Sports", description: "Sports equipment and accessories" },
];

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    // Clear existing data (order matters due to FK constraints)
    await ProductVariant.destroy({ where: {}, truncate: true });
    await ProductImage.destroy({ where: {}, truncate: true });
    await Product.destroy({ where: {}, truncate: true });
    await Category.destroy({ where: {}, truncate: true });

    const cats = await Category.bulkCreate(categoryDefs, {
      individualHooks: true,
    });
    console.log(`Seeded ${cats.length} categories`);

    const byName = (name) => cats.find((c) => c.name === name).id;

    const productDefs = [
      {
        name: "Wireless Bluetooth Headphones",
        description:
          "Premium noise-cancelling wireless headphones with 30-hour battery life and foldable design.",
        shortDescription: "ANC wireless headphones, 30 hr battery",
        price: 2999,
        comparePrice: 3999,
        categoryId: byName("Electronics"),
        stock: 50,
        brand: "SoundMax",
        tags: ["headphones", "wireless", "audio", "bluetooth"],
        isFeatured: true,
      },
      {
        name: "Adjustable Smartphone Stand",
        description:
          'Aluminum desktop phone stand, height-adjustable, compatible with all devices up to 7".',
        price: 499,
        comparePrice: 699,
        categoryId: byName("Electronics"),
        stock: 200,
        brand: "DeskPro",
        tags: ["stand", "phone", "accessories", "desk"],
      },
      {
        name: "Men's Classic Cotton T-Shirt",
        description:
          "100% ringspun cotton, regular-fit crew neck. Available in S–XL.",
        price: 399,
        comparePrice: 599,
        categoryId: byName("Clothing"),
        stock: 150,
        brand: "BasicWear",
        tags: ["tshirt", "men", "cotton", "casual"],
        isFeatured: true,
      },
      {
        name: "Vacuum Insulated Water Bottle 1L",
        description:
          "Stainless steel double-wall vacuum bottle. Keeps drinks cold 24 hr / hot 12 hr.",
        price: 899,
        comparePrice: 1200,
        categoryId: byName("Home & Kitchen"),
        stock: 80,
        brand: "HydroPure",
        tags: ["bottle", "water", "stainless", "eco", "insulated"],
        isFeatured: true,
      },
      {
        name: "Granite-Coated Non-Stick Frying Pan 28 cm",
        description:
          "Premium granite-coated non-stick pan. PFOA-free. Compatible with all cooktops including induction.",
        price: 1499,
        comparePrice: 2000,
        categoryId: byName("Home & Kitchen"),
        stock: 60,
        brand: "ChefMate",
        tags: ["pan", "kitchen", "cookware", "non-stick"],
      },
      {
        name: "Yoga Mat – 6mm Anti-Slip",
        description:
          "Eco-friendly TPE yoga mat, 183 × 61 cm, 6 mm thick. Non-slip surface, carry strap included.",
        price: 799,
        comparePrice: 1100,
        categoryId: byName("Sports"),
        stock: 120,
        brand: "FlexFit",
        tags: ["yoga", "mat", "fitness", "sports", "exercise"],
        isFeatured: true,
      },
      {
        name: "Clean Code – Robert C. Martin",
        description:
          "A handbook of agile software craftsmanship. Essential reading for every developer.",
        price: 549,
        comparePrice: 699,
        categoryId: byName("Books"),
        stock: 40,
        brand: "Pearson",
        tags: ["book", "programming", "software", "clean-code"],
      },
    ];

    const products = await Product.bulkCreate(productDefs, {
      individualHooks: true,
    });
    console.log(`Seeded ${products.length} products`);

    // Add placeholder images
    const imageRows = products.map((p) => ({
      productId: p.id,
      url: PLACEHOLDER,
      isMain: true,
    }));
    await ProductImage.bulkCreate(imageRows);

    // Add variants for the T-Shirt
    const tshirt = products.find((p) => p.name.includes("T-Shirt"));
    if (tshirt) {
      await ProductVariant.bulkCreate([
        { productId: tshirt.id, size: "S", color: "White", stock: 30 },
        { productId: tshirt.id, size: "M", color: "White", stock: 50 },
        { productId: tshirt.id, size: "L", color: "White", stock: 40 },
        { productId: tshirt.id, size: "XL", color: "White", stock: 30 },
      ]);
    }

    products.forEach((p) => console.log(`  • ${p.name}  (₹${p.price})`));
    process.exit(0);
  } catch (err) {
    console.error("Product seed failed:", err.message);
    console.error(err);
    process.exit(1);
  }
})();
