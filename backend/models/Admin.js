<<<<<<< HEAD
const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: "admin"
  }
});

module.exports = mongoose.model("Admin", AdminSchema);
=======
const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: "admin"
  }
});

module.exports = mongoose.model("Admin", AdminSchema);
>>>>>>> 500de3921b8b68c26e46441c078fdc0e74f56b00
