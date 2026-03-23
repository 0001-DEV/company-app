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
