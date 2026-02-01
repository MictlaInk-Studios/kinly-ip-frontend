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

        {/* World Builder */}
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>🌍 World Builder</h2>
            {worlds.length > 0 ? (
              <button 
                className="btn-primary" 
                onClick={() => setCreatingWorld(true)}
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                Add New World
              </button>
            ) : (
              <button 
                className="btn-primary" 
                onClick={() => setCreatingWorld(true)}
                style={{ fontSize: '14px', padding: '8px 16px' }}
              >
                Create New World
              </button>
            )}
          </div>

          {creatingWorld && (
            <div style={{ marginBottom: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div className="form-group">
                <label>World Name</label>
                <input
                  type="text"
                  value={worldName}
                  onChange={e => setWorldName(e.target.value)}
                  placeholder="Enter world name"
                  style={{ marginBottom: '10px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn-primary" 
                  onClick={handleCreateWorld}
                  disabled={!worldName.trim()}
                >
                  Create
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setCreatingWorld(false)
                    setWorldName('')
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {worlds.length > 0 && (
            <>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Select World</label>
                <select
                  value={selectedWorld?.id || ''}
                  onChange={e => {
                    const world = worlds.find(w => w.id === e.target.value)
                    setSelectedWorld(world)
                  }}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                >
                  {worlds.map(world => (
                    <option key={world.id} value={world.id}>
                      {world.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedWorld && (
                <div>
                  <p className="text-muted" style={{ marginBottom: '15px' }}>
                    Selected: <strong>{selectedWorld.name}</strong>
                  </p>
                </div>
              )}
            </>
          )}

          {worlds.length === 0 && !creatingWorld && (
            <p className="text-muted">No worlds created yet. Click "Create New World" to get started.</p>
          )}
        </div>
      </div>

      {/* Content Sections - Only show when a world is selected */}
      {selectedWorld && (
        <div className="content-card">
          <h2>Content Sections</h2>
          <p className="text-muted" style={{ marginBottom: '20px' }}>
            Building: <strong>{selectedWorld.name}</strong>
          </p>

          {/* Section Tabs */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {SECTIONS.map(section => (
              <button
                key={section}
                onClick={() => handleSelectSection(section)}
                className={selectedSection === section ? 'btn-primary' : 'btn-secondary'}
                style={{
                  padding: '10px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: selectedSection === section ? '600' : '400'
                }}
              >
                {section}
              </button>
            ))}
          </div>

          {/* Selected Section Content */}
          {selectedSection && (
            <div>
              <h3 style={{ marginBottom: '15px' }}>{selectedSection}</h3>

              {/* Create New Item Form */}
              <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '15px' }}>Add New {selectedSection} Item</h4>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newItemTitle}
                    onChange={e => setNewItemTitle(e.target.value)}
                    placeholder={`Enter ${selectedSection.toLowerCase()} title`}
                  />
                </div>
                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    value={newItemBody}
                    onChange={e => setNewItemBody(e.target.value)}
                    placeholder={`Enter ${selectedSection.toLowerCase()} content`}
                    rows={4}
                  />
                </div>
                <button 
                  className="btn-primary" 
                  onClick={handleCreateItem}
                  disabled={!newItemTitle.trim()}
                >
                  Add Item
                </button>
              </div>

              {/* Items List */}
              {itemsLoading ? (
                <p>Loading items...</p>
              ) : itemsError ? (
                <p className="message message-error">Error: {itemsError}</p>
              ) : items.length === 0 ? (
                <p className="text-muted">No {selectedSection.toLowerCase()} items yet. Create one above.</p>
              ) : (
                <div>
                  <h4 style={{ marginBottom: '15px' }}>Existing Items</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {items.map(item => (
                      <div 
                        key={item.id} 
                        style={{ 
                          padding: '15px', 
                          background: 'white', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '6px' 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                          <h5 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{item.title}</h5>
                          <button
                            className="btn-danger"
                            onClick={() => handleDeleteItem(item.id)}
                            style={{ fontSize: '12px', padding: '5px 10px' }}
                          >
                            Delete
                          </button>
                        </div>
                        {item.body && (
                          <p style={{ margin: 0, color: '#666', whiteSpace: 'pre-wrap' }}>{item.body}</p>
                        )}
                        <p className="text-muted" style={{ marginTop: '10px', fontSize: '12px' }}>
                          Created: {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}
