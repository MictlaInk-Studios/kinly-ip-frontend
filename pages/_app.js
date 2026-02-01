import '../styles/globals.css'
import { AuthProvider, useAuth } from '../lib/authContext'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

function Header() {
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Don't show header on login page
  if (router.pathname === '/login') return null

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link href="/" className="logo">Kinly</Link>
          {user && (
            <div className="nav-links">
              <Link href="/">Home</Link>
              <Link href="/create-ip">Create IP</Link>
              <Link href="/dashboard">Dashboard</Link>
              <div className="user-info">
                {user.email}
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

function AppContent({ Component, pageProps }) {
  return (
    <div className="page-wrapper">
      <Header />
      <main className="main">
        <div className="container">
          <Component {...pageProps} />
        </div>
      </main>
    </div>
  )
}

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  )
}
