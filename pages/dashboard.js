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
    if (!confirm('Delete this IP?')) return
    const { error: err } = await supabase.from('ips').delete().eq('id', id)
    if (err) {
      alert('Error: ' + err.message)
      return
    }
    setIps(ips.filter(ip => ip.id !== id))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  if (authLoading) return <p style={{padding:40}}>Loading...</p>
  if (!user) return null

  return (
    <div style={{padding:40,fontFamily:'sans-serif',maxWidth:1000}}>
      <h1>IP Dashboard</h1>
      <p style={{fontSize:'0.9em',color:'#666'}}>Logged in as: {user.email}</p>
      <p>
        <Link href="/">Home</Link> | <Link href="/create-ip">Create New IP</Link> | 
        <button 
          onClick={handleLogout}
          style={{background:'none',border:'none',color:'blue',cursor:'pointer',textDecoration:'underline',marginLeft:4}}
        >
          Logout
        </button>
      </p>
      {error && <div style={{color:'red',marginBottom:12}}>Error: {error}</div>}
      {loading && <p>Loading...</p>}
      {!loading && ips.length === 0 && <p>No IPs yet. <Link href="/create-ip">Create one</Link></p>}
      {!loading && ips.length > 0 && (
        <div>
          <p>{ips.length} IP(s) found</p>
          <table style={{width:'100%',borderCollapse:'collapse',marginTop:12}}>
            <thead>
              <tr style={{borderBottom:'2px solid #ccc'}}>
                <th style={{textAlign:'left',padding:8}}>Title</th>
                <th style={{textAlign:'left',padding:8}}>Description</th>
                <th style={{textAlign:'left',padding:8}}>Owner</th>
                <th style={{textAlign:'left',padding:8}}>Created</th>
                <th style={{textAlign:'center',padding:8}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {ips.map(ip => (
                <tr key={ip.id} style={{borderBottom:'1px solid #eee'}}>
                  <td style={{padding:8}}>{ip.title}</td>
                  <td style={{padding:8}}>{ip.description}</td>
                  <td style={{padding:8}}>{ip.owner}</td>
                  <td style={{padding:8,fontSize:'0.9em'}}>{new Date(ip.created_at).toLocaleDateString()}</td>
                  <td style={{textAlign:'center',padding:8}}>
                    <button onClick={() => deleteIP(ip.id)} style={{background:'#ff4444',color:'white',border:'none',padding:'4px 12px',cursor:'pointer'}}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
