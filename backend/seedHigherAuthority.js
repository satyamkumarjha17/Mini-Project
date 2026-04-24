require('dotenv').config({ path: './.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const departments = [
  { email: 'headdemo.dsw@cumail.in', dept: 'DSW', name: 'DSW Higher Authority Demo', uid: 'HEAD_DSW001' },
  { email: 'headdemo.dcpd@cumail.in', dept: 'DCPD', name: 'DCPD Higher Authority Demo', uid: 'HEAD_DCPD001' },
  { email: 'headdemo.fee@cumail.in', dept: 'Fee Department', name: 'Fee Higher Authority Demo', uid: 'HEAD_FEE001' },
  { email: 'headdemo.academics@cumail.in', dept: 'Academics', name: 'Academics Higher Authority Demo', uid: 'HEAD_ACAD001' },
  { email: 'headdemo.hod@cumail.in', dept: 'HOD', name: 'HOD Higher Authority Demo', uid: 'HEAD_HOD001' },
  { email: 'headdemo.egovernance@cumail.in', dept: 'E-Governance', name: 'E-Gov Higher Authority Demo', uid: 'HEAD_EGOV001' },
  { email: 'headdemo.security@cumail.in', dept: 'Security', name: 'Security Higher Authority Demo', uid: 'HEAD_SEC001' },
  { email: 'headdemo.food@cumail.in', dept: 'Food', name: 'Food Higher Authority Demo', uid: 'HEAD_FOOD001' },
  { email: 'headdemo.hostel@cumail.in', dept: 'Hostel', name: 'Hostel Higher Authority Demo', uid: 'HEAD_HSTL001' },
  { email: 'headdemo.teacher@cumail.in', dept: 'Teacher', name: 'Teacher Higher Authority Demo', uid: 'HEAD_TCH001' },
  { email: 'headdemo.faculty@cumail.in', dept: 'Faculty', name: 'Faculty Higher Authority Demo', uid: 'HEAD_FAC001' },
  { email: 'headdemo.it@cumail.in', dept: 'IT Support', name: 'IT Higher Authority Demo', uid: 'HEAD_IT001' },
  { email: 'headdemo.maintenance@cumail.in', dept: 'Maintenance', name: 'Maintenance Higher Authority Demo', uid: 'HEAD_MAINT001' },
  { email: 'headdemo.library@cumail.in', dept: 'Library', name: 'Library Higher Authority Demo', uid: 'HEAD_LIB001' },
  { email: 'headdemo.sports@cumail.in', dept: 'Sports', name: 'Sports Higher Authority Demo', uid: 'HEAD_SPORT001' },
  { email: 'headdemo.admin@cumail.in', dept: 'Administration', name: 'Admin Higher Authority Demo', uid: 'HEAD_ADMIN001' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
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
            role: 'higher_authority',
            uid: account.uid,
            department: account.dept,
            designation: `${account.dept} Supreme Head`,
            isVerified: true,
          }
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
      );
      console.log(`✅ Seeded higher authority: ${account.email}`);
    }

    console.log('\n🎉 All Higher Authority accounts seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
