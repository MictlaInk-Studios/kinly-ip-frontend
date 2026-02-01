import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

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
          password,
          options: { 
            emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth-confirm`
          }
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Check your email to confirm signup.' })
        setEmail('')
        setPassword('')
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
    <div style={{padding:40,fontFamily:'sans-serif',maxWidth:500,margin:'0 auto'}}>
      <h1>{isSignUp ? 'Sign Up' : 'Login'}</h1>
      <form onSubmit={handleAuth}>
        <div style={{marginBottom:12}}>
          <label>Email</label><br />
          <input 
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{width:'100%'}}
          />
        </div>
        <div style={{marginBottom:12}}>
          <label>Password</label><br />
          <input 
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{width:'100%'}}
          />
        </div>
        <div style={{marginBottom:12}}>
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </div>
      </form>
      {message && (
        <div style={{marginTop:12,color: message.type === 'error' ? 'red' : 'green'}}>
          {message.text}
        </div>
      )}
      <p style={{marginTop:20}}>
        {isSignUp ? 'Already have an account? ' : 'No account? '}
        <button 
          onClick={() => setIsSignUp(!isSignUp)}
          style={{background:'none',border:'none',color:'blue',cursor:'pointer',textDecoration:'underline'}}
        >
          {isSignUp ? 'Login' : 'Sign Up'}
        </button>
      </p>
    </div>
  )
}
