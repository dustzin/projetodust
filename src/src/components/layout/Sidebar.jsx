// Sidebar — DUST OS v2.5 Navigation

const NAV_ITEMS = [
  {
    section: 'ROTINA',
    items: [
      {
        id: 'dquests',
        label: 'D-Quests',
        accent: 'var(--scout-primary)',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        ),
      }
    ]
  },
  {
    section: 'CONHECIMENTO',
    items: [
      {
        id: 'readings',
        label: 'Artigos',
        accent: 'var(--read-primary)',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        ),
      },
      {
        id: 'hobbies',
        label: 'Hobbies Hub',
        accent: 'var(--data-primary)',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        ),
      },
    ]
  },
  {
    section: 'SISTEMA',
    items: [
      {
        id: 'config',
        label: 'Configuração',
        accent: 'var(--text-muted)',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        ),
      },
    ]
  }
]

export default function Sidebar({ active, onChange }) {
  return (
    <div className="sidebar">
      {NAV_ITEMS.map(group => (
        <div key={group.section}>
          <div className="sidebar-section-label">{group.section}</div>
          {group.items.map(item => (
            <button
              key={item.id}
              className={`nav-item ${active === item.id ? 'active' : ''}`}
              style={{ '--module-accent': item.accent }}
              onClick={() => onChange(item.id)}
            >
              <span className="nav-item-icon" style={{
                color: active === item.id ? item.accent : 'var(--text-ghost)'
              }}>
                {item.icon}
              </span>
              <span className="nav-item-label">{item.label}</span>
            </button>
          ))}
        </div>
      ))}

      {/* Bottom version */}
      <div className="sidebar-bottom" style={{ padding: '12px 14px' }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '8px',
          color: 'var(--text-ghost)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase'
        }}>
          DUST OS / PERSONAL CORE
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '8px',
          color: 'var(--text-ghost)',
          marginTop: '2px'
        }}>
          v2.5 — Life & Hobbies
        </div>
      </div>
    </div>
  )
}
