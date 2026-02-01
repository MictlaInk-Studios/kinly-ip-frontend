import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [ips, setIps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (user) {
      fetchIPs()
    }
  }, [user, authLoading])

  const fetchIPs = async () => {
    setLoading(true)
    const { data, error: err } = await supabase
      .from('ips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setLoading(false)
    if (err) {
      setError(err.message)
      return
    }
    setIps(data || [])
  }

  const deleteIP = async (id) => {
    if (!confirm('Are you sure you want to delete this IP?')) return
    const { error: err } = await supabase.from('ips').delete().eq('id', id)
    if (err) {
      alert('Error: ' + err.message)
      return
    }
    setIps(ips.filter(ip => ip.id !== id))
  }

  if (authLoading) return <p>Loading...</p>
  if (!user) return null

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
        <div>
          <h1>Your IPs</h1>
          <p className="text-muted">{ips.length} IP{ips.length !== 1 ? 's' : ''} in your portfolio</p>
        </div>
        <Link href="/create-ip" style={{textDecoration: 'none'}}>
          <button className="btn-primary">+ Create New IP</button>
        </Link>
      </div>

      {error && <div className="message message-error">{error}</div>}

      {loading && <p>Loading your IPs...</p>}

      {!loading && ips.length === 0 && (
        <div className="content-card" style={{textAlign: 'center', padding: '40px'}}>
          <h2 style={{fontSize: '20px', marginBottom: '12px'}}>No IPs Yet</h2>
          <p className="text-muted">Get started by creating your first intellectual property.</p>
          <Link href="/create-ip">
            <button className="btn-primary" style={{marginTop: '12px'}}>Create Your First IP</button>
          </Link>
        </div>
      )}

      {!loading && ips.length > 0 && (
        <div style={{background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)'}}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Owner</th>
                <th>Description</th>
                <th>Created</th>
                <th style={{textAlign: 'center'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {ips.map(ip => (
                <tr key={ip.id}>
                  <td><strong>{ip.title}</strong></td>
                  <td>{ip.owner}</td>
                  <td>{ip.description?.substring(0, 50)}{ip.description?.length > 50 ? '...' : ''}</td>
                  <td>{new Date(ip.created_at).toLocaleDateString()}</td>
                  <td style={{textAlign: 'center'}}>
                    <button 
                      className="btn-danger"
                      onClick={() => deleteIP(ip.id)}
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
    </>
  )
}
}
