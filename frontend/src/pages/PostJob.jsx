import React, { useState } from 'react'

export default function PostJob(){
  const [title,setTitle]=useState('')
  const [company,setCompany]=useState('')
  const [description,setDescription]=useState('')
  const [skills,setSkills]=useState('')
  const [msg,setMsg]=useState('')

  const submit=async e=>{
    e.preventDefault()
    try{
      const res = await fetch('http://localhost:5000/api/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,company,description,requiredSkills:skills})})
      if(!res.ok) throw new Error('Failed')
      setMsg('Job posted')
      setTitle(''); setCompany(''); setDescription(''); setSkills('')
    }catch(err){ setMsg('Error posting job') }
  }

  return (
    <div className="card">
      <h2>Post a Job</h2>
      <form onSubmit={submit}>
        <label>Title</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} required />
        <label>Company</label>
        <input value={company} onChange={e=>setCompany(e.target.value)} />
        <label>Description</label>
        <textarea value={description} onChange={e=>setDescription(e.target.value)} />
        <label>Required skills (comma-separated)</label>
        <input value={skills} onChange={e=>setSkills(e.target.value)} />
        <button type="submit">Post Job</button>
      </form>
      <div>{msg}</div>
    </div>
  )
}
