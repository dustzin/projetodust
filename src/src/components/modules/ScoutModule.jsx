import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

const API = 'http://127.0.0.1:5174'

const PRESET_QUERIES = [
  'CRM para holdings familiares',
  'SaaS gestão de investimentos',
  'Automação fiscal para MEI',
  'ERP para agronegócio',
  'Plataforma de crédito B2B',
  'BI para private equity',
  'Dashboard de compliance ESG',
  'Gestão de FIIs e fundos',
]

// ─────────────────────────────────────────────
// Toast System
// ─────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 16px',
          background: 'var(--bg-card)',
          border: `1px solid ${t.type === 'success' ? 'rgba(0,230,118,0.3)' : t.type === 'error' ? 'rgba(255,23,68,0.3)' : 'var(--border-mid)'}`,
          borderRadius: '3px',
          boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 16px ${t.type === 'success' ? 'rgba(0,230,118,0.08)' : 'transparent'}`,
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          color: t.type === 'success' ? 'var(--scout-primary)' : t.type === 'error' ? 'var(--loss)' : 'var(--text-secondary)',
          letterSpacing: '0.06em',
          pointerEvents: 'all',
          cursor: 'pointer',
          animation: 'toastIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          minWidth: '220px',
        }} onClick={() => onDismiss(t.id)}>
          <span style={{ fontSize: '13px', flexShrink: 0 }}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  )
}

function useToast() {
  const [toasts, setToasts] = useState([])
  const add = useCallback((message, type = 'info', duration = 2800) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])
  const dismiss = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), [])
  return { toasts, add, dismiss }
}

// ─────────────────────────────────────────────
// Radar SVG — scanning animation
// ─────────────────────────────────────────────
function RadarScan({ active, size = 120 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 8
  const rings = [0.33, 0.66, 1]
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ opacity: active ? 1 : 0.25, transition: 'opacity 0.4s' }}>
      <defs>
        <radialGradient id="radarGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,230,118,0.15)" />
          <stop offset="100%" stopColor="rgba(0,230,118,0)" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Rings */}
      {rings.map((rr, i) => (
        <circle key={i} cx={cx} cy={cy} r={r * rr}
          fill="none" stroke="rgba(0,230,118,0.12)" strokeWidth="1"
        />
      ))}
      {/* Cross-hairs */}
      <line x1={cx} y1={8} x2={cx} y2={size - 8} stroke="rgba(0,230,118,0.08)" strokeWidth="1" />
      <line x1={8} y1={cy} x2={size - 8} y2={cy} stroke="rgba(0,230,118,0.08)" strokeWidth="1" />
      {/* Sweep */}
      {active && (
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'radarSweep 2s linear infinite' }}>
          <path
            d={`M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r * Math.sin(Math.PI * 0.5)} ${cy - r * Math.cos(Math.PI * 0.5)} Z`}
            fill="url(#radarGrad)"
          />
          <line x1={cx} y1={cy} x2={cx} y2={cy - r}
            stroke="var(--scout-primary)" strokeWidth="1.5" filter="url(#glow)" />
        </g>
      )}
      {/* Center dot */}
      <circle cx={cx} cy={cy} r="3" fill="var(--scout-primary)" filter="url(#glow)" />
      {active && (
        <>
          {/* Blips */}
          <circle cx={cx + r * 0.4} cy={cy - r * 0.55} r="2.5" fill="var(--scout-primary)" opacity="0.8"
            style={{ animation: 'blipPulse 1.8s 0.3s ease-in-out infinite' }} />
          <circle cx={cx - r * 0.6} cy={cy + r * 0.2} r="1.8" fill="var(--read-primary)" opacity="0.6"
            style={{ animation: 'blipPulse 2.1s 0.8s ease-in-out infinite' }} />
          <circle cx={cx + r * 0.15} cy={cy + r * 0.7} r="2" fill="var(--data-primary)" opacity="0.5"
            style={{ animation: 'blipPulse 1.5s 1.2s ease-in-out infinite' }} />
        </>
      )}
    </svg>
  )
}

// ─────────────────────────────────────────────
// Score Gauge (SVG arc)
// ─────────────────────────────────────────────
function ScoreGauge({ score, size = 56 }) {
  const max = 20
  const pct = Math.min(score / max, 1)
  const r = (size / 2) - 5
  const circ = 2 * Math.PI * r
  const arcLength = circ * 0.75
  const filled = arcLength * pct
  const color =
    score >= 15 ? 'var(--scout-primary)' :
    score >= 10 ? 'var(--read-primary)' :
    score >= 6  ? 'var(--data-primary)' : 'var(--text-ghost)'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <defs>
        <filter id={`gaugeGlow${size}`}>
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.05)" strokeWidth="4"
        strokeDasharray={`${arcLength} ${circ - arcLength}`}
        strokeDashoffset={circ * 0.125} strokeLinecap="round"
      />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="4"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeDashoffset={circ * 0.125} strokeLinecap="round"
        filter={`url(#gaugeGlow${size})`}
        style={{ transition: 'stroke-dasharray 0.7s cubic-bezier(0.4,0,0.2,1)' }}
      />
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={size < 50 ? '9' : '11'} fontWeight="800"
        fontFamily="JetBrains Mono, monospace"
      >
        {score.toFixed(1)}
      </text>
    </svg>
  )
}

