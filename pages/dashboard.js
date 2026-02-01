import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Link from 'next/link'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [ips, setIps] = useState([])
  const [stats, setStats] = useState({ worlds: 0, contentItems: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid')

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
      const { data: ipsData, error: ipsError } = await supabase
        .from('ips')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (ipsError) throw ipsError
      setIps(ipsData || [])

      if (ipsData && ipsData.length > 0) {
        const ipIds = ipsData.map(ip => ip.id)
        const { count: worldsCount } = await supabase
          .from('worlds')
          .select('*', { count: 'exact', head: true })
          .in('ip_id', ipIds)
          .eq('user_id', user.id)
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
    fetchData()
  }

  const filteredIPs = ips.filter(ip => 
    ip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ip.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ip.owner.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  if (!user) return null

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '32px', fontWeight: '700' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
          Manage and build your intellectual property portfolio
        </p>
      </div>

      {error && (
        <Card style={{ marginBottom: '24px', borderColor: '#DC3545' }}>
          <p style={{ color: '#DC3545', margin: 0 }}>Error: {error}</p>
        </Card>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ color: 'var(--text-muted)' }}>Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <Card style={{ background: 'linear-gradient(135deg, var(--gold-primary), var(--gold-muted))', border: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', opacity: 0.9, color: 'var(--bg-base)' }}>Total IPs</span>
                <span style={{ fontSize: '24px' }}>📚</span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--bg-base)', margin: 0 }}>{ips.length}</div>
              <p style={{ fontSize: '13px', opacity: 0.8, margin: '8px 0 0 0', color: 'var(--bg-base)' }}>Intellectual Properties</p>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Worlds</span>
                <span style={{ fontSize: '24px' }}>🌍</span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{stats.worlds}</div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>Worlds Created</p>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Content Items</span>
                <span style={{ fontSize: '24px' }}>📝</span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{stats.contentItems}</div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>Total Entries</p>
            </Card>

            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>Avg. Items/IP</span>
                <span style={{ fontSize: '24px' }}>📊</span>
              </div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                {ips.length > 0 ? Math.round(stats.contentItems / ips.length) : 0}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '8px 0 0 0' }}>Content per IP</p>
            </Card>
          </div>

          {/* Search and Actions */}
          {ips.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
              <div style={{ flex: 1, maxWidth: '500px', position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search IPs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 40px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-default)',
                    fontSize: '14px',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
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
                />
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px' }}>🔍</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
                <Link href="/create-ip">
                  <Button variant="primary">+ Create IP</Button>
                </Link>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && ips.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '60px 40px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚀</div>
              <h2 style={{ fontSize: '24px', marginBottom: '12px', fontWeight: '600' }}>Start Building Your IP Portfolio</h2>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '500px', margin: '0 auto 32px' }}>
                Create your first intellectual property and start building worlds, characters, and stories.
              </p>
              <Link href="/create-ip">
                <Button variant="primary" size="lg">Create Your First IP</Button>
              </Link>
            </Card>
          )}

          {/* IP Grid */}
          {!loading && filteredIPs.length > 0 && viewMode === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginBottom: '32px' }}>
              {filteredIPs.map(ip => (
                <Card key={ip.id} hover onClick={() => router.push(`/builder/${ip.id}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', margin: 0, flex: 1 }}>{ip.title}</h3>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteIP(ip.id)
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Owner: <strong style={{ color: 'var(--text-primary)' }}>{ip.owner}</strong>
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {ip.description || 'No description provided'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-default)' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {new Date(ip.created_at).toLocaleDateString()}
                    </span>
                    <span style={{ fontSize: '14px', color: 'var(--gold-primary)', fontWeight: '600' }}>Open →</span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* IP List */}
          {!loading && filteredIPs.length > 0 && viewMode === 'list' && (
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Title</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Owner</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Description</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Created</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', width: '100px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIPs.map(ip => (
                    <tr
                      key={ip.id}
                      style={{ cursor: 'pointer', borderBottom: '1px solid var(--border-default)', transition: 'background 0.15s ease' }}
                      onClick={() => router.push(`/builder/${ip.id}`)}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}><strong>{ip.title}</strong></td>
                      <td style={{ padding: '12px 16px' }}>{ip.owner}</td>
                      <td style={{ padding: '12px 16px', maxWidth: '300px' }}>{ip.description?.substring(0, 60)}{ip.description?.length > 60 ? '...' : ''}</td>
                      <td style={{ padding: '12px 16px' }}>{new Date(ip.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteIP(ip.id)
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* No Results */}
          {!loading && searchQuery && filteredIPs.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-muted)' }}>No IPs found matching "{searchQuery}"</p>
            </Card>
          )}
        </>
      )}
    </>
  )
}
