const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String },
  description: { type: String },
  requiredSkills: { type: [String], default: [] },
  minExperienceYears: { type: Number, default: 0 },
  createdBy: { type: String }, // recruiter id or email (future: ObjectId)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);
