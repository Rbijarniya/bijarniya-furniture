require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const connectDB = require('../db');

async function seedAdmin() {
  // Read credentials strictly from environment variables or CLI args only.
  // No hardcoded defaults — all must be explicitly provided.
  const username = process.env.ADMIN_USERNAME || process.argv[2];
  const email    = process.env.ADMIN_EMAIL    || process.argv[3];
  const phone    = process.env.ADMIN_PHONE    || process.argv[4];
  const rawPassword = process.env.ADMIN_PASSWORD || process.argv[5];

  const missing = [];
  if (!username) missing.push('ADMIN_USERNAME');
  if (!email)    missing.push('ADMIN_EMAIL');
  if (!phone)    missing.push('ADMIN_PHONE');
  if (!rawPassword) missing.push('ADMIN_PASSWORD');

  if (missing.length > 0) {
    console.error('\n❌ Cannot create admin account. Missing required credentials:');
    missing.forEach(k => console.error(`   - ${k}`));
    console.error('\nSet these in your .env file or pass them as CLI arguments:');
    console.error('  node server/scripts/seedAdmin.js <username> <email> <phone> <password>');
    console.error('\nOr add to .env:');
    missing.forEach(k => console.error(`  ${k}=your_value_here`));
    process.exit(1);
  }

  console.log(`\n======================================================`);
  console.log(`  BIJARNIYA FURNITURE — ADMIN ACCOUNT SETUP`);
  console.log(`======================================================`);
  console.log(`Creating / Updating Admin User:`);
  console.log(`  Username: ${username}`);
  console.log(`  Email:    ${email}`);
  console.log(`  Phone:    ${phone}`);
  console.log(`  Password: ${'*'.repeat(rawPassword.length)}`);
  console.log(`======================================================\n`);

  await connectDB();

  try {
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    let admin = await Admin.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
        { phone },
      ],
    });

    if (admin) {
      admin.username = username.toLowerCase();
      admin.email    = email.toLowerCase();
      admin.phone    = phone;
      admin.password = hashedPassword;
      await admin.save();
      console.log(`✅ Admin account updated successfully!`);
    } else {
      admin = new Admin({
        username: username.toLowerCase(),
        email:    email.toLowerCase(),
        phone,
        password: hashedPassword,
      });
      await admin.save();
      console.log(`✅ Admin account created successfully!`);
    }

    console.log(`\n🔑 You can now log in at /admin/login using:`);
    console.log(`   Username / Email / Phone  +  the password you provided\n`);
  } catch (error) {
    console.error(`❌ Admin seeding error:`, error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log(`Disconnected from MongoDB.`);
  }
}

seedAdmin();
