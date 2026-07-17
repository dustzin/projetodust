import { useState, useEffect } from 'react'

const API = 'http://127.0.0.1:5174'

export default function TopBar({ activeModule }) {
  const [tickers, setTickers] = useState([])
  const [time, setTime]       = useState(new Date())
  const [apiStatus, setApiStatus] = useState('connecting')

  // Clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Finance tickers
  useEffect(() => {
    async function fetchTickers() {
      try {
        const r = await fetch(`${API}/api/fetch-finance`)
        const d = await r.json()
        if (d.success) {
          setTickers(d.data)
          setApiStatus('online')
        }
      } catch {
        setApiStatus('offline')
        setTickers([
          { symbol: 'NVDA', price: 0, change: 0 },
          { symbol: 'AAPL', price: 0, change: 0 },
          { symbol: 'BTC-USD', price: 0, change: 0 },
          { symbol: 'EWZ', price: 0, change: 0 },
          { symbol: 'SPY', price: 0, change: 0 },
        ])
      }
    }
    fetchTickers()
    const interval = setInterval(fetchTickers, 60000)
    return () => clearInterval(interval)
  }, [])

  const fmtPrice = (p) => {
    if (!p || p === 0) return '—'
    if (p > 1000) return p.toLocaleString('en-US', { minimumFractionDigits: 0 })
    return p.toFixed(2)
  }

  const fmtChange = (c) => {
    if (!c && c !== 0) return '—'
    const sign = c >= 0 ? '+' : ''
    return `${sign}${c.toFixed(2)}%`
  }

  return (
    <div className="topbar">
      {/* Logo */}
      <div className="topbar-logo">
        <div className="topbar-logo-mark" />
        <span className="topbar-logo-text">DUST OS</span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '8px',
          color: 'var(--text-ghost)',
          letterSpacing: '0.1em'
        }}>v2.5</span>
      </div>

      {/* Market Tickers */}
      <div className="topbar-tickers">
        {tickers.map(t => (
          <div key={t.symbol} className="ticker-item">
            <span className="ticker-symbol">{t.symbol.replace('-USD', '')}</span>
            <span className="ticker-price">{fmtPrice(t.price)}</span>
            <span className={`ticker-change ${t.change >= 0 ? 'gain' : 'loss'}`}>
              {fmtChange(t.change)}
            </span>
          </div>
        ))}
      </div>

      {/* Right: time + status */}
      <div className="topbar-status">
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          color: 'var(--text-ghost)',
          letterSpacing: '0.08em'
        }}>
          {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
        <div
          className={`status-dot ${apiStatus === 'online' ? '' : 'inactive'}`}
          title={`API Server: ${apiStatus}`}
        />
      </div>
    </div>
  )
}
