<<<<<<< HEAD
 const mongoose = require('mongoose');
const User = require('./models/User'); // make sure this path is correct

async function resetAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/companyDB');

    // Delete any old admin
    const del = await User.deleteMany({ role: 'admin' });
    console.log('Deleted old admins:', del.deletedCount);

    // Create a fresh admin
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('123456', 10);

    const newAdmin = new User({
      name: 'Admin Test',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();
    console.log('New admin created:', newAdmin.email);

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
}

resetAdmin();
=======
 const mongoose = require('mongoose');
const User = require('./models/User'); // make sure this path is correct

async function resetAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/companyDB');

    // Delete any old admin
    const del = await User.deleteMany({ role: 'admin' });
    console.log('Deleted old admins:', del.deletedCount);

    // Create a fresh admin
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('123456', 10);

    const newAdmin = new User({
      name: 'Admin Test',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();
    console.log('New admin created:', newAdmin.email);

    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
}

resetAdmin();
>>>>>>> 500de3921b8b68c26e46441c078fdc0e74f56b00
