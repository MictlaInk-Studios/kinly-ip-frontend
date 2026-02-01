export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  style = {}
}) {
  const baseStyle = {
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ...style
  }

  // Size variants
  if (size === 'sm') {
    baseStyle.padding = '8px 16px'
    baseStyle.fontSize = '13px'
  } else if (size === 'md') {
    baseStyle.padding = '12px 24px'
    baseStyle.fontSize = '14px'
  } else if (size === 'lg') {
    baseStyle.padding = '16px 32px'
    baseStyle.fontSize = '16px'
  }

  // Color variants
  if (variant === 'primary') {
    baseStyle.backgroundColor = 'var(--gold-primary)'
    baseStyle.color = 'var(--bg-base)'
  } else if (variant === 'secondary') {
    baseStyle.backgroundColor = 'var(--oak-base)'
    baseStyle.color = 'var(--text-primary)'
    baseStyle.border = '1px solid var(--border-default)'
  } else if (variant === 'ghost') {
    baseStyle.backgroundColor = 'transparent'
    baseStyle.color = 'var(--text-secondary)'
  } else if (variant === 'danger') {
    baseStyle.backgroundColor = '#DC3545'
    baseStyle.color = 'white'
  }

  if (disabled) {
    baseStyle.opacity = '0.5'
  }

  const handleMouseEnter = (e) => {
    if (disabled) return
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = 'var(--gold-muted)'
      e.currentTarget.style.transform = 'scale(0.98)'
    } else if (variant === 'secondary') {
      e.currentTarget.style.backgroundColor = 'var(--oak-hover)'
      e.currentTarget.style.transform = 'scale(0.98)'
    } else if (variant === 'ghost') {
      e.currentTarget.style.backgroundColor = 'var(--bg-surface)'
      e.currentTarget.style.color = 'var(--text-primary)'
    } else if (variant === 'danger') {
      e.currentTarget.style.backgroundColor = '#C82333'
      e.currentTarget.style.transform = 'scale(0.98)'
    }
  }

  const handleMouseLeave = (e) => {
    if (disabled) return
    if (variant === 'primary') {
      e.currentTarget.style.backgroundColor = 'var(--gold-primary)'
      e.currentTarget.style.transform = 'scale(1)'
    } else if (variant === 'secondary') {
      e.currentTarget.style.backgroundColor = 'var(--oak-base)'
      e.currentTarget.style.transform = 'scale(1)'
    } else if (variant === 'ghost') {
      e.currentTarget.style.backgroundColor = 'transparent'
      e.currentTarget.style.color = 'var(--text-secondary)'
    } else if (variant === 'danger') {
      e.currentTarget.style.backgroundColor = '#DC3545'
      e.currentTarget.style.transform = 'scale(1)'
    }
  }

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  )
}
