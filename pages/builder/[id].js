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
  const SECTIONS = ['Characters', 'Locations', 'Plot', 'Lore', 'Timeline', 'Media']
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [creatingWorld, setCreatingWorld] = useState(false)
  const [worldName, setWorldName] = useState('')
  const [selectedWorld, setSelectedWorld] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '', owner: '' })
  const [selectedSection, setSelectedSection] = useState(null)
  const [items, setItems] = useState([])
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemBody, setNewItemBody] = useState('')
  const [itemsLoading, setItemsLoading] = useState(false)
  const [itemsError, setItemsError] = useState(null)

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

    if (err) {
      console.error('Error fetching worlds:', err)
      return
    }
    
    setWorlds(data || [])
    if (data && data.length > 0) {
      setSelectedWorld(data[0])
      // auto-open the first section for usability (for non-technical users)
      if (!selectedSection) setSelectedSection(SECTIONS[0])
    }
  }

  // when the selected world changes (eg user selects a different world), auto-open the first section
  useEffect(() => {
    if (selectedWorld) setSelectedSection(SECTIONS[0])
  }, [selectedWorld])

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

    try {
      const { data, error: err } = await supabase
        .from('worlds')
        .insert([{
          name: worldName,
          ip_id: id,
          user_id: user.id
        }])
        .select()

      if (err) {
        console.error('Create world error:', err)
        alert('Error: ' + err.message)
        return
      }

      const newWorld = data[0]
      setWorlds([newWorld, ...worlds])
      setSelectedWorld(newWorld)
      setWorldName('')
      setCreatingWorld(false)
    } catch (e) {
      console.error('Unexpected error:', e)
      alert('Error creating world: ' + e.message)
    }
  }

  // Content items: fetch/create/delete per section
  const fetchItems = async (section) => {
    if (!selectedWorld || !section) return
    setItemsLoading(true)
    setItemsError(null)
    console.log('fetchItems', { section, worldId: selectedWorld?.id })
    const { data, error: err } = await supabase
      .from('content_items')
      .select('*')
      .eq('world_id', selectedWorld.id)
      .eq('section', section)
      .order('created_at', { ascending: false })

    setItemsLoading(false)
    if (err) {
      console.error('Error fetching content items:', err)
      setItemsError(err.message || String(err))
      setItems([])
      return
    }
    setItems(data || [])
  }

  useEffect(() => {
    if (selectedSection) fetchItems(selectedSection)
  }, [selectedSection, selectedWorld])

  const handleCreateItem = async () => {
    if (!newItemTitle.trim()) {
      alert('Please enter a title')
      return
    }
    try {
      const { data, error: err } = await supabase
        .from('content_items')
        .insert([{
          title: newItemTitle,
          body: newItemBody,
          section: selectedSection,
          world_id: selectedWorld.id,
          ip_id: id,
          user_id: user.id
        }])
        .select()

      if (err) {
        console.error('Create item error:', err)
        alert('Error: ' + err.message)
        return
      }

      const newItem = data[0]
      setItems([newItem, ...items])
      setNewItemTitle('')
      setNewItemBody('')
    } catch (e) {
      console.error('Unexpected error creating item:', e)
      alert('Error creating item: ' + e.message)
    }
  }

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Delete this item?')) return
    const { error: err } = await supabase
      .from('content_items')
      .delete()
      .eq('id', itemId)

    if (err) {
      console.error('Delete item error:', err)
      alert('Error: ' + err.message)
      return
    }
    setItems(items.filter(i => i.id !== itemId))
  }

  const handleSelectSection = (section) => {
    console.log('section clicked', section)
    setSelectedSection(section)
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                  <p style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>{selectedWorld?.name}</p>
                  <button className="btn-secondary" onClick={() => { navigator.clipboard?.writeText(selectedWorld?.id || '').then(()=>alert('World ID copied')) }}>Copy ID</button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setCreatingWorld(true)}>
                    + Create Another World
                  </button>
                </div>
              </div>
              {worlds.length > 1 && (
                <div>
                  <p className="text-muted" style={{ fontSize: '12px', marginBottom: '8px' }}>Other worlds:</p>
                  {worlds.map(world => (
                    <div key={world.id} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                      <button
                        className="btn-secondary"
                        onClick={() => setSelectedWorld(world)}
                        style={{ flex: 1, textAlign: 'left' }}
                      >
                        {world.name}
                      </button>
                      <button className="btn-secondary" onClick={() => { navigator.clipboard?.writeText(world.id).then(()=>alert('World ID copied')) }}>Copy ID</button>
                    </div>
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

            {/* Verification / Debug panel for non-technical users */}
            <div style={{ marginTop: '12px', padding: '10px', background: '#fff7e6', borderRadius: '6px', border: '1px solid #ffe7b2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Current World ID:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedWorld.id}</span>
                  <br />
                  <strong>Your User ID:</strong> <span style={{ fontFamily: 'monospace' }}>{user.id}</span>
                  <br />
                  <strong>Selected Section:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedSection || 'none'}</span>
                  {itemsError ? (<div style={{ marginTop: '6px' }} className="message message-error">Items error: {itemsError}</div>) : null}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary" onClick={() => fetchItems(selectedSection)}>Refresh Items</button>
                  <button className="btn-secondary" onClick={() => { navigator.clipboard?.writeText(selectedWorld.id).then(()=>alert('World ID copied')) }}>Copy World ID</button>
                </div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <small className="text-muted">Use "Refresh Items" to verify what the database currently stores for the selected section.</small>
              </div>
            </div>

          {/* If a section is selected, show focused editor */}
          {selectedSection ? (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0 }}>{selectedSection}</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-secondary" onClick={() => setSelectedSection(null)}>← All Sections</button>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <p className="text-muted">Items</p>
                {itemsLoading ? (
                  <p>Loading items...</p>
                ) : (
                  <div>
                    {items.length === 0 ? <p className="text-muted">No items yet</p> : (
                      <ul style={{ paddingLeft: '18px' }}>
                        {items.map(item => (
                          <li key={item.id} style={{ marginBottom: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <strong>{item.title}</strong>
                                {item.body ? <div className="text-muted" style={{ fontSize: '13px' }}>{item.body}</div> : null}
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-secondary" onClick={() => navigator.clipboard?.writeText(item.id).then(()=>alert('ID copied'))}>Copy ID</button>
                                <button className="btn-danger" onClick={() => handleDeleteItem(item.id)}>Delete</button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '12px' }}>
                <p className="text-muted">Add New {selectedSection.slice(0, -1)}</p>
                <div className="form-group">
                  <label>Title</label>
                  <input value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Body</label>
                  <textarea value={newItemBody} onChange={e => setNewItemBody(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-primary" onClick={handleCreateItem}>Add</button>
                  <button className="btn-secondary" onClick={() => { setNewItemTitle(''); setNewItemBody('') }}>Clear</button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '20px' }}>
              {SECTIONS.map(section => (
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
                  onClick={() => handleSelectSection(section)}
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
                  <p className="text-muted" style={{ fontSize: '12px' }}>{/* count could go here */}items</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
