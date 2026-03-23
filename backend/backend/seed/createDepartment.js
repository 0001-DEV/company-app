const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/companyDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Department = mongoose.model('Department', new mongoose.Schema({
  name: String
}));

async function createDepartment() {
  const d = new Department({
    _id: new mongoose.Types.ObjectId("64f1f5b1c4f1234567890abc"),
    name: "Design Department"
  });
  await d.save();
  console.log('Department created!');
  mongoose.disconnect();
}

createDepartment();
