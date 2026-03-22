const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = "mongodb://localhost:27017/companyDB";

async function cleanup() {
  try {
    await mongoose.connect(MONGO_URI);
    await User.findOneAndDelete({ email: "testadmin@test.com" });
    console.log("Deleted testadmin@test.com");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanup();
