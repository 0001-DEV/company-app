<<<<<<< HEAD
const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema({
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

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },

  assignedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job"
    }
  ]
});

module.exports = mongoose.model("Staff", StaffSchema);
=======
const mongoose = require("mongoose");

const StaffSchema = new mongoose.Schema({
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

  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },

  assignedJobs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job"
    }
  ]
});

module.exports = mongoose.model("Staff", StaffSchema);
>>>>>>> 500de3921b8b68c26e46441c078fdc0e74f56b00
