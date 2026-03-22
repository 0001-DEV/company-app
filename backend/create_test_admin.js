const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = "mongodb://localhost:27017/companyDB";

async function createTestAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    
    const email = "testadmin@test.com";
    const password = "password123";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findOneAndDelete({ email });

    const admin = new User({
      name: "Test Admin",
      email: email,
      password: hashedPassword,
      role: "admin"
    });

    await admin.save();
    console.log("Test Admin created: " + email + " / " + password);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createTestAdmin();
