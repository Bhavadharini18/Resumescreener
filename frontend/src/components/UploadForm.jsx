import React, { useState } from 'react'

export default function UploadForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [skills, setSkills] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [message, setMessage] = useState('')

  const submit = async e => {
    e.preventDefault()
    const form = new FormData()
    form.append('name', name)
    form.append('email', email)
    form.append('skills', skills)
    if (resumeFile) form.append('resume', resumeFile)

    try {
      const res = await fetch('http://localhost:5000/api/candidates', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Failed')
      setMessage('Saved')
      setName(''); setEmail(''); setSkills(''); setResumeFile(null)
    } catch (err) {
      setMessage('Error saving')
    }
  }

  return (
    <section>
      <h2>Upload Candidate</h2>
      <form onSubmit={submit}>
        <div>
          <label>Name</label><br />
          <input value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label>Email</label><br />
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Skills (comma-separated)</label><br />
          <input value={skills} onChange={e => setSkills(e.target.value)} />
        </div>
        <div>
          <label>Resume file (plain text)</label><br />
          <input type="file" accept=".txt" onChange={e => setResumeFile(e.target.files[0])} />
        </div>
        <button type="submit">Save</button>
      </form>
      <div>{message}</div>
    </section>
  )
}
