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
  const SECTION_CATEGORIES = {
    '🌍 WORLD FOUNDATION': [
      'World / Universe Overview',
      'Genre & Tone',
      'Themes & Motifs',
      'Inspiration & Influences',
      'Rules of Reality (what can / can\'t exist)',
      'Physics & Cosmology',
      'Technology Level(s)',
      'Magic / Power Saturation',
      'Narrative Perspective (mythic, grounded, epic, etc.)'
    ],
    '🗺️ GEOGRAPHY & LOCATIONS': [
      'Continents / Star Systems / Realms',
      'Regions & Territories',
      'Cities & Settlements',
      'Wilderness Areas',
      'Landmarks & Wonders',
      'Planets / Moons / Dimensions',
      'Hidden or Lost Locations',
      'Political Borders',
      'Climate Zones & Biomes'
    ],
    '⏳ HISTORY & TIMELINE': [
      'Creation Myths / Origin Events',
      'Historical Eras',
      'Major Wars & Conflicts',
      'Rise & Fall of Civilizations',
      'Legendary Events',
      'Cataclysms & World-Changing Moments',
      'Recent History (current era)',
      'Future Prophecies / Destinies'
    ],
    '🧬 SPECIES, RACES & BEINGS': [
      'Sentient Species / Races',
      'Non-Sentient Creatures',
      'Gods / Higher Beings',
      'Spirits / Demons / Angels',
      'Artificial Life (AI, constructs, clones)',
      'Hybrids & Mutations',
      'Extinct Species',
      'Cultural Variations per Species'
    ],
    '🧑‍🤝‍🧑 CHARACTERS': [
      'Major Characters',
      'Minor Characters',
      'Antagonists',
      'Protagonists',
      'Factions Leaders',
      'Bloodlines & Lineages',
      'Relationships & Alliances',
      'Character Arcs',
      'Deaths & Legacy'
    ],
    '🏛️ FACTIONS & ORGANIZATIONS': [
      'Kingdoms / Empires',
      'Governments & Political Bodies',
      'Religious Orders',
      'Guilds & Societies',
      'Military Forces',
      'Criminal Organizations',
      'Corporations / Megacorps',
      'Rebel Groups',
      'Secret Orders'
    ],
    '⚔️ CONFLICTS & POWER DYNAMICS': [
      'Ongoing Conflicts',
      'Political Tensions',
      'Religious Schisms',
      'Resource Wars',
      'Ideological Divides',
      'Prophecies & Chosen Ones',
      'Power Vacuums',
      'Internal Conflicts'
    ],
    '✨ MAGIC, POWERS & SYSTEMS': [
      'Magic System(s)',
      'Power Sources',
      'Costs & Limitations',
      'Schools / Disciplines',
      'Rituals & Practices',
      'Forbidden Powers',
      'Technology vs Magic',
      'Training & Mastery',
      'Unique Abilities'
    ],
    '🧪 TECHNOLOGY & SCIENCE': [
      'Weapons & Armor',
      'Transportation',
      'Communication Systems',
      'Energy Sources',
      'Medical Technology',
      'Cybernetics / Enhancements',
      'Starships / Vehicles',
      'Ancient vs Modern Tech'
    ],
    '🧠 CULTURE & SOCIETY': [
      'Social Structure',
      'Class Systems',
      'Gender Roles',
      'Family & Kinship',
      'Daily Life',
      'Customs & Traditions',
      'Festivals & Holidays',
      'Etiquette & Taboos',
      'Art, Music & Literature'
    ],
    '🗣️ LANGUAGES & COMMUNICATION': [
      'Spoken Languages',
      'Written Scripts',
      'Symbols & Glyphs',
      'Slang & Idioms',
      'Lost / Ancient Languages',
      'Translation Methods',
      'Non-Verbal Communication'
    ],
    '🙏 RELIGION & PHILOSOPHY': [
      'Pantheons',
      'Religions & Faiths',
      'Creation Beliefs',
      'Moral Codes',
      'Heresies',
      'Cult Practices',
      'Afterlife Concepts',
      'Divine Intervention'
    ],
    '🏺 ITEMS, ARTIFACTS & RELICS': [
      'Legendary Artifacts',
      'Common Items',
      'Magical Objects',
      'Technology Relics',
      'Weapons of Legend',
      'Cursed Items',
      'Lost Objects',
      'Symbolic Items'
    ],
    '📜 LORE & MYTHOLOGY': [
      'Myths & Legends',
      'Folk Tales',
      'Songs & Poems',
      'Prophecies',
      'Historical Accounts',
      'Cultural Stories',
      'Misinterpreted Truths'
    ],
    '📈 ECONOMY & RESOURCES': [
      'Currency Systems',
      'Trade Routes',
      'Valuable Resources',
      'Scarcity & Abundance',
      'Black Markets',
      'Economic Powers',
      'Labor Systems'
    ],
    '🧭 EXPLORATION & TRAVEL': [
      'Travel Methods',
      'Dangerous Routes',
      'Portals / Hyperlanes',
      'Navigation Systems',
      'Explorers & Pioneers',
      'Uncharted Regions'
    ],
    '📖 STORY & NARRATIVE TOOLS': [
      'Plot Arcs',
      'Story Hooks',
      'Campaigns',
      'Quests / Missions',
      'Player Knowledge vs World Knowledge',
      'Canon vs Non-Canon',
      'Alternate Timelines'
    ],
    '🛠️ META / CREATOR TOOLS': [
      'Canon Status',
      'Version History',
      'Notes & Drafts',
      'Inspirations',
      'Tags & Cross-References',
      'Rights & Ownership',
      'Adaptation Notes (game, book, film)'
    ]
  }
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
      if (!selectedSection) {
        const firstCategory = Object.keys(SECTION_CATEGORIES)[0]
        const firstSection = SECTION_CATEGORIES[firstCategory][0]
        setSelectedSection(firstSection)
      }
    }
  }

  // when the selected world changes (eg user selects a different world), auto-open the first section
  useEffect(() => {
    if (selectedWorld && !selectedSection) {
      const firstCategory = Object.keys(SECTION_CATEGORIES)[0]
      const firstSection = SECTION_CATEGORIES[firstCategory][0]
      setSelectedSection(firstSection)
    }
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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', paddingTop: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '8px' }}>{ip.title}</h1>
          <p className="text-muted" style={{ fontSize: '15px' }}>IP Builder & World Creator</p>
        </div>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <button className="btn-secondary" style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '6px', background: 'white' }}>
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* IP Details Card */}
        <div className="content-card" style={{ maxWidth: '100%', padding: '24px' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '22px', fontWeight: '700' }}>IP Details</h2>
          {!editing ? (
            <>
              <div style={{ marginBottom: '20px' }}>
                <p className="text-muted" style={{ marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Title</p>
                <p style={{ fontSize: '17px', fontWeight: '600', color: '#1a1a1a', margin: 0 }}>{ip.title}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <p className="text-muted" style={{ marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Owner</p>
                <p style={{ fontSize: '15px', color: '#495057', margin: 0 }}>{ip.owner}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <p className="text-muted" style={{ marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Description</p>
                <p style={{ fontSize: '14px', color: '#495057', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>{ip.description}</p>
              </div>
              <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #e9ecef' }}>
                <p className="text-muted" style={{ marginBottom: '6px', fontSize: '13px', fontWeight: '500' }}>Created</p>
                <p style={{ fontSize: '14px', color: '#868e96', margin: 0 }}>{new Date(ip.created_at).toLocaleDateString()}</p>
              </div>
              <button className="btn-primary" onClick={() => setEditing(true)} style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600' }}>
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
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600' }}>Save</button>
                  <button type="button" className="btn-secondary" onClick={() => setEditing(false)} style={{ padding: '10px 20px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '6px', background: 'white' }}>Cancel</button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* World Builder */}
        <div className="content-card" style={{ maxWidth: '100%', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>🌍 World Builder</h2>
            {worlds.length > 0 ? (
              <button 
                className="btn-primary" 
                onClick={() => setCreatingWorld(true)}
                style={{ fontSize: '14px', padding: '10px 20px', fontWeight: '600' }}
              >
                Add New World
              </button>
            ) : (
              <button 
                className="btn-primary" 
                onClick={() => setCreatingWorld(true)}
                style={{ fontSize: '14px', padding: '10px 20px', fontWeight: '600' }}
              >
                Create New World
              </button>
            )}
          </div>

          {creatingWorld && (
            <div style={{ marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ marginBottom: '8px' }}>World Name</label>
                <input
                  type="text"
                  value={worldName}
                  onChange={e => setWorldName(e.target.value)}
                  placeholder="Enter world name"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  className="btn-primary" 
                  onClick={handleCreateWorld}
                  disabled={!worldName.trim()}
                  style={{ padding: '10px 20px', fontSize: '14px', fontWeight: '600' }}
                >
                  Create
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setCreatingWorld(false)
                    setWorldName('')
                  }}
                  style={{ padding: '10px 20px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '6px', background: 'white' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {worlds.length > 0 && (
            <>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ marginBottom: '8px', display: 'block' }}>Select World</label>
                <select
                  value={selectedWorld?.id || ''}
                  onChange={e => {
                    const world = worlds.find(w => w.id === e.target.value)
                    setSelectedWorld(world)
                  }}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', background: 'white', cursor: 'pointer' }}
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

      {/* Content Editor Card - Only show when a world is selected */}
      {selectedWorld && (
        <div className="content-card" style={{ maxWidth: '100%', padding: '28px', marginBottom: '24px' }}>
          <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #e9ecef' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: '700' }}>
                  {selectedSection || 'Select a Section'}
                </h2>
                <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>
                  Building: <strong style={{ color: '#0066cc' }}>{selectedWorld.name}</strong>
                </p>
              </div>
            </div>

            {/* Section Dropdown */}
            <div className="form-group" style={{ marginBottom: '0' }}>
              <label style={{ marginBottom: '8px', display: 'block', fontSize: '14px', fontWeight: '600' }}>Content Section</label>
              <select
                value={selectedSection || ''}
                onChange={e => handleSelectSection(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  background: 'white',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <option value="">-- Select a section to edit --</option>
                {Object.entries(SECTION_CATEGORIES).map(([category, sections]) => (
                  <optgroup key={category} label={category}>
                    {sections.map(section => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>

          {/* Create New Item Form - Only show when section is selected */}
          {selectedSection && (
            <>
              <div style={{ marginBottom: '32px', padding: '24px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <h4 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Add New {selectedSection} Item</h4>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label style={{ marginBottom: '8px', display: 'block' }}>Title</label>
              <input
                type="text"
                value={newItemTitle}
                onChange={e => setNewItemTitle(e.target.value)}
                placeholder={`Enter ${selectedSection.toLowerCase()} title`}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ marginBottom: '8px', display: 'block' }}>Content</label>
              <textarea
                value={newItemBody}
                onChange={e => setNewItemBody(e.target.value)}
                placeholder={`Enter ${selectedSection.toLowerCase()} content`}
                rows={6}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
            <button 
              className="btn-primary" 
              onClick={handleCreateItem}
              disabled={!newItemTitle.trim()}
              style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600' }}
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
            <div style={{ padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #dee2e6' }}>
              <p className="text-muted" style={{ fontSize: '14px', margin: 0 }}>No {selectedSection.toLowerCase()} items yet. Create one above.</p>
            </div>
          ) : (
            <div>
              <h4 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Existing Items ({items.length})</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {items.map(item => (
                  <div 
                    key={item.id} 
                    style={{ 
                      padding: '20px', 
                      background: 'white', 
                      border: '1px solid #e9ecef', 
                      borderRadius: '8px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'box-shadow 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <h5 style={{ margin: 0, fontSize: '17px', fontWeight: '600', color: '#1a1a1a' }}>{item.title}</h5>
                      <button
                        className="btn-danger"
                        onClick={() => handleDeleteItem(item.id)}
                        style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '4px' }}
                      >
                        Delete
                      </button>
                    </div>
                    {item.body && (
                      <p style={{ margin: '0 0 12px 0', color: '#495057', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '14px' }}>{item.body}</p>
                    )}
                    <p className="text-muted" style={{ margin: 0, fontSize: '12px', color: '#868e96' }}>
                      Created: {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
