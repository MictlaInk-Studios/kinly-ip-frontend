import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/authContext'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'

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
      if (!selectedSection) {
        const firstCategory = Object.keys(SECTION_CATEGORIES)[0]
        const firstSection = SECTION_CATEGORIES[firstCategory][0]
        setSelectedSection(firstSection)
      }
    }
  }

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

  const fetchItems = async (section) => {
    if (!selectedWorld || !section) return
    setItemsLoading(true)
    setItemsError(null)
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
    setSelectedSection(section)
  }

  if (authLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  if (!user) return null
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading IP...</div>
  if (error) return <Card style={{ borderColor: '#DC3545' }}><p style={{ color: '#DC3545', margin: 0 }}>Error: {error}</p></Card>
  if (!ip) return <Card><p>IP not found</p></Card>

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '700', margin: 0 }}>{ip.title}</h1>
          <Link href="/dashboard">
            <Button variant="ghost">← Back to Dashboard</Button>
          </Link>
        </div>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>IP Builder & World Creator</p>
      </div>

      {/* IP Details and World Builder */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* IP Details Card */}
        <Card>
          <h2 style={{ marginBottom: '24px', fontSize: '20px', fontWeight: '700' }}>IP Details</h2>
          {!editing ? (
            <>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Title</p>
                <p style={{ fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{ip.title}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Owner</p>
                <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>{ip.owner}</p>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Description</p>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>{ip.description}</p>
              </div>
              <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-default)' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>Created</p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>{new Date(ip.created_at).toLocaleDateString()}</p>
              </div>
              <Button variant="primary" onClick={() => setEditing(true)}>Edit IP</Button>
            </>
          ) : (
            <form onSubmit={e => { e.preventDefault(); handleSaveIP() }}>
              <Input
                label="Title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <Input
                label="Owner"
                value={formData.owner}
                onChange={e => setFormData({ ...formData, owner: e.target.value })}
                required
              />
              <Textarea
                label="Description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
              />
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <Button type="submit" variant="primary">Save</Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </form>
          )}
        </Card>

        {/* World Builder */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>🌍 World Builder</h2>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCreatingWorld(true)}
            >
              {worlds.length > 0 ? 'Add New World' : 'Create New World'}
            </Button>
          </div>

          {creatingWorld && (
            <Card style={{ marginBottom: '20px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
              <Input
                label="World Name"
                value={worldName}
                onChange={e => setWorldName(e.target.value)}
                placeholder="Enter world name"
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  variant="primary"
                  onClick={handleCreateWorld}
                  disabled={!worldName.trim()}
                >
                  Create
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setCreatingWorld(false)
                    setWorldName('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {worlds.length > 0 && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Select World
                </label>
                <select
                  value={selectedWorld?.id || ''}
                  onChange={e => {
                    const world = worlds.find(w => w.id === e.target.value)
                    setSelectedWorld(world)
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    fontSize: '14px',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gold-primary)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201, 162, 77, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {worlds.map(world => (
                    <option key={world.id} value={world.id}>
                      {world.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedWorld && (
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                  Selected: <strong style={{ color: 'var(--text-primary)' }}>{selectedWorld.name}</strong>
                </p>
              )}
            </>
          )}

          {worlds.length === 0 && !creatingWorld && (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No worlds created yet. Click "Create New World" to get started.</p>
          )}
        </Card>
      </div>

      {/* Content Editor Card */}
      {selectedWorld && (
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '2px solid var(--border-default)' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ marginBottom: '8px', fontSize: '24px', fontWeight: '700' }}>
                {selectedSection || 'Select a Section'}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                Building: <strong style={{ color: 'var(--gold-primary)' }}>{selectedWorld.name}</strong>
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Content Section
              </label>
              <select
                value={selectedSection || ''}
                onChange={e => handleSelectSection(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-default)',
                  fontSize: '14px',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all 0.15s ease'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gold-primary)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201, 162, 77, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-default)'
                  e.currentTarget.style.boxShadow = 'none'
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

          {/* Create New Item Form */}
          {selectedSection && (
            <>
              <Card style={{ marginBottom: '32px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                <h4 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Add New {selectedSection} Item</h4>
                <Input
                  label="Title"
                  value={newItemTitle}
                  onChange={e => setNewItemTitle(e.target.value)}
                  placeholder={`Enter ${selectedSection.toLowerCase()} title`}
                />
                <Textarea
                  label="Content"
                  value={newItemBody}
                  onChange={e => setNewItemBody(e.target.value)}
                  placeholder={`Enter ${selectedSection.toLowerCase()} content`}
                  rows={6}
                />
                <Button
                  variant="primary"
                  onClick={handleCreateItem}
                  disabled={!newItemTitle.trim()}
                >
                  Add Item
                </Button>
              </Card>

              {/* Items List */}
              {itemsLoading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading items...</p>
              ) : itemsError ? (
                <Card style={{ borderColor: '#DC3545' }}>
                  <p style={{ color: '#DC3545', margin: 0 }}>Error: {itemsError}</p>
                </Card>
              ) : items.length === 0 ? (
                <Card style={{ textAlign: 'center', padding: '40px', background: 'var(--bg-surface)', border: '1px dashed var(--border-default)' }}>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                    No {selectedSection.toLowerCase()} items yet. Create one above.
                  </p>
                </Card>
              ) : (
                <div>
                  <h4 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '600' }}>Existing Items ({items.length})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {items.map(item => (
                      <Card key={item.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                          <h5 style={{ margin: 0, fontSize: '17px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.title}</h5>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Delete
                          </Button>
                        </div>
                        {item.body && (
                          <p style={{ margin: '0 0 12px 0', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '14px' }}>
                            {item.body}
                          </p>
                        )}
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                          Created: {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      )}
    </>
  )
}
