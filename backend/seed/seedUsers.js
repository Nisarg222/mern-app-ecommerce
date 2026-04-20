/**
 * Seed script — creates default admin + sample users.
 * Run: node seed/seedUsers.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const connectDB = require('../config/db');
const User      = require('../models/User');

const users = [
  {
    name:     'Admin User',
    email:    'admin@example.com',
    password: 'Admin@123',
    role:     'admin',
  },
  {
    name:     'John Doe',
    email:    'john@example.com',
    password: 'User@123',
    role:     'user',
  },
  {
    name:     'Jane Smith',
    email:    'jane@example.com',
    password: 'User@123',
    role:     'user',
  },
];

(async () => {
  try {
    await connectDB();
    await User.deleteMany({});
    const created = await User.create(users);
    console.log(`✅ Seeded ${created.length} users:`);
    created.forEach((u) => console.log(`   • ${u.email}  (${u.role})`));
    process.exit(0);
  } catch (err) {
    console.error('❌ User seed failed:', err.message);
    process.exit(1);
  }
})();
