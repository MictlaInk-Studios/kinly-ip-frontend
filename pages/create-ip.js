import { useState, useEffect } from 'react'
import Link from 'next/link'
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
      router.push('/auth')
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
    setMessage({ type: 'success', text: 'IP created successfully.' })
    setTitle('')
    setDescription('')
    setOwner('')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (authLoading) return <p style={{padding:40}}>Loading...</p>
  if (!user) return null

  return (
    <div style={{padding:40,fontFamily:'sans-serif',maxWidth:700}}>
      <h1>Create IP</h1>
      <p style={{fontSize:'0.9em',color:'#666'}}>Logged in as: {user.email}</p>
      <p>
        <Link href="/">Home</Link> | <Link href="/dashboard">Dashboard</Link> | 
        <button 
          onClick={handleLogout}
          style={{background:'none',border:'none',color:'blue',cursor:'pointer',textDecoration:'underline',marginLeft:4}}
        >
          Logout
        </button>
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
