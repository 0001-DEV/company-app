const mongoose = require('mongoose');
const User = require('./backend/models/User');

const MONGO_URI = "mongodb://localhost:27017/companyDB";

async function listAdmins() {
  try {
    await mongoose.connect(MONGO_URI);
    const admins = await User.find({ role: 'admin' });
    console.log("Admins found:", admins.map(a => ({ name: a.name, email: a.email, role: a.role })));
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

listAdmins();
