import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function AuthConfirm() {
  const router = useRouter()

  useEffect(() => {
    const handleConfirm = async () => {
      // Supabase automatically creates the session from the hash
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Session is established, redirect to home
        router.push('/')
      } else {
        // No session, redirect to login
        router.push('/login')
      }
    }

    handleConfirm()
  }, [router])

  return <p style={{padding:40}}>Confirming your email...</p>
}
