import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/authContext'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <p style={{padding:40}}>Loading...</p>
  if (!user) return null

  return (
    <div style={{padding:40,fontFamily:'sans-serif',maxWidth:1000}}>
      <h1>Kinly — IP Creation Dashboard</h1>
      <p style={{fontSize:'0.9em',color:'#666'}}>Logged in as: {user.email}</p>
      <p>
        <Link href="/create-ip">Create New IP</Link> | <Link href="/dashboard">View All IPs</Link> | 
        <button 
          onClick={handleLogout}
          style={{background:'none',border:'none',color:'blue',cursor:'pointer',textDecoration:'underline',marginLeft:4}}
        >
          Logout
        </button>
      </p>
    </div>
  )
}
