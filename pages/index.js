import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../lib/authContext'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return <p>Loading...</p>
}
