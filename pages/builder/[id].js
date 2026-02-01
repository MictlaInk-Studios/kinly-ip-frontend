import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/authContext'

export default function IPBuilder() {
  const router = useRouter()
  const { id } = router.query
  const { user, loading: authLoading } = useAuth()
  const [ip, setIp] = useState(null)
  const [worlds, setWorlds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [creatingWorld, setCreatingWorld] = useState(false)
  const [worldName, setWorldName] = useState('')
  const [selectedWorld, setSelectedWorld] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '', owner: '' })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (id && user) {
      fetchIP()
      fetchWorlds()
    }
  }, [id, user, authLoading])

  const fetchIP = async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('ips')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setIp(data)
    setFormData({
      title: data.title,
      description: data.description,
      owner: data.owner
    })
  }

  const fetchWorlds = async () => {
    const { data, error: err } = await supabase
      .from('worlds')
      .select('*')
      .eq('ip_id', id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!err) {
      setWorlds(data || [])
      if (data && data.length > 0) {
        setSelectedWorld(data[0])
      }
    }
  }

  const handleSaveIP = async () => {
    const { error: err } = await supabase
      .from('ips')
      .update(formData)
      .eq('id', id)

    if (err) {
      alert('Error: ' + err.message)
      return
    }
    setIp({ ...ip, ...formData })
    setEditing(false)
    alert('IP updated successfully!')
  }

  const handleCreateWorld = async () => {
    if (!worldName.trim()) {
      alert('Please enter a world name')
      return
    }

    const { data, error: err } = await supabase
      .from('worlds')
      .insert([{
        name: worldName,
        ip_id: id,
        user_id: user.id
      }])
      .select()

    if (err) {
      alert('Error: ' + err.message)
      return
    }

    const newWorld = data[0]
    setWorlds([newWorld, ...worlds])
    setSelectedWorld(newWorld)
    setWorldName('')
    setCreatingWorld(false)
  }

  if (authLoading) return <p>Loading...</p>
  if (!user) return null
  if (loading) return <p>Loading IP...</p>
  if (error) return <p className="message message-error">Error: {error}</p>
  if (!ip) return <p>IP not found</p>

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>{ip.title}</h1>
          <p className="text-muted">IP Builder & World Creator</p>
        </div>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <button className="btn-secondary">← Back to Dashboard</button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* IP Details Card */}
        <div className="content-card">
          <h2>IP Details</h2>
          {!editing ? (
            <>
              <div style={{ marginBottom: '12px' }}>
                <p className="text-muted">Title</p>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>{ip.title}</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <p className="text-muted">Owner</p>
                <p style={{ fontSize: '16px' }}>{ip.owner}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <p className="text-muted">Description</p>
                <p>{ip.description}</p>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <p className="text-muted">Created</p>
                <p>{new Date(ip.created_at).toLocaleDateString()}</p>
              </div>
              <button className="btn-primary" onClick={() => setEditing(true)}>
                Edit IP
              </button>
            </>
          ) : (
            <>
              <form onSubmit={e => { e.preventDefault(); handleSaveIP() }}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Owner</label>
                  <input
                    type="text"
                    value={formData.owner}
                    onChange={e => setFormData({ ...formData, owner: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn-primary">Save</button>
                  <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* World Builder Card */}
        <div className="content-card">
          <h2>🌍 World Builder</h2>
          {worlds.length === 0 && !creatingWorld ? (
            <>
              <p className="text-muted">Create and manage worlds for this IP</p>
              <div style={{ marginTop: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '6px', textAlign: 'center' }}>
                <p style={{ marginBottom: '12px' }}>No worlds created yet</p>
                <button className="btn-primary" style={{ width: '100%' }} onClick={() => setCreatingWorld(true)}>
                  + Create World
                </button>
              </div>
            </>
          ) : creatingWorld ? (
            <>
              <p className="text-muted">Create a new world</p>
              <div style={{ marginTop: '20px' }}>
                <div className="form-group">
                  <label>World Name</label>
                  <input
                    type="text"
                    value={worldName}
                    onChange={e => setWorldName(e.target.value)}
                    placeholder="e.g. Earth, Middle-earth, Asgard"
                    autoFocus
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={handleCreateWorld} style={{ flex: 1 }}>
                    Create
                  </button>
                  <button className="btn-secondary" onClick={() => setCreatingWorld(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: '16px' }}>
                <p className="text-muted">Active World</p>
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>{selectedWorld?.name}</p>
                <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setCreatingWorld(true)}>
                  + Create Another World
                </button>
              </div>
              {worlds.length > 1 && (
                <div>
                  <p className="text-muted" style={{ fontSize: '12px', marginBottom: '8px' }}>Other worlds:</p>
                  {worlds.map(world => (
                    <button
                      key={world.id}
                      className="btn-secondary"
                      onClick={() => setSelectedWorld(world)}
                      style={{ width: '100%', marginBottom: '6px', textAlign: 'left' }}
                    >
                      {world.name}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content Sections - Only show if world is selected */}
      {selectedWorld && (
        <div className="content-card">
          <h2>📝 Content Sections — {selectedWorld.name}</h2>
          <p className="text-muted">Organize and manage content for this world</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '20px' }}>
            {['Characters', 'Locations', 'Plot', 'Lore', 'Timeline', 'Media'].map(section => (
              <div
                key={section}
                style={{
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '6px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#e9ecef'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#f8f9fa'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <p style={{ fontWeight: '600', marginBottom: '4px' }}>{section}</p>
                <p className="text-muted" style={{ fontSize: '12px' }}>0 items</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
