require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const departments = [
  { email: 'dswdemo@cumail.in', dept: 'DSW', name: 'DSW Head Demo', uid: 'DSW001' },
  { email: 'dcpddemo@cumail.in', dept: 'DCPD', name: 'DCPD Head Demo', uid: 'DCPD001' },
  { email: 'feedemo@cumail.in', dept: 'Fee Department', name: 'Fee Manager Demo', uid: 'FEE001' },
  { email: 'academicsdemo@cumail.in', dept: 'Academics', name: 'Academics Head Demo', uid: 'ACAD001' },
  { email: 'hoddemo@cumail.in', dept: 'HOD', name: 'Head of Dept Demo', uid: 'HOD001' },
  { email: 'egovernancedemo@cumail.in', dept: 'E-Governance', name: 'E-Gov Head Demo', uid: 'EGOV001' },
  { email: 'securitydemo@cumail.in', dept: 'Security', name: 'Security Chief Demo', uid: 'SEC001' },
  { email: 'fooddemo@cumail.in', dept: 'Food', name: 'Food/Mess Head Demo', uid: 'FOOD001' },
  { email: 'hosteldemo@cumail.in', dept: 'Hostel', name: 'Hostel Manager Demo', uid: 'HSTL001' },
  { email: 'teacherdemo@cumail.in', dept: 'Teacher', name: 'Teacher Demo', uid: 'TCH001' },
  { email: 'facultydemo@cumail.in', dept: 'Faculty', name: 'Faculty Demo', uid: 'FAC001' },
  { email: 'itdemo@cumail.in', dept: 'IT Support', name: 'IT Manager Demo', uid: 'IT001' },
  { email: 'maintenancedemo@cumail.in', dept: 'Maintenance', name: 'Maintenance Manager Demo', uid: 'MAINT001' },
  { email: 'librarydemo@cumail.in', dept: 'Library', name: 'Librarian Demo', uid: 'LIB001' },
  { email: 'sportsdemo@cumail.in', dept: 'Sports', name: 'Sports Manager Demo', uid: 'SPORT001' },
  { email: 'admindemo@cumail.in', dept: 'Administration', name: 'Admin Demo', uid: 'ADMIN001' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clean up any null-uid docs from previous broken seeds
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

    console.log('\n🎉 All department accounts seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
