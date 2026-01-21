const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const Candidate = require('../models/Candidate');

// Helper: compute simple score between job and candidate
function computeScore(job, candidate) {
  const reqSkills = (job.requiredSkills || []).map(s => s.toLowerCase());
  const candSkills = (candidate.skills || []).map(s => s.toLowerCase());
  let skillMatches = 0;
  reqSkills.forEach(rs => { if (candSkills.includes(rs)) skillMatches += 1; });
  const expBonus = (candidate.experienceYears || 0) >= (job.minExperienceYears || 0) ? 1 : 0;
  return skillMatches + expBonus;
}

// Apply to a job
router.post('/', async (req, res) => {
  try {
    const { jobId, candidateId, coverLetter, resumeText } = req.body;
    if (!jobId || !candidateId) return res.status(400).json({ error: 'jobId and candidateId required' });

    const [job, candidate] = await Promise.all([
      Job.findById(jobId),
      Candidate.findById(candidateId)
    ]);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    const score = computeScore(job, candidate);

    const application = new Application({
      job: job._id,
      candidate: candidate._id,
      coverLetter,
      resumeSnapshot: resumeText || candidate.resumeText || '',
      score
    });

    await application.save();
    res.status(201).json(application);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to apply' });
  }
});

// List applications for a job, sorted by score (desc)
router.get('/job/:jobId', async (req, res) => {
  try {
    const apps = await Application.find({ job: req.params.jobId }).populate('candidate').sort({ score: -1, createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// List applications for a candidate
router.get('/candidate/:candidateId', async (req, res) => {
  try {
    const apps = await Application.find({ candidate: req.params.candidateId }).populate('job').sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

module.exports = router;
