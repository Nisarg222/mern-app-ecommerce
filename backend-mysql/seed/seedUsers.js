/**
 * Seed script — creates default admin + sample users.
 * Run: node seed/seedUsers.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const sequelize = require("../config/db");
require("../models"); // register associations

const { User } = require("../models");

const users = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "Admin@123",
    role: "admin",
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "User@123",
    role: "user",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    password: "User@123",
    role: "user",
  },
];

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    await User.destroy({ where: {}, truncate: true, cascade: true });

    const created = await User.bulkCreate(users, { individualHooks: true }); // hooks hash passwords
    console.log(`Seeded ${created.length} users:`);
    created.forEach((u) => console.log(`  • ${u.email}  (${u.role})`));

    process.exit(0);
  } catch (err) {
    console.error("User seed failed:", err.message);
    process.exit(1);
  }
})();
