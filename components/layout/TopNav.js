import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../../lib/authContext'
import { supabase } from '../../lib/supabaseClient'
import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../../lib/themeContext'

export default function TopNav() {
  const router = useRouter()
  const { user } = useAuth()
  const { darkMode, toggleDarkMode } = useTheme()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Projects', path: '/dashboard' },
    { label: 'Templates', path: '/dashboard' },
    { label: 'Community', path: '/dashboard' },
    { label: 'Docs', path: '/dashboard' },
    { label: 'Pricing', path: '/dashboard' }
  ]

  return (
    <nav style={{
      height: '56px',
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
      background: 'var(--bg-surface)'
    }}>
      {/* Left: Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: `linear-gradient(135deg, var(--gold-primary), var(--gold-muted))`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: '700',
          color: 'var(--bg-base)'
        }}>
          K
        </div>
        <span style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
          Kinly
        </span>
      </div>

      {/* Center: Nav Links */}
      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        {navItems.map(item => (
          <Link key={item.path} href={item.path}>
            <a
              style={{
                fontSize: '14px',
                fontWeight: router.pathname === item.path ? '600' : '400',
                color: router.pathname === item.path ? 'var(--gold-primary)' : 'var(--text-secondary)',
                transition: 'color 0.15s ease',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--gold-primary)'}
              onMouseLeave={(e) => e.target.style.color = router.pathname === item.path ? 'var(--gold-primary)' : 'var(--text-secondary)'}
            >
              {item.label}
            </a>
          </Link>
        ))}
      </div>

      {/* Right: User Menu */}
      <div style={{ position: 'relative' }} ref={userMenuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '16px',
            color: 'var(--text-primary)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--oak-base)'
            e.currentTarget.style.borderColor = 'var(--gold-primary)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-surface-elevated)'
            e.currentTarget.style.borderColor = 'var(--border-default)'
          }}
        >
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </button>

        {userMenuOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '200px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-lg)',
            padding: '8px',
            zIndex: 1000
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)', marginBottom: '4px' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {user?.email?.split('@')[0] || 'User'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {user?.email}
              </div>
            </div>
            <Link href="/dashboard">
              <a
                style={{
                  display: 'block',
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  transition: 'background 0.15s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Profile
              </a>
            </Link>
            <Link href="/dashboard">
              <a
                style={{
                  display: 'block',
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  transition: 'background 0.15s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Settings
              </a>
            </Link>
            <Link href="/dashboard">
              <a
                style={{
                  display: 'block',
                  padding: '10px 16px',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  borderRadius: '8px',
                  transition: 'background 0.15s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Billing
              </a>
            </Link>
            <div style={{ height: '1px', background: 'var(--border-default)', margin: '4px 0' }} />
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 16px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Sign Out
            </button>
            <div style={{ height: '1px', background: 'var(--border-default)', margin: '4px 0' }} />
            <div
              onClick={toggleDarkMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 16px',
                fontSize: '14px',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span>Dark Mode</span>
              <div style={{
                width: '40px',
                height: '20px',
                borderRadius: '10px',
                background: darkMode ? 'var(--gold-primary)' : 'var(--border-default)',
                position: 'relative',
                transition: 'background 0.15s ease'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '2px',
                  left: darkMode ? '22px' : '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: 'white',
                  transition: 'left 0.15s ease'
                }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
