/**
 * reset-admin-password.js
 * Forcefully resets admin@tms.com password to Admin@1234
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function resetPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const newPassword = 'Admin@1234';
    const hashed = await bcrypt.hash(newPassword, 10);

    const [rows] = await sequelize.query(
      `UPDATE users SET password = :password, must_reset_password = false WHERE email = 'admin@tms.com'`,
      { replacements: { password: hashed } }
    );

    const user = await User.findOne({ where: { email: 'admin@tms.com' } });
    if (!user) {
      console.log('❌ admin@tms.com not found in database!');
      process.exit(1);
    }

    console.log('\n✅ Password reset successfully!');
    console.log('─────────────────────────────────');
    console.log('  Email   : admin@tms.com');
    console.log('  Password: Admin@1234');
    console.log('  Role    :', user.role);
    console.log('  Active  :', user.is_active);
    console.log('  MustReset:', user.must_reset_password);
    console.log('─────────────────────────────────');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetPassword();
