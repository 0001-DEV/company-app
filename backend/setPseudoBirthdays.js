const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function setPseudoBirthdays() {
  try {
    const staff = await User.find({ role: 'staff' });
    
    if (staff.length === 0) {
      console.log('No staff found');
      return;
    }

    // Birthday dates to assign (including today March 13)
    const birthdayDates = [
      new Date(2000, 2, 13),  // March 13 (today)
      new Date(1995, 2, 14),  // March 14 (tomorrow)
      new Date(1998, 2, 15),  // March 15 (2 days)
      new Date(1992, 2, 16),  // March 16 (3 days)
      new Date(1997, 5, 20),  // June 20
      new Date(1994, 8, 5),   // September 5
      new Date(1996, 11, 25), // December 25
      new Date(1993, 0, 15),  // January 15
      new Date(1999, 3, 10),  // April 10
      new Date(1991, 7, 22),  // August 22
    ];

    for (let i = 0; i < staff.length; i++) {
      const birthdayIndex = i % birthdayDates.length;
      staff[i].birthday = birthdayDates[birthdayIndex];
      await staff[i].save();
      console.log(`Set birthday for ${staff[i].name}: ${birthdayDates[birthdayIndex].toDateString()}`);
    }

    console.log('\n✅ Pseudo birthdays set successfully!');
    console.log(`Total staff updated: ${staff.length}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Error setting birthdays:', err);
    process.exit(1);
  }
}

setPseudoBirthdays();
