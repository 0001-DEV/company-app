const mongoose = require('mongoose');
const User = require('./models/User');
const WeeklyReport = require('./models/WeeklyReport');
require('dotenv').config();

const addOlalayeReport = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/company-app');
    console.log('Connected to MongoDB');

    // Find Olaleye Bisola - try different name variations
    let olaleye = await User.findOne({ name: /Olaleye.*Bisola/i });
    
    if (!olaleye) {
      olaleye = await User.findOne({ name: /bisola/i });
    }
    
    if (!olaleye) {
      console.log('❌ Olaleye Bisola not found');
      const allUsers = await User.find({ role: 'staff' }).select('name email _id');
      console.log('Available staff:');
      allUsers.forEach(u => console.log(`  - ${u.name} (${u._id})`));
      
      if (allUsers.length === 0) {
        console.log('No staff found in database. Please add staff first.');
      }
      process.exit(1);
    }

    console.log('✅ Found:', olaleye.name, `(${olaleye._id})`);

    // Get current week and year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const weekNumber = Math.floor(diff / oneDay / 7) + 1;
    const year = now.getFullYear();

    console.log(`Creating report for week ${weekNumber}, ${year}`);

    // Check if report already exists
    const existing = await WeeklyReport.findOne({
      userId: olaleye._id,
      weekNumber,
      year
    });

    if (existing) {
      console.log('⚠️  Report already exists for this week');
      process.exit(0);
    }

    // Create weekly report
    const report = new WeeklyReport({
      userId: olaleye._id,
      weekNumber,
      year,
      progress: 'Completed assigned tasks and projects on schedule.',
      plans: 'Continue with ongoing projects and prepare for next phase.',
      problems: 'None at the moment.'
    });

    await report.save();
    console.log('✅ Weekly report created successfully for', olaleye.name);
    console.log('Report ID:', report._id);

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

addOlalayeReport();
