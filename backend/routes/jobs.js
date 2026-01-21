const express = require('express');
const router = express.Router();
const Job = require('../models/Job');

// Create job
router.post('/', async (req, res) => {
  try {
    const { title, company, description, requiredSkills, minExperienceYears, createdBy } = req.body;
    const job = new Job({
      title,
      company,
      description,
      requiredSkills: requiredSkills ? (Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(s => s.trim())) : [],
      minExperienceYears: minExperienceYears || 0,
      createdBy
    });
    await job.save();
    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// List jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get job by id
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

module.exports = router;
