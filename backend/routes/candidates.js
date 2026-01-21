const express = require('express');
const router = express.Router();
const multer = require('multer');
const Candidate = require('../models/Candidate');

// simple memory storage for demo
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, skills, resumeText } = req.body;
      const { experienceYears } = req.body;
    let parsedText = resumeText || '';
    if (req.file && req.file.buffer) parsedText = req.file.buffer.toString('utf8');

    const candidate = new Candidate({
      name,
      email,
      skills: skills ? (Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim())) : [],
        resumeText: parsedText,
        experienceYears: experienceYears ? Number(experienceYears) : 0,
    });

    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save candidate' });
  }
});

router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

router.get('/shortlist', async (req, res) => {
  try {
    const { keywords } = req.query;
    if (!keywords) return res.status(400).json({ error: 'Provide keywords query parameter' });

    const keys = keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
    const candidates = await Candidate.find();

    const scored = candidates.map(c => {
      const hay = ((c.resumeText || '') + ' ' + (c.skills || []).join(' ')).toLowerCase();
      let score = 0;
      keys.forEach(k => { if (hay.includes(k)) score += 1; });
      return { candidate: c, score };
    }).filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);

    res.json(scored);
  } catch (err) {
    res.status(500).json({ error: 'Shortlist failed' });
  }
});

module.exports = router;
