import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../lib/themeContext'

export default function SettingsButton() {
  const { darkMode, toggleDarkMode } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

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
        <div className="settings-dropdown">
          <div className="settings-item">
            <span style={{ fontSize: '14px', fontWeight: '500' }}>Dark Mode</span>
            <div
              className={`toggle-switch ${darkMode ? 'active' : ''}`}
              onClick={toggleDarkMode}
              role="button"
              aria-label="Toggle dark mode"
            />
          </div>
        </div>
      )}
    </div>
  )
}
