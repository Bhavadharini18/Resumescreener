import React, { useEffect, useState } from 'react'

export default function Jobs(){
  const [jobs, setJobs] = useState([])

  useEffect(()=>{
    fetch('http://localhost:5000/api/jobs').then(r=>r.json()).then(setJobs).catch(()=>setJobs([]))
  },[])

  return (
    <div>
      <h2>Jobs</h2>
      <div className="jobs-grid">
        {jobs.map(j=> (
          <div key={j._id} className="job-card">
            <h3>{j.title}</h3>
            <div className="muted">{j.company}</div>
            <p>{j.description}</p>
            <div className="skills">{(j.requiredSkills||[]).join(', ')}</div>
          </div>
        ))}
        {jobs.length===0 && <div>No jobs yet</div>}
      </div>
    </div>
  )
}
