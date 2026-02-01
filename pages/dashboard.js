import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import SettingsButton from '../components/SettingsButton'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [ips, setIps] = useState([])
  const [stats, setStats] = useState({ worlds: 0, contentItems: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      fetchData()
    }
  }, [user, authLoading])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch IPs
      const { data: ipsData, error: ipsError } = await supabase
        .from('ips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ipsError) throw ipsError

      setIps(ipsData || [])

      // Fetch stats
      if (ipsData && ipsData.length > 0) {
        const ipIds = ipsData.map(ip => ip.id)
        
        // Count worlds
        const { count: worldsCount } = await supabase
          .from('worlds')
          .select('*', { count: 'exact', head: true })
          .in('ip_id', ipIds)
          .eq('user_id', user.id)

        // Count content items
        const { count: itemsCount } = await supabase
          .from('content_items')
          .select('*', { count: 'exact', head: true })
          .in('ip_id', ipIds)
          .eq('user_id', user.id)

        setStats({
          worlds: worldsCount || 0,
          contentItems: itemsCount || 0
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const deleteIP = async (id) => {
    if (!confirm('Are you sure you want to delete this IP? This will also delete all associated worlds and content.')) return
    const { error: err } = await supabase.from('ips').delete().eq('id', id)
    if (err) {
      alert('Error: ' + err.message)
      return
    }
    setIps(ips.filter(ip => ip.id !== id))
    fetchData() // Refresh stats
  }

  const filteredIPs = ips.filter(ip => 
    ip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ip.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ip.owner.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const recentIPs = [...ips].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).slice(0, 5)

  if (authLoading) return <p>Loading...</p>
  if (!user) return null

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', paddingTop: '20px' }}>
        <div>
          <h1 style={{ marginBottom: '8px', fontSize: '32px', fontWeight: '700' }}>
            Welcome back{user.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-muted" style={{ fontSize: '16px' }}>
            Manage and build your intellectual property portfolio
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <SettingsButton />
          <Link href="/create-ip" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '600' }}>
              + Create New IP
            </button>
          </Link>
        </div>
      </div>

      {error && <div className="message message-error" style={{ marginBottom: '24px' }}>{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p className="text-muted">Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="content-card" style={{ maxWidth: '100%', padding: '24px', background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)', color: 'white', border: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9, margin: 0 }}>Total IPs</h3>
                <span style={{ fontSize: '24px' }}>📚</span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', margin: 0 }}>{ips.length}</div>
              <p style={{ fontSize: '13px', opacity: 0.8, margin: '8px 0 0 0' }}>Intellectual Properties</p>
            </div>

            <div className="content-card" style={{ maxWidth: '100%', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', margin: 0 }}>Worlds</h3>
                <span style={{ fontSize: '24px' }}>🌍</span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{stats.worlds}</div>
              <p className="text-muted" style={{ fontSize: '13px', margin: '8px 0 0 0' }}>Worlds Created</p>
            </div>

            <div className="content-card" style={{ maxWidth: '100%', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', margin: 0 }}>Content Items</h3>
                <span style={{ fontSize: '24px' }}>📝</span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{stats.contentItems}</div>
              <p className="text-muted" style={{ fontSize: '13px', margin: '8px 0 0 0' }}>Total Entries</p>
            </div>

            <div className="content-card" style={{ maxWidth: '100%', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)', margin: 0 }}>Avg. Items/IP</h3>
                <span style={{ fontSize: '24px' }}>📊</span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                {ips.length > 0 ? Math.round(stats.contentItems / ips.length) : 0}
              </div>
              <p className="text-muted" style={{ fontSize: '13px', margin: '8px 0 0 0' }}>Content per IP</p>
            </div>
          </div>

          {/* Search and View Toggle */}
          {ips.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
              <div style={{ flex: 1, maxWidth: '500px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search IPs by title, description, or owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    borderRadius: '8px',
                    border: '1px solid var(--input-border)',
                    fontSize: '14px',
                    background: 'var(--input-bg)',
                    color: 'var(--text-primary)'
                  }}
                />
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔍</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: '8px' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: viewMode === 'grid' ? 'var(--accent)' : 'transparent',
                    color: viewMode === 'grid' ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: viewMode === 'list' ? 'var(--accent)' : 'transparent',
                    color: viewMode === 'list' ? 'white' : 'var(--text-primary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  List
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && ips.length === 0 && (
            <div className="content-card" style={{ textAlign: 'center', padding: '60px 40px', maxWidth: '100%' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚀</div>
              <h2 style={{ fontSize: '24px', marginBottom: '12px', fontWeight: '600' }}>Start Building Your IP Portfolio</h2>
              <p className="text-muted" style={{ fontSize: '16px', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                Create your first intellectual property and start building worlds, characters, and stories.
              </p>
              <Link href="/create-ip">
                <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px', fontWeight: '600' }}>
                  Create Your First IP
                </button>
              </Link>
            </div>
          )}

          {/* IP Cards Grid */}
          {!loading && filteredIPs.length > 0 && viewMode === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              {filteredIPs.map(ip => (
                <div
                  key={ip.id}
                  className="content-card"
                  style={{
                    maxWidth: '100%',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                  onClick={() => router.push(`/builder/${ip.id}`)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 16px var(--shadow)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 3px var(--shadow)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, flex: 1 }}>{ip.title}</h3>
                    <button
                      className="btn-danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteIP(ip.id)
                      }}
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-muted" style={{ fontSize: '13px', marginBottom: '12px' }}>
                    Owner: <strong style={{ color: 'var(--text-primary)' }}>{ip.owner}</strong>
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ip.description || 'No description provided'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <span className="text-muted" style={{ fontSize: '12px' }}>
                      Created {new Date(ip.created_at).toLocaleDateString()}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--accent)', fontWeight: '600' }}>Open →</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* IP List View */}
          {!loading && filteredIPs.length > 0 && viewMode === 'list' && (
            <div className="content-card" style={{ maxWidth: '100%', padding: 0, overflow: 'hidden' }}>
              <table style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Owner</th>
                    <th>Description</th>
                    <th>Created</th>
                    <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIPs.map(ip => (
                    <tr key={ip.id} style={{ cursor: 'pointer' }} onClick={() => router.push(`/builder/${ip.id}`)}>
                      <td><strong>{ip.title}</strong></td>
                      <td>{ip.owner}</td>
                      <td style={{ maxWidth: '300px' }}>{ip.description?.substring(0, 60)}{ip.description?.length > 60 ? '...' : ''}</td>
                      <td>{new Date(ip.created_at).toLocaleDateString()}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-danger"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteIP(ip.id)
                          }}
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* No Results */}
          {!loading && searchQuery && filteredIPs.length === 0 && (
            <div className="content-card" style={{ textAlign: 'center', padding: '40px', maxWidth: '100%' }}>
              <p className="text-muted">No IPs found matching "{searchQuery}"</p>
            </div>
          )}

          {/* Recent Activity Section */}
          {!loading && recentIPs.length > 0 && (
            <div style={{ marginTop: '48px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>Recent Activity</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentIPs.map(ip => (
                  <div
                    key={ip.id}
                    className="content-card"
                    style={{
                      maxWidth: '100%',
                      padding: '16px 20px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onClick={() => router.push(`/builder/${ip.id}`)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>{ip.title}</h4>
                      <p className="text-muted" style={{ fontSize: '13px', margin: 0 }}>
                        Last updated {new Date(ip.updated_at || ip.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span style={{ fontSize: '20px', color: 'var(--accent)' }}>→</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
