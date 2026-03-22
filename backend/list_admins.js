const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = "mongodb://localhost:27017/companyDB";

async function listAdmins() {
  try {
    await mongoose.connect(MONGO_URI);
    const admins = await User.find({ role: 'admin' });
    admins.forEach(a => {
        console.log(`EMAIL_START:${a.email}:EMAIL_END`);
    });
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listAdmins();
