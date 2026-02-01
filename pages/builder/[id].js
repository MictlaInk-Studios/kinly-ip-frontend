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

        {/* World Builder (removed) */}
        <div className="content-card">
          <h2>🌍 World Builder (removed)</h2>
          <p className="text-muted">The world builder UI has been removed to rebuild from scratch. New builder will be implemented here.</p>
        </div>
      </div>

      {/* Builder removed — placeholder for new implementation */}
      <div className="content-card">
        <h2>Builder Removed</h2>
        <p className="text-muted">World builder and content sections have been cleared. We'll rebuild this area from scratch.</p>
      </div>
    </>
  )
}
