import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function CreateIP() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [owner, setOwner] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.from('ips').insert([{ title, description, owner }])

    setLoading(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
      return
    }
    setMessage({ type: 'success', text: 'IP created successfully.' })
    setTitle('')
    setDescription('')
    setOwner('')
  }

  return (
    <div style={{padding:40,fontFamily:'sans-serif',maxWidth:700}}>
      <h1>Create IP</h1>
      <p>
        <Link href="/">Home</Link> | <Link href="/dashboard">Dashboard</Link>
      </p>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:12}}>
          <label>Title</label><br />
          <input value={title} onChange={e=>setTitle(e.target.value)} required style={{width:'100%'}} />
        </div>
        <div style={{marginBottom:12}}>
          <label>Description</label><br />
          <textarea value={description} onChange={e=>setDescription(e.target.value)} required style={{width:'100%',minHeight:120}} />
        </div>
        <div style={{marginBottom:12}}>
          <label>Owner</label><br />
          <input value={owner} onChange={e=>setOwner(e.target.value)} required style={{width:'100%'}} />
        </div>
        <div>
          <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create IP'}</button>
        </div>
      </form>
      {message && (
        <div style={{marginTop:12,color: message.type === 'error' ? 'red' : 'green'}}>
          {message.text}
        </div>
      )}
    </div>
  )
}
