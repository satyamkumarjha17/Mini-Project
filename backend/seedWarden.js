require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const departments = [
  { email: 'it@cumail.in', dept: 'IT Support', name: 'IT Manager', uid: 'IT001' },
  { email: 'maintenance@cumail.in', dept: 'Maintenance', name: 'Head of Maintenance', uid: 'MAINT001' },
  { email: 'library@cumail.in', dept: 'Library', name: 'Chief Librarian', uid: 'LIB001' },
  { email: 'sports@cumail.in', dept: 'Sports', name: 'Sports Director', uid: 'SPORT001' },
  { email: 'admin@cumail.in', dept: 'Administration', name: 'Admin Officer', uid: 'ADMIN001' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const cleaned = await User.deleteMany({ uid: null });
    if (cleaned.deletedCount > 0) console.log(`Cleaned up ${cleaned.deletedCount} null-uid document(s)`);

    const hashedPassword = await bcrypt.hash('Password@123', 10);

    for (const account of departments) {
      await User.findOneAndUpdate(
        { email: account.email },
        {
          $set: {
            name: account.name,
            email: account.email,
            password: hashedPassword,
            type: 'Management',
            role: 'management',
            uid: account.uid,
            department: account.dept,
            designation: `${account.dept} Head`,
            isVerified: true,
          }
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      console.log(`✅ Seeded: ${account.email}`);
    }

    console.log('\n🎉 Warden/additional department accounts seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
