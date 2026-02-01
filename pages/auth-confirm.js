import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { supabase } from '../lib/supabaseClient'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function AuthConfirm() {
  const router = useRouter()
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('confirming')

  useEffect(() => {
    const handleConfirm = async () => {
      if (router.query.error) {
        setError(router.query.error_description || 'Authentication failed')
        setStatus('error')
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setStatus('success')
        setTimeout(() => router.push('/dashboard'), 1500)
      } else {
        setError('No session found. Try signing up again.')
        setStatus('error')
      }
    }

    if (router.isReady) {
      handleConfirm()
    }
  }, [router.isReady, router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: '20px'
    }}>
      <Card style={{ maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        {status === 'confirming' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
            <h2 style={{ marginBottom: '12px' }}>Confirming your email...</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Please wait while we verify your account.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
            <h2 style={{ marginBottom: '12px', color: '#28a745' }}>Email confirmed!</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Redirecting to dashboard...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>❌</div>
            <h2 style={{ marginBottom: '12px', color: '#dc3545' }}>Confirmation Failed</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Error: {error}</p>
            <Link href="/login">
              <Button variant="primary">Try signing up again</Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  )
}
