export default function Input({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  error,
  style = {},
  ...props 
}) {
  return (
    <div style={{ marginBottom: '20px', ...style }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          marginBottom: '8px'
        }}>
          {label}
          {required && <span style={{ color: 'var(--gold-primary)', marginLeft: '4px' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '14px',
          backgroundColor: 'var(--bg-surface)',
          border: `1px solid ${error ? '#DC3545' : 'var(--border-default)'}`,
          borderRadius: '8px',
          color: 'var(--text-primary)',
          transition: 'all 0.15s ease',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--gold-primary)'
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(201, 162, 77, 0.1)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? '#DC3545' : 'var(--border-default)'
          e.currentTarget.style.boxShadow = 'none'
        }}
        {...props}
      />
      {error && (
        <div style={{ fontSize: '12px', color: '#DC3545', marginTop: '4px' }}>
          {error}
        </div>
      )}
    </div>
  )
}
