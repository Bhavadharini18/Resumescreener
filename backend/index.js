const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const candidatesRouter = require('./routes/candidates');
const jobsRouter = require('./routes/jobs');
const applicationsRouter = require('./routes/applications');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resume-shortlister';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/candidates', candidatesRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/applications', applicationsRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
