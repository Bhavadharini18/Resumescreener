import React from 'react'
import UploadForm from '../components/UploadForm'
import CandidateJobMatching from './CandidateJobMatching'

export default function CandidateDashboard(){
  return (
    <div>
      <h2>Your Candidate Dashboard</h2>
      <p>Upload your resume and find matching job opportunities.</p>
      
      <CandidateJobMatching />
      
      <hr />
      <section className="dashboard-section">
        <h3>Upload Resume</h3>
        <UploadForm />
      </section>
    </div>
  )
}
