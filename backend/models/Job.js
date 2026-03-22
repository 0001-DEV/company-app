const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: String,
department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },


  assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, default: 'pending' },
  files: [
  {
    path: String,
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }
],

comments: [
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    date: { type: Date, default: Date.now }
  }
],

progress: [
  {
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String,
    date: { type: Date, default: Date.now }
  }
]

});

module.exports = mongoose.model('Job', jobSchema);
