import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useTheme } from '../lib/themeContext'
import { useAuth } from '../lib/authContext'
import { supabase } from '../lib/supabaseClient'

export default function SettingsButton() {
  const { darkMode, toggleDarkMode } = useTheme()
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setShowDeleteConfirm(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will delete all your IPs, worlds, and content.')) {
      setShowDeleteConfirm(false)
      return
    }

    try {
      // Delete all user data first
      const { data: ips, error: ipsError } = await supabase
        .from('ips')
        .select('id')
        .eq('user_id', user.id)

      if (ipsError) throw ipsError

      if (ips && ips.length > 0) {
        const ipIds = ips.map(ip => ip.id)
        
        // Delete content items
        await supabase
          .from('content_items')
          .delete()
          .in('ip_id', ipIds)

        // Delete worlds
        await supabase
          .from('worlds')
          .delete()
          .in('ip_id', ipIds)

        // Delete IPs
        await supabase
          .from('ips')
          .delete()
          .eq('user_id', user.id)
      }

      // Sign out (user will need to contact support to fully delete account)
      await supabase.auth.signOut()
      alert('Your data has been deleted. Please contact support to complete account deletion.')
      router.push('/login')
    } catch (error) {
      alert('Error deleting account: ' + error.message)
      console.error('Delete account error:', error)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        className="settings-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Settings"
        title="Settings"
      >
        ⚙️
      </button>
      {isOpen && (
        <div className="settings-dropdown" style={{ minWidth: '280px' }}>
          {/* User Info Section */}
          {user && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {user.email?.split('@')[0] || 'User'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {user.email}
              </div>
            </div>
          )}

          {/* Appearance Section */}
          <div style={{ padding: '8px 0' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 16px 8px', marginBottom: '4px' }}>
              Appearance
            </div>
            <div className="settings-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>🌙</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Dark Mode</span>
              </div>
              <div
                className={`toggle-switch ${darkMode ? 'active' : ''}`}
                onClick={toggleDarkMode}
                role="button"
                aria-label="Toggle dark mode"
              />
            </div>
          </div>

          {/* Account Section - Only show if user is logged in */}
          {user && (
            <div style={{ padding: '8px 0', borderTop: '1px solid var(--border-color)', marginTop: '8px' }}>
              <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 16px 8px', marginBottom: '4px' }}>
                Account
              </div>
              <div
                className="settings-item"
                onClick={handleLogout}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>🚪</span>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>Sign Out</span>
                </div>
              </div>
              {showDeleteConfirm ? (
                <div style={{ padding: '12px 16px', background: 'var(--bg-tertiary)', borderRadius: '6px', margin: '8px 16px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    Delete your account permanently?
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleDeleteAccount}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="settings-item"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ cursor: 'pointer', color: '#dc3545' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>🗑️</span>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Delete Account</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Help & Support Section */}
          <div style={{ padding: '8px 0', borderTop: '1px solid var(--border-color)', marginTop: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 16px 8px', marginBottom: '4px' }}>
              Help & Support
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="settings-item"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>📚</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Documentation</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>→</span>
            </a>
            <a
              href="mailto:support@kinly.com"
              className="settings-item"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>💬</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>Contact Support</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>→</span>
            </a>
          </div>

          {/* About Section */}
          <div style={{ padding: '8px 0', borderTop: '1px solid var(--border-color)', marginTop: '8px' }}>
            <div style={{ padding: '12px 16px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Kinly IP Platform</div>
              <div>Version 1.0.0</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