// ─────────────────────────────────────────────
// Score Distribution mini-bars
// ─────────────────────────────────────────────
function ScoreDistribution({ opportunities }) {
  if (opportunities.length === 0) return null
  const buckets = [
    { label: '0–5',  min: 0,  max: 6,  color: 'var(--text-ghost)' },
    { label: '6–9',  min: 6,  max: 10, color: 'var(--data-primary)' },
    { label: '10–14',min: 10, max: 15, color: 'var(--read-primary)' },
    { label: '15–20',min: 15, max: 21, color: 'var(--scout-primary)' },
  ]
  const counts = buckets.map(b => opportunities.filter(o => {
    const s = o.goldScore || 0; return s >= b.min && s < b.max
  }).length)
  const maxCount = Math.max(...counts, 1)

  return (
    <div style={{
      background: 'var(--bg-card)', border: '1px solid var(--border-dim)',
      borderRadius: '3px', padding: '10px 12px', marginBottom: '12px',
    }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '7px', letterSpacing: '0.16em', color: 'var(--text-ghost)', marginBottom: '8px' }}>
        DISTRIBUIÇÃO DE SCORES
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '32px' }}>
        {buckets.map((b, i) => (
          <div key={b.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{
              width: '100%', borderRadius: '1px',
              height: `${(counts[i] / maxCount) * 100}%`,
              background: b.color,
              opacity: counts[i] === 0 ? 0.1 : 0.7,
              minHeight: counts[i] > 0 ? '3px' : '0',
              transition: 'height 0.5s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
        {buckets.map((b, i) => (
          <div key={b.label} style={{ flex: 1, textAlign: 'center', fontFamily: 'JetBrains Mono, monospace', fontSize: '7px', color: b.color, opacity: counts[i] === 0 ? 0.3 : 1 }}>
            {counts[i]}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Quick Stats Bar
// ─────────────────────────────────────────────
function QuickStats({ opportunities }) {
  if (opportunities.length === 0) return null
  const scores = opportunities.map(o => o.goldScore || 0)
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const best = Math.max(...scores)
  const highCount = scores.filter(s => s >= 15).length

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '10px' }}>
      {[
        { label: 'TOTAL',      value: opportunities.length, color: 'var(--text-secondary)' },
        { label: 'MÉDIA',      value: avg.toFixed(1),        color: 'var(--data-primary)' },
        { label: 'MELHOR',     value: best.toFixed(1),       color: 'var(--read-primary)' },
        { label: 'GOLD ≥15',   value: highCount,             color: 'var(--scout-primary)' },
      ].map(s => (
        <div key={s.label} style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-dim)',
          borderRadius: '3px', padding: '8px 10px',
        }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '7px', letterSpacing: '0.16em', color: 'var(--text-ghost)', marginBottom: '3px' }}>{s.label}</div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '17px', fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────
// Markdown renderer
// ─────────────────────────────────────────────
function MarkdownBlock({ text }) {
  if (!text) return null
  const lines = text.split('\n')
  return (
    <div className="dust-markdown">
      {lines.map((line, i) => {
        if (line.startsWith('# '))   return <h1 key={i}>{line.slice(2)}</h1>
        if (line.startsWith('## '))  return <h2 key={i}>{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>
        if (line.startsWith('- '))   return (
          <p key={i} style={{ marginLeft: '12px', marginBottom: '3px', fontSize: '11px' }}>
            <span style={{ color: 'var(--scout-primary)', marginRight: '6px' }}>▸</span>
            {line.slice(2).replace(/\*\*(.+?)\*\*/g, '$1')}
          </p>
        )
        if (line.trim() === '') return <div key={i} style={{ height: '8px' }} />
        return (
          <p key={i} style={{ marginBottom: '4px', fontSize: '11px' }}
            dangerouslySetInnerHTML={{
              __html: line
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/`(.+?)`/g, '<code style="font-family:JetBrains Mono,monospace;font-size:10px;background:var(--bg-surface);padding:1px 4px;border-radius:2px;color:var(--scout-primary)">$1</code>')
            }}
          />
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────
// Collapsible section
// ─────────────────────────────────────────────
function Section({ title, accent, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: '12px', border: '1px solid var(--border-dim)', borderRadius: '3px', overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '8px 12px', background: 'var(--bg-surface)', border: 'none', cursor: 'pointer',
          fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', fontWeight: 600,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: accent || 'var(--text-muted)',
        }}
      >
        {title}
        <span style={{ fontSize: '10px', color: 'var(--text-ghost)', transition: 'transform 0.2s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
          ▾
        </span>
      </button>
      {open && (
        <div style={{ padding: '10px 12px', background: 'var(--bg-card)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Opportunity Card
// ─────────────────────────────────────────────
function OpportunityCard({ opp, onSelect, selected, onDelete, onFavorite, isFavorite }) {
  const score = opp.goldScore || 0
  const scoreColor =
    score >= 15 ? 'var(--scout-primary)' :
    score >= 10 ? 'var(--read-primary)' :
    score >= 6  ? 'var(--data-primary)' : 'var(--text-ghost)'

  return (
    <div
      className="gold-card fade-in"
      onClick={() => onSelect(opp)}
      style={{
        borderColor: selected ? 'var(--scout-primary)' : undefined,
        boxShadow: selected
          ? '0 0 0 1px rgba(0,230,118,0.2), 0 4px 24px rgba(0,230,118,0.08), inset 0 0 40px rgba(0,230,118,0.015)'
          : undefined,
        position: 'relative',
        transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Actions top-right */}
      <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '2px' }}>
        <button
          onClick={e => { e.stopPropagation(); onFavorite(opp.id) }}
          title="Favoritar"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: isFavorite ? 'var(--read-primary)' : 'var(--text-ghost)',
            fontSize: '11px', padding: '2px 4px', borderRadius: '2px', lineHeight: 1,
            transition: 'color 0.15s',
          }}
        >
          {isFavorite ? '★' : '☆'}
        </button>
        <button
          onClick={e => { e.stopPropagation(); onDelete(opp.id) }}
          title="Remover"
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'var(--text-ghost)', fontSize: '11px', padding: '2px 4px',
            borderRadius: '2px', lineHeight: 1, opacity: 0.5, transition: 'opacity 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.color = 'var(--loss)' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.color = 'var(--text-ghost)' }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px', paddingRight: '48px' }}>
        <ScoreGauge score={score} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 600,
            color: 'var(--text-primary)', marginBottom: '2px',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {isFavorite && <span style={{ color: 'var(--read-primary)', marginRight: '5px' }}>★</span>}
            {opp.title || opp.query}
          </div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'var(--text-ghost)', letterSpacing: '0.06em' }}>
            {new Date(opp.timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {opp.criticalFlaw && (
        <div style={{
          fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace',
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          marginBottom: '8px', lineHeight: '1.5',
        }}>
          {opp.criticalFlaw}
        </div>
      )}

      {/* Score bar */}
      <div style={{ height: '2px', background: 'var(--border-dim)', borderRadius: '1px', marginBottom: '8px' }}>
        <div style={{
          height: '100%', borderRadius: '1px',
          width: `${Math.min((score / 20) * 100, 100)}%`,
          background: scoreColor,
          boxShadow: `0 0 6px ${scoreColor}`,
          transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>

      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        {opp.offer && <span className="badge badge-scout">OFERTA ✓</span>}
        {opp.page  && <span className="badge badge-data">PÁGINA ✓</span>}
        {opp.target?.url && (
          <span className="badge badge-neutral"
            onClick={e => { e.stopPropagation(); window.open(opp.target.url, '_blank') }}
            style={{ cursor: 'pointer' }}>↗ SRC</span>
        )}
        <span className="badge" style={{
          marginLeft: 'auto',
          color: selected ? 'var(--scout-primary)' : 'var(--text-ghost)',
          borderColor: selected ? 'rgba(0,230,118,0.3)' : 'var(--border-dim)',
          background: 'transparent',
        }}>
          {selected ? '● ABERTO' : 'VER DETALHE'}
        </span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN SCOUT MODULE
// ─────────────────────────────────────────────
export default function ScoutModule() {
  const [tab, setTab]               = useState('scan')
  const [query, setQuery]           = useState('')
  const [scanning, setScanning]     = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanLog, setScanLog]       = useState([])

  const [opportunities, setOpportunities] = useState([])
  const [selectedOpp, setSelectedOpp]     = useState(null)
  const [generating, setGenerating]       = useState(false)
  const [generatingPage, setGeneratingPage] = useState(false)

  const [trends, setTrends]               = useState([])
  const [trendsLoading, setTrendsLoading] = useState(false)

  const [daemonRunning, setDaemonRunning] = useState(false)

  // Filters
  const [sortBy, setSortBy]           = useState('date')
  const [minScore, setMinScore]       = useState(0)
  const [searchFilter, setSearchFilter] = useState('')
  const [showFavOnly, setShowFavOnly] = useState(false)

  // Favorites (persisted in localStorage)
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('scout_favorites') || '[]') }
    catch { return [] }
  })

  // Copy feedback
  const [copied, setCopied] = useState(false)

  const terminalRef = useRef(null)
  const { toasts, add: addToast, dismiss: dismissToast } = useToast()

  // Persist favorites
  useEffect(() => {
    localStorage.setItem('scout_favorites', JSON.stringify(favorites))
  }, [favorites])

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight
  }, [scanLog])

  useEffect(() => { loadOpportunities() }, [])

  useEffect(() => {
    async function checkDaemon() {
      try {
        const r = await fetch(`${API}/api/scout/daemon?action=status`)
        const d = await r.json()
        setDaemonRunning(d.running)
      } catch {}
    }
    checkDaemon()
  }, [])

  const loadOpportunities = useCallback(async () => {
    try {
      const r = await fetch(`${API}/api/scout/opportunities`)
      const d = await r.json()
      if (Array.isArray(d)) setOpportunities(d)
    } catch (e) {
      console.error('[SCOUT] Failed to load opportunities:', e)
    }
  }, [])

  const runScan = useCallback(async () => {
    if (!query.trim() || scanning) return
    setScanning(true)
    setScanResult(null)
    setScanLog([
      { type: 'prompt', text: `> TARGET: "${query}"` },
      { type: 'info',   text: '> Inicializando SCOUT Engine v2...' },
      { type: 'info',   text: '> Consultando gaps de mercado e falhas de plataforma...' },
    ])
    try {
      const r = await fetch(`${API}/api/scout/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      })
      const d = await r.json()
      if (d.success && d.opportunity) {
        setScanResult(d.opportunity)
        setScanLog(prev => [
          ...prev,
          { type: 'prompt', text: `> VARREDURA CONCLUÍDA ─────────` },
          { type: 'info',   text: `> GOLD SCORE: ${(d.opportunity.goldScore || 0).toFixed(1)} / 20.0` },
          { type: 'info',   text: `> ${d.opportunity.title || 'Oportunidade detectada'}` },
        ])
        await loadOpportunities()
        addToast(`Gold Score ${(d.opportunity.goldScore || 0).toFixed(1)} — ${d.opportunity.title || 'nova oportunidade'}`, 'success')
      } else {
        setScanLog(prev => [...prev, { type: 'error', text: `> ERRO: ${d.error || 'Falha na varredura'}` }])
        addToast('Falha na varredura', 'error')
      }
    } catch (e) {
      setScanLog(prev => [...prev, { type: 'error', text: `> CONEXÃO RECUSADA: ${e.message}` }])
      addToast('Sem conexão com o servidor', 'error')
    } finally {
      setScanning(false)
    }
  }, [query, scanning, loadOpportunities, addToast])

  const generateOffer = useCallback(async (opp) => {
    if (!opp || generating) return
    setGenerating(true)
    try {
      const r = await fetch(`${API}/api/scout/generate-offer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oppId: opp.id }),
      })
      const d = await r.json()
      if (d.success) {
        await loadOpportunities()
        setSelectedOpp(prev => prev ? { ...prev, offer: d.offer } : prev)
        addToast('Oferta gerada com sucesso', 'success')
      } else {
        addToast('Erro ao gerar oferta', 'error')
      }
    } catch (e) {
      addToast('Sem conexão com o servidor', 'error')
      console.error('[SCOUT] Generate offer error:', e)
    } finally {
      setGenerating(false)
    }
  }, [generating, loadOpportunities, addToast])

  const createPage = useCallback(async (opp) => {
    if (!opp || generatingPage) return
    setGeneratingPage(true)
    try {
      const r = await fetch(`${API}/api/scout/create-page`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oppId: opp.id }),
      })
      const d = await r.json()
      if (d.success && d.page?.accessLink) {
        window.open(d.page.accessLink, '_blank')
        await loadOpportunities()
        addToast('Página criada', 'success')
      }
    } catch (e) {
      addToast('Erro ao criar página', 'error')
      console.error('[SCOUT] Create page error:', e)
    } finally {
      setGeneratingPage(false)
    }
  }, [generatingPage, loadOpportunities, addToast])

  const deleteOpportunity = useCallback(async (id) => {
    try {
      await fetch(`${API}/api/scout/opportunities/${id}`, { method: 'DELETE' })
    } catch {}
    setOpportunities(prev => prev.filter(o => o.id !== id))
    if (selectedOpp?.id === id) setSelectedOpp(null)
    setFavorites(prev => prev.filter(f => f !== id))
    addToast('Oportunidade removida', 'info')
  }, [selectedOpp, addToast])

  const toggleFavorite = useCallback((id) => {
    setFavorites(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }, [])

  const exportOpportunities = useCallback(() => {
    const data = JSON.stringify(opportunities, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `scout_opportunities_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast(`${opportunities.length} oportunidades exportadas`, 'success')
  }, [opportunities, addToast])

  const copyOffer = useCallback((opp) => {
    const text = [opp.offer?.headline, '', opp.offer?.mechanism].filter(Boolean).join('\n')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      addToast('Oferta copiada para o clipboard', 'success')
      setTimeout(() => setCopied(false), 2000)
    })
  }, [addToast])

  const loadTrends = useCallback(async () => {
    setTrendsLoading(true)
    try {
      const r = await fetch(`${API}/api/forecaster/trends`)
      const d = await r.json()
      if (d.success) setTrends(d.trends || [])
    } catch (e) {
      console.error('[SCOUT] Trends error:', e)
      addToast('Erro ao carregar tendências', 'error')
    } finally {
      setTrendsLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    if (tab === 'trends' && trends.length === 0) loadTrends()
  }, [tab, trends.length, loadTrends])

  const toggleDaemon = async () => {
    const action = daemonRunning ? 'stop' : 'start'
    try {
      await fetch(`${API}/api/scout/daemon?action=${action}`, { method: 'POST' })
      setDaemonRunning(v => !v)
      addToast(action === 'start' ? 'Daemon iniciado' : 'Daemon parado', 'info')
    } catch {
      addToast('Erro ao controlar daemon', 'error')
    }
  }

  const convertTrendToOpp = async (trend) => {
    try {
      const r = await fetch(`${API}/api/scout/opportunity-from-trend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trend.title, summary: trend.summary, url: trend.url, source: trend.source }),
      })
      const d = await r.json()
      if (d.success) {
        await loadOpportunities()
        setTab('opportunities')
        addToast('Oportunidade criada a partir da tendência', 'success')
      }
    } catch (e) {
      console.error('[SCOUT] Trend-to-opp error:', e)
    }
  }

  // Keyboard shortcut: Ctrl+Enter to scan (on scan tab)
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.key === 'Enter' && tab === 'scan') runScan()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [tab, runScan])

  const filteredOpps = useMemo(() => {
    return opportunities
      .filter(o => {
        const score = o.goldScore || 0
        const title = (o.title || o.query || '').toLowerCase()
        const favOk = !showFavOnly || favorites.includes(o.id)
        return score >= minScore && (searchFilter === '' || title.includes(searchFilter.toLowerCase())) && favOk
      })
      .sort((a, b) => {
        if (sortBy === 'score') return (b.goldScore || 0) - (a.goldScore || 0)
        if (sortBy === 'fav') {
          const fa = favorites.includes(a.id), fb = favorites.includes(b.id)
          if (fa !== fb) return fa ? -1 : 1
        }
        return new Date(b.timestamp) - new Date(a.timestamp)
      })
  }, [opportunities, minScore, searchFilter, showFavOnly, sortBy, favorites])

  // ─────── RENDER ───────────────────────────────
  return (
    <div className="module-page fade-in">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Header */}
      <div className="module-header">
        <div>
          <div className="module-title" style={{ '--module-accent': 'var(--scout-primary)' }}>
            <div className="module-accent-dot" style={{ background: 'var(--scout-primary)' }} />
            FINANCIAL SCOUT
          </div>
          <div className="module-subtitle">
            Caçador de gaps · Gold Score Engine · {opportunities.length} oportunidade{opportunities.length !== 1 ? 's' : ''} ativa{opportunities.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {opportunities.length > 0 && (
            <button className="btn btn-ghost" onClick={exportOpportunities} title="Exportar como JSON" style={{ padding: '7px 10px' }}>
              ↓ JSON
            </button>
          )}
          <button className="btn btn-ghost" onClick={loadOpportunities} title="Recarregar" style={{ padding: '7px 10px' }}>
            ↻
          </button>
          <button className={`btn ${daemonRunning ? 'btn-danger' : 'btn-scout'}`} onClick={toggleDaemon}>
            {daemonRunning ? '■ PARAR DAEMON' : '▶ DAEMON AUTO'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', marginBottom: '20px', borderBottom: '1px solid var(--border-dim)' }}>
        {[
          { id: 'scan',          label: 'SCAN MANUAL' },
          { id: 'opportunities', label: `OPORTUNIDADES (${opportunities.length})` },
          { id: 'trends',        label: 'FORECASTER' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '8px 14px', border: 'none', background: 'none', cursor: 'pointer',
            color: tab === t.id ? 'var(--scout-primary)' : 'var(--text-ghost)',
            borderBottom: tab === t.id ? '2px solid var(--scout-primary)' : '2px solid transparent',
            marginBottom: '-1px', transition: 'all var(--transition)',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: SCAN ── */}
      {tab === 'scan' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Input panel */}
          <div className="dust-card">
            <div className="dust-card-header">
              <div className="dust-card-title">ALVO DE VARREDURA</div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'var(--text-ghost)', letterSpacing: '0.1em' }}>
                CTRL+ENTER
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="field-label">Query de Mercado / Software Gap</label>
                <input
                  className="dust-input"
                  placeholder="Ex: CRM para holdings, SaaS de gestão de investimentos..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runScan()}
                  style={{ fontSize: '11px' }}
                />
              </div>

              {/* Preset chips */}
              <div>
                <label className="field-label">Sugestões rápidas</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {PRESET_QUERIES.map(q => (
                    <button key={q} onClick={() => setQuery(q)} style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', fontWeight: 500,
                      letterSpacing: '0.05em', padding: '3px 8px', borderRadius: '2px',
                      border: `1px solid ${query === q ? 'rgba(0,230,118,0.5)' : 'var(--border-dim)'}`,
                      background: query === q ? 'var(--scout-dim)' : 'var(--bg-surface)',
                      color: query === q ? 'var(--scout-primary)' : 'var(--text-muted)',
                      cursor: 'pointer', transition: 'all var(--transition)',
                    }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-scout"
                style={{ width: '100%', justifyContent: 'center', padding: '11px' }}
                onClick={runScan}
                disabled={!query.trim() || scanning}
              >
                {scanning
                  ? <><span className="spinner" /> VARRENDO MERCADO...</>
                  : '▶ INICIAR VARREDURA GOLD SCORE'}
              </button>

              {/* Terminal */}
              {scanLog.length > 0 && (
                <div ref={terminalRef} className="dust-terminal" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  {scanLog.map((l, i) => (
                    <span key={i} className={`terminal-line ${l.type}`}>{l.text}</span>
                  ))}
                  {scanning && (
                    <span className="terminal-line prompt" style={{ animation: 'scanPulse 0.9s infinite' }}>
                      &gt; PROCESSANDO...
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Radar + Result panel */}
          <div className="dust-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="dust-card-header">
              <div className="dust-card-title">RESULTADO · GOLD SCORE</div>
              {scanning && <span className="badge badge-scout" style={{ animation: 'scanPulse 0.9s infinite' }}>ATIVO</span>}
            </div>

            {scanResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <ScoreGauge score={scanResult.goldScore || 0} size={80} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: '6px' }}>
                      {scanResult.title || scanResult.query}
                    </div>
                    {/* Score bar */}
                    <div style={{ height: '3px', background: 'var(--border-dim)', borderRadius: '2px', marginBottom: '6px' }}>
                      <div style={{
                        height: '100%', borderRadius: '2px',
                        width: `${Math.min(((scanResult.goldScore || 0) / 20) * 100, 100)}%`,
                        background: (scanResult.goldScore || 0) >= 15 ? 'var(--scout-primary)' : (scanResult.goldScore || 0) >= 10 ? 'var(--read-primary)' : 'var(--data-primary)',
                        transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
                      }} />
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'var(--text-ghost)' }}>
                      {(scanResult.goldScore || 0) >= 15 ? '🥇 GOLD — alta prioridade' :
                       (scanResult.goldScore || 0) >= 10 ? '🥈 SILVER — boa oportunidade' :
                       (scanResult.goldScore || 0) >= 6  ? '🥉 BRONZE — viável com ressalvas' : '⚠ BAIXO POTENCIAL'}
                    </div>
                  </div>
                </div>

                {scanResult.criticalFlaw && (
                  <Section title="Falha Crítica Detectada" accent="var(--loss)" defaultOpen>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {scanResult.criticalFlaw}
                    </div>
                  </Section>
                )}
                {scanResult.killSwitchFeature && (
                  <Section title="Kill-Switch Feature" accent="var(--scout-primary)" defaultOpen>
                    <div style={{ fontSize: '11px', color: 'var(--scout-primary)', lineHeight: 1.6 }}>
                      {scanResult.killSwitchFeature}
                    </div>
                  </Section>
                )}

                <button className="btn btn-scout" style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => { setSelectedOpp(scanResult); setTab('opportunities') }}>
                  VER DETALHE COMPLETO →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px', padding: '16px 0' }}>
                <RadarScan active={scanning} size={140} />
                <div style={{ textAlign: 'center' }}>
                  <div className="empty-state-label">{scanning ? 'Varrendo o mercado...' : 'Aguardando varredura'}</div>
                  <div className="empty-state-sub" style={{ marginTop: '4px' }}>
                    {scanning ? 'Analisando gaps, concorrência e potencial de receita' : 'Insira uma query e inicie a análise'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: OPPORTUNITIES ── */}
      {tab === 'opportunities' && (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '16px' }}>
          {/* Left: list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflow: 'hidden', minHeight: 0 }}>
            <QuickStats opportunities={opportunities} />
            <ScoreDistribution opportunities={opportunities} />

            {/* Filters */}
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <input
                className="dust-input"
                placeholder="Buscar..."
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                style={{ flex: 1, fontSize: '10px', padding: '5px 8px' }}
              />
              <button
                className={`btn ${showFavOnly ? 'btn-scout' : 'btn-ghost'}`}
                style={{ padding: '5px 8px', fontSize: '11px' }}
                onClick={() => setShowFavOnly(v => !v)}
                title="Só favoritos"
              >
                ★
              </button>
            </div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <select className="dust-select" value={sortBy} onChange={e => setSortBy(e.target.value)}
                style={{ flex: 1, fontSize: '9px', padding: '5px 8px' }}>
                <option value="date">↓ DATA</option>
                <option value="score">↓ SCORE</option>
                <option value="fav">★ FAVORITOS</option>
              </select>
              <select className="dust-select" value={minScore} onChange={e => setMinScore(Number(e.target.value))}
                style={{ flex: 1, fontSize: '9px', padding: '5px 8px' }}>
                <option value={0}>≥ 0</option>
                <option value={6}>≥ 6</option>
                <option value={10}>≥ 10</option>
                <option value={15}>≥ 15 🥇</option>
              </select>
            </div>

            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'var(--text-ghost)', letterSpacing: '0.1em' }}>
              {filteredOpps.length} / {opportunities.length} OPORTUNIDADES
            </div>

            <div className="scroll-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: 'calc(100vh - 380px)' }}>
              {filteredOpps.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">◎</div>
                  <div className="empty-state-label">{opportunities.length === 0 ? 'Nenhuma oportunidade' : 'Sem resultados'}</div>
                  <div className="empty-state-sub">
                    {opportunities.length === 0
                      ? 'Vá para Scan Manual e inicie a primeira varredura'
                      : 'Ajuste os filtros'}
                  </div>
                </div>
              ) : (
                filteredOpps.map(opp => (
                  <OpportunityCard
                    key={opp.id} opp={opp}
                    onSelect={setSelectedOpp}
                    selected={selectedOpp?.id === opp.id}
                    onDelete={deleteOpportunity}
                    onFavorite={toggleFavorite}
                    isFavorite={favorites.includes(opp.id)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right: detail */}
          <div className="dust-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {selectedOpp ? (
              <>
                <div className="dust-card-header" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: '12px' }}>
                    <div className="dust-card-title">OPPORTUNITY DETAIL</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px', lineHeight: 1.4 }}>
                      {selectedOpp.title || selectedOpp.query}
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'var(--text-ghost)', marginTop: '3px' }}>
                      {new Date(selectedOpp.timestamp).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
                    <ScoreGauge score={selectedOpp.goldScore || 0} size={64} />
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button className="btn btn-scout" onClick={() => generateOffer(selectedOpp)} disabled={generating || !!selectedOpp.offer}>
                        {generating ? <><span className="spinner" /> GERANDO...</> : selectedOpp.offer ? 'OFERTA ✓' : '[ OFERTA ]'}
                      </button>
                      <button className="btn btn-data" onClick={() => createPage(selectedOpp)} disabled={!selectedOpp.offer || generatingPage}>
                        {generatingPage ? <><span className="spinner" /> ...</> : '[ PÁGINA ]'}
                      </button>
                      <button
                        className={`btn ${favorites.includes(selectedOpp.id) ? 'btn-scout' : 'btn-ghost'}`}
                        style={{ padding: '7px 8px' }}
                        onClick={() => toggleFavorite(selectedOpp.id)}
                        title="Favoritar"
                      >
                        {favorites.includes(selectedOpp.id) ? '★' : '☆'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="scroll-area" style={{ flex: 1 }}>
                  {/* Scorecard sections */}
                  {selectedOpp.scorecard ? (
                    <MarkdownBlock text={selectedOpp.scorecard} />
                  ) : (
                    <>
                      {selectedOpp.criticalFlaw && (
                        <Section title="Falha Crítica" accent="var(--loss)" defaultOpen>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{selectedOpp.criticalFlaw}</div>
                        </Section>
                      )}
                      {selectedOpp.killSwitchFeature && (
                        <Section title="Kill-Switch Feature" accent="var(--scout-primary)" defaultOpen>
                          <div style={{ fontSize: '11px', color: 'var(--scout-primary)', lineHeight: 1.7 }}>{selectedOpp.killSwitchFeature}</div>
                        </Section>
                      )}
                    </>
                  )}

                  {/* Offer block */}
                  {selectedOpp.offer && (
                    <Section title="Oferta Gerada" accent="var(--data-primary)" defaultOpen>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                        <button className="btn btn-ghost" style={{ padding: '3px 8px', fontSize: '8px' }} onClick={() => copyOffer(selectedOpp)}>
                          {copied ? '✓ COPIADO' : '⧉ COPIAR'}
                        </button>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--scout-primary)', marginBottom: '8px', lineHeight: 1.4 }}>
                        {selectedOpp.offer.headline}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                        {selectedOpp.offer.mechanism}
                      </div>
                    </Section>
                  )}

                  {/* Source link */}
                  {selectedOpp.target?.url && (
                    <div style={{ marginTop: '8px' }}>
                      <button className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', fontSize: '9px' }}
                        onClick={() => window.open(selectedOpp.target.url, '_blank')}>
                        ↗ ABRIR FONTE ORIGINAL
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ height: '100%' }}>
                <RadarScan active={false} size={100} />
                <div className="empty-state-label" style={{ marginTop: '12px' }}>Selecione uma oportunidade</div>
                <div className="empty-state-sub">Clique em um card à esquerda para ver o detalhamento completo</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: TRENDS ── */}
      {tab === 'trends' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'var(--text-ghost)', letterSpacing: '0.14em' }}>
              INTELIGÊNCIA: arXiv · GitHub · Patentes
            </div>
            <button className="btn btn-ghost" onClick={loadTrends} disabled={trendsLoading}>
              {trendsLoading ? <><span className="spinner" /> CARREGANDO</> : '↻ ATUALIZAR'}
            </button>
          </div>

          {trendsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '16px' }}>
              <RadarScan active size={160} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'var(--text-ghost)', animation: 'scanPulse 1s infinite' }}>
                VARRENDO FONTES DE INTELIGÊNCIA...
              </span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {trends.map(trend => (
                <div key={trend.id} className="dust-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span className={`badge ${
                      trend.source === 'arXiv'  ? 'badge-data'    :
                      trend.source === 'GitHub' ? 'badge-scout'   : 'badge-ops'
                    }`}>{trend.source}</span>
                    {trend.devTraction === 'Alta' && <span className="badge badge-gain">↑ TRAÇÃO ALTA</span>}
                  </div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.4 }}>
                    {trend.title}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {trend.summary}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn btn-scout" style={{ flex: 1, justifyContent: 'center', fontSize: '8px' }}
                      onClick={() => convertTrendToOpp(trend)}>
                      → GERAR OPORTUNIDADE
                    </button>
                    <button className="btn btn-ghost" onClick={() => window.open(trend.url, '_blank')}>↗</button>
                  </div>
                </div>
              ))}
              {trends.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <div className="empty-state-icon">◎</div>
                  <div className="empty-state-label">Clique em Atualizar</div>
                  <div className="empty-state-sub">Carrega tendências de arXiv, GitHub e patentes deep-tech</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
