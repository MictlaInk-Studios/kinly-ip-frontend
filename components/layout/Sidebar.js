import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Sidebar() {
  const router = useRouter()

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    { label: 'Projects', path: '/dashboard', icon: '📁' },
    { label: 'Templates', path: '/dashboard', icon: '📋' },
    { label: 'Community', path: '/dashboard', icon: '👥' },
    { label: 'Settings', path: '/dashboard', icon: '⚙️' },
    { label: 'Billing', path: '/dashboard', icon: '💳' }
  ]

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-default)',
      padding: '24px 0',
      overflowY: 'auto',
      height: '100%'
    }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 16px' }}>
        {navItems.map(item => {
          const isActive = router.pathname === item.path
          return (
            <Link key={item.path} href={item.path}>
              <a
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--gold-primary)' : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'var(--oak-base)'
                    e.currentTarget.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
