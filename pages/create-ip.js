import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'

export default function CreateIP() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [owner, setOwner] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.from('ips').insert([{
      title,
      description,
      owner,
      user_id: user.id
    }])

    setLoading(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
      return
    }
    setMessage({ type: 'success', text: 'IP created successfully!' })
    setTitle('')
    setDescription('')
    setOwner('')
    setTimeout(() => router.push('/dashboard'), 1000)
  }

  if (authLoading) return <p>Loading...</p>
  if (!user) return null

  return (
    <>
      <h1>Create New IP</h1>
      <p className="text-muted">Add a new intellectual property to your portfolio</p>

      <div className="content-card" style={{maxWidth: '600px', marginTop: '30px'}}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input 
              type="text"
              value={title} 
              onChange={e=>setTitle(e.target.value)} 
              required 
              placeholder="e.g. Innovative Algorithm Design"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea 
              value={description} 
              onChange={e=>setDescription(e.target.value)} 
              required 
              placeholder="Describe your IP..."
            />
          </div>

          <div className="form-group">
            <label>Owner *</label>
            <input 
              type="text"
              value={owner} 
              onChange={e=>setOwner(e.target.value)} 
              required 
              placeholder="Your name or company"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{width: '100%'}}>
            {loading ? 'Creating...' : 'Create IP'}
          </button>
        </form>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}
      </div>
    </>
  )
}
