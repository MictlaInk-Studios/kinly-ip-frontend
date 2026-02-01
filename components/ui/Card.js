export default function Card({ children, className = '', style = {}, onClick, hover = false }) {
  const baseStyle = {
    backgroundColor: 'var(--bg-surface-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.15s ease',
    ...style
  }

  if (hover) {
    baseStyle.cursor = 'pointer'
  }

  return (
    <div
      className={className}
      style={baseStyle}
      onClick={onClick}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
        e.currentTarget.style.transform = 'translateY(0)'
      } : undefined}
    >
      {children}
    </div>
  )
}
