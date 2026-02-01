import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import SettingsButton from '../components/SettingsButton'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Signup successful! Logging you in...' })
        setEmail('')
        setPassword('')
        // Auto-login after signup
        setTimeout(() => router.push('/'), 1000)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) throw error
        router.push('/')
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', position: 'relative'}}>
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <SettingsButton />
      </div>
      <div className="content-card" style={{width: '100%', maxWidth: '400px'}}>
        <h1 className="text-center">{isSignUp ? 'Create Account' : 'Login'}</h1>
        <p className="text-center text-muted">Kinly IP Creation Platform</p>

        <form onSubmit={handleAuth}>
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{width: '100%'}}>
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </form>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <p className="text-center" style={{marginTop: '20px', fontSize: '14px'}}>
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button 
            className="btn-secondary"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}
