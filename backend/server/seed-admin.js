/**
 * seed-admin.js
 * Run once to create the first Admin user in the database.
 * Usage: node seed-admin.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const email = 'admin@tms.com';
    const password = 'Admin@1234';
    const hashed = await bcrypt.hash(password, 10);

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        name: 'System Admin',
        email,
        password: hashed,
        role: 'Admin',
        is_active: true,
        must_reset_password: false,  // skip forced reset for this seed user
      },
    });

    if (created) {
      console.log('\n✅ Admin user created!');
    } else {
      console.log('\nℹ️  Admin user already exists.');
    }

    console.log('─────────────────────────────────');
    console.log('  Email   :', email);
    console.log('  Password:', password);
    console.log('  Role    : Admin');
    console.log('─────────────────────────────────');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedAdmin();
