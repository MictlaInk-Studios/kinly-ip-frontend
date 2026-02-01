import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'

export default function AuthConfirm() {
  const router = useRouter()
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('confirming')

  useEffect(() => {
    const handleConfirm = async () => {
      // Check for error in URL
      if (router.query.error) {
        setError(router.query.error_description || 'Authentication failed')
        setStatus('error')
        return
      }

      // Supabase automatically creates the session from the hash
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setStatus('success')
        setTimeout(() => router.push('/'), 1500)
      } else {
        setError('No session found. Try signing up again.')
        setStatus('error')
      }
    }

    if (router.isReady) {
      handleConfirm()
    }
  }, [router.isReady])

  return (
    <div style={{padding:40,fontFamily:'sans-serif',maxWidth:500,margin:'0 auto'}}>
      {status === 'confirming' && <p>Confirming your email...</p>}
      {status === 'success' && <p style={{color:'green'}}>Email confirmed! Redirecting...</p>}
      {status === 'error' && (
        <div style={{color:'red'}}>
          <p>Error: {error}</p>
          <p>
            <Link href="/login">Try signing up again</Link>
          </p>
        </div>
      )}
    </div>
  )
}

