const mongoose = require('mongoose');
const User = require('./models/User');
const { formatName } = require('./utils/nameFormatter');
require('dotenv').config();

async function formatAllStaffNames() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');

    // Find all staff members
    const staff = await User.find({ role: 'staff' });
    console.log(`Found ${staff.length} staff members to format`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const member of staff) {
      const originalName = member.name;
      const formattedName = formatName(originalName);

      // Only update if the name changed
      if (originalName !== formattedName) {
        member.name = formattedName;
        await member.save();
        console.log(`✓ Updated: "${originalName}" → "${formattedName}"`);
        updatedCount++;
      } else {
        console.log(`- Skipped: "${originalName}" (already formatted)`);
        skippedCount++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`Updated: ${updatedCount} staff members`);
    console.log(`Skipped: ${skippedCount} staff members (already formatted)`);

    await mongoose.connection.close();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error during migration:', err);
    process.exit(1);
  }
}

formatAllStaffNames();
