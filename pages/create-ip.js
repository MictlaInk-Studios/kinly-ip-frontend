import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/authContext'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Link from 'next/link'

export default function CreateIP() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [owner, setOwner] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.from('ips').insert([{
      title,
      description,
      owner,
      user_id: user.id
    }])

    setLoading(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
      return
    }
    setMessage({ type: 'success', text: 'IP created successfully!' })
    setTitle('')
    setDescription('')
    setOwner('')
    setTimeout(() => router.push('/dashboard'), 1000)
  }

  if (authLoading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  if (!user) return null

  return (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '32px', fontWeight: '700' }}>Create New IP</h1>
        <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
          Add a new intellectual property to your portfolio
        </p>
      </div>

      <Card style={{ maxWidth: '700px' }}>
        <form onSubmit={handleSubmit}>
          <Input
            label="Title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Innovative Algorithm Design"
            required
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your IP..."
            required
            rows={6}
          />

          <Input
            label="Owner"
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Your name or company"
            required
          />

          {message && (
            <div style={{
              marginBottom: '20px',
              padding: '12px 16px',
              borderRadius: '8px',
              background: message.type === 'success' ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
              border: `1px solid ${message.type === 'success' ? 'rgba(40, 167, 69, 0.3)' : 'rgba(220, 53, 69, 0.3)'}`,
              color: message.type === 'success' ? '#28a745' : '#dc3545',
              fontSize: '14px'
            }}>
              {message.text}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Creating...' : 'Create IP'}
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost" size="lg">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </>
  )
}
