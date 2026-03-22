const mongoose = require('mongoose');
const ClientProject = require('./models/ClientProject');

const MONGO_URI = "mongodb://localhost:27017/companyDB";

async function checkProject() {
  try {
    await mongoose.connect(MONGO_URI);
    const p = await ClientProject.findOne({ companyName: /AHUSG BAKERY/i });
    if (!p) {
        console.log("Project NOT FOUND");
    } else {
        console.log("PROJECT_START");
        console.log(JSON.stringify(p, null, 2));
        console.log("PROJECT_END");
    }
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProject();
