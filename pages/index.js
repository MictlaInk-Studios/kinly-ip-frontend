import Link from 'next/link'
import { useAuth } from '../lib/authContext'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <div style={{padding:40,fontFamily:'sans-serif'}}>
      <h1>Kinly — IP Creation</h1>
      <p>A minimal frontend sample for IP creation using Supabase.</p>
      {user ? (
        <p>
          <Link href="/create-ip">Create an IP</Link> | <Link href="/dashboard">Dashboard</Link> |
          <button 
            onClick={handleLogout}
            style={{background:'none',border:'none',color:'blue',cursor:'pointer',textDecoration:'underline',marginLeft:4}}
          >
            Logout
          </button>
        </p>
      ) : (
        <p>
          <Link href="/auth">Login / Sign Up</Link>
        </p>
      )}
    </div>
  )
}
