import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/authContext'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  if (loading) return <p>Loading...</p>
  if (!user) return null

  return (
    <>
      <h1>Dashboard</h1>
      <p className="text-muted">Welcome back, {user.email}</p>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px'}}>
        <Link href="/create-ip" style={{textDecoration: 'none'}}>
          <div className="content-card" style={{cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s'}} onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}} onMouseLeave={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'}}>
            <h2 style={{fontSize: '24px', marginBottom: '8px'}}>➕</h2>
            <h3 style={{fontSize: '18px', marginBottom: '8px'}}>Create IP</h3>
            <p className="text-muted">Add a new IP to your collection</p>
          </div>
        </Link>

        <Link href="/dashboard" style={{textDecoration: 'none'}}>
          <div className="content-card" style={{cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s, box-shadow 0.2s'}} onMouseEnter={e => {e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.12)'}} onMouseLeave={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'}}>
            <h2 style={{fontSize: '24px', marginBottom: '8px'}}>📊</h2>
            <h3 style={{fontSize: '18px', marginBottom: '8px'}}>View All IPs</h3>
            <p className="text-muted">Manage your IP portfolio</p>
          </div>
        </Link>
      </div>
    </>
  )
}
