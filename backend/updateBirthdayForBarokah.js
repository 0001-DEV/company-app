const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function updateBirthdayForBarokah() {
  try {
    const barokah = await User.findOne({ name: /BAROKAH/i });
    
    if (!barokah) {
      console.log('BAROKAH not found');
      process.exit(1);
    }

    // Set birthday to today (March 13)
    barokah.birthday = new Date(2000, 2, 13); // March 13, 2000
    await barokah.save();

    console.log(`✅ BAROKAH's birthday set to: ${barokah.birthday.toDateString()}`);
    console.log('She should now receive birthday wishes!');
    
    process.exit(0);
  } catch (err) {
    console.error('Error updating birthday:', err);
    process.exit(1);
  }
}

updateBirthdayForBarokah();
