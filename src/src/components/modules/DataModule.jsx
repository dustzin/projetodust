import { useState, useEffect, useCallback } from 'react'

const API = 'http://127.0.0.1:5174'

// ── Sparkline (tiny SVG chart) ────────────────────────────────────
function Sparkline({ data = [], color = 'var(--data-primary)', height = 32 }) {
  if (!data || data.length < 2) return null
  const w = 80, h = height
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block', flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

// ── Metric Card ───────────────────────────────────────────────────
function MetricCard({ label, value, sub, accent, sparkData }) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="metric-value" style={{ color: accent || 'var(--text-primary)', fontSize: '18px' }}>
            {value}
          </div>
          {sub && <div className="metric-sub">{sub}</div>}
        </div>
        {sparkData && <Sparkline data={sparkData} color={accent} />}
      </div>
      <div className="metric-accent-bar" style={{ background: accent || 'var(--data-primary)' }} />
    </div>
  )
}

// ── Portfolio Row ─────────────────────────────────────────────────
function AssetRow({ symbol, price, change, category }) {
  const isGain = change >= 0
  return (
    <tr>
      <td>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--text-primary)' }}>{symbol}</div>
        <div style={{ fontSize: '9px', color: 'var(--text-ghost)', marginTop: '1px', letterSpacing: '0.08em' }}>{category}</div>
      </td>
      <td style={{ textAlign: 'right', fontFamily: 'JetBrains Mono, monospace', fontWeight: 500, color: 'var(--text-primary)' }}>
        {price > 0 ? (price > 999 ? price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : price.toFixed(2)) : '—'}
      </td>
      <td style={{ textAlign: 'right' }}>
        <span className={`badge ${isGain ? 'badge-gain' : 'badge-loss'}`}>
          {isGain ? '+' : ''}{change.toFixed(2)}%
        </span>
      </td>
    </tr>
  )
}

// ── MAIN DATA MODULE ──────────────────────────────────────────────
export default function DataModule() {
  const [tab, setTab]           = useState('market')   // market | portfolio | council
  const [assets, setAssets]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)

  const [councilQ, setCouncilQ]         = useState('')
  const [councilLoading, setCouncilLoading] = useState(false)
  const [councilResult, setCouncilResult] = useState(null)

  // Sample portfolio (extends market data)
  const PORTFOLIO = [
    { symbol: 'NVDA', category: 'Tech / AI', allocation: 35 },
    { symbol: 'AAPL', category: 'Tech / Consumer', allocation: 20 },
    { symbol: 'BTC-USD', category: 'Crypto / Digital Asset', allocation: 25 },
    { symbol: 'EWZ', category: 'EM / Brasil', allocation: 10 },
    { symbol: 'SPY', category: 'ETF / S&P500', allocation: 10 },
  ]

  const loadMarket = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/fetch-finance`)
      const d = await r.json()
      if (d.success) {
        setAssets(d.data)
        setLastUpdate(new Date())
      }
    } catch (e) {
      console.error('[DATA] Market fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMarket()
    const interval = setInterval(loadMarket, 60000)
    return () => clearInterval(interval)
  }, [loadMarket])

  const runCouncil = async () => {
    if (!councilQ.trim() || councilLoading) return
    setCouncilLoading(true)
    setCouncilResult(null)
    try {
      const r = await fetch(`${API}/api/council`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: councilQ.trim() })
      })
      const d = await r.json()
      if (d.success) setCouncilResult(d)
    } catch (e) {
      console.error('[DATA] Council error:', e)
    } finally {
      setCouncilLoading(false)
    }
  }

  // Derived metrics
  const gainers  = assets.filter(a => a.change > 0)
  const losers   = assets.filter(a => a.change < 0)
  const avgGain  = gainers.length ? gainers.reduce((s, a) => s + a.change, 0) / gainers.length : 0
  const avgLoss  = losers.length ? losers.reduce((s, a) => s + a.change, 0) / losers.length : 0
  const sentiment = assets.length ? (gainers.length / assets.length) * 100 : 0

  return (
    <div className="module-page fade-in">
      {/* Header */}
      <div className="module-header">
        <div>
          <div className="module-title">
            <div className="module-accent-dot" style={{ background: 'var(--data-primary)' }} />
            DATA ENGINE
          </div>
          <div className="module-subtitle">Motor de inteligência, métricas de mercado e ROI do portfólio</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {lastUpdate && (
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '9px',
              color: 'var(--text-ghost)',
              letterSpacing: '0.08em'
            }}>
              ATUALIZADO {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          <button className="btn btn-data" onClick={loadMarket} disabled={loading}>
            {loading ? <><span className="spinner" /> SYNC</> : '↻ SYNC MERCADO'}
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <MetricCard
          label="ATIVOS MONITORADOS"
          value={assets.length}
          sub={`${gainers.length} alta · ${losers.length} queda`}
          accent="var(--data-primary)"
        />
        <MetricCard
          label="SENTIMENTO DO MERCADO"
          value={`${sentiment.toFixed(0)}%`}
          sub={sentiment >= 50 ? 'Majoritariamente BULL' : 'Majoritariamente BEAR'}
          accent={sentiment >= 50 ? 'var(--gain)' : 'var(--loss)'}
        />
        <MetricCard
          label="Δ MÉDIO (ALTA)"
          value={gainers.length ? `+${avgGain.toFixed(2)}%` : '—'}
          sub={`${gainers.length} ativos em alta`}
          accent="var(--gain)"
        />
        <MetricCard
          label="Δ MÉDIO (QUEDA)"
          value={losers.length ? `${avgLoss.toFixed(2)}%` : '—'}
          sub={`${losers.length} ativos em queda`}
          accent="var(--loss)"
        />
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '2px',
        marginBottom: '20px',
        borderBottom: '1px solid var(--border-dim)',
      }}>
        {[
          { id: 'market', label: 'WATCHLIST' },
          { id: 'portfolio', label: 'PORTFÓLIO / HOLDING' },
          { id: 'council', label: 'COUNCIL OF INTELLIGENCE' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '9px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              padding: '8px 14px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: tab === t.id ? 'var(--data-primary)' : 'var(--text-ghost)',
              borderBottom: tab === t.id ? '2px solid var(--data-primary)' : '2px solid transparent',
              marginBottom: '-1px',
              transition: 'all var(--transition)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── WATCHLIST ── */}
      {tab === 'market' && (
        <div className="dust-card">
          <div className="dust-card-header">
            <div className="dust-card-title">MERCADO · ATIVOS RASTREADOS</div>
          </div>
          <table className="dust-table">
            <thead>
              <tr>
                <th>SÍMBOLO / CLASSE</th>
                <th style={{ textAlign: 'right' }}>PREÇO (USD)</th>
                <th style={{ textAlign: 'right' }}>VARIAÇÃO 1D</th>
              </tr>
            </thead>
            <tbody>
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-ghost)' }}>
                    {loading ? 'CARREGANDO DADOS DE MERCADO...' : 'Nenhum dado disponível'}
                  </td>
                </tr>
              ) : (
                assets.map(a => {
                  const portfolio = PORTFOLIO.find(p => p.symbol === a.symbol)
                  return (
                    <AssetRow
                      key={a.symbol}
                      symbol={a.symbol.replace('-USD', '')}
                      price={a.price}
                      change={a.change}
                      category={portfolio?.category || 'Asset'}
                    />
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PORTFOLIO ── */}
      {tab === 'portfolio' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="dust-card">
            <div className="dust-card-header">
              <div className="dust-card-title">ALOCAÇÃO DO PORTFÓLIO</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PORTFOLIO.map(item => {
                const liveData = assets.find(a => a.symbol === item.symbol)
                const change = liveData?.change || 0
                const isGain = change >= 0
                return (
                  <div key={item.symbol} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    background: 'var(--bg-surface)',
                    borderRadius: '2px',
                    border: '1px solid var(--border-dim)'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '5px',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.symbol.replace('-USD', '')}
                        </span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'var(--text-muted)' }}>
                          {item.allocation}%
                        </span>
                      </div>
                      <div style={{
                        height: '3px',
                        background: 'var(--border-dim)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${item.allocation}%`,
                          background: isGain ? 'var(--gain)' : 'var(--loss)',
                          borderRadius: '2px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                      <div style={{ marginTop: '3px', fontSize: '9px', color: 'var(--text-ghost)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {item.category}
                      </div>
                    </div>
                    {liveData && (
                      <span className={`badge ${isGain ? 'badge-gain' : 'badge-loss'}`} style={{ flexShrink: 0 }}>
                        {isGain ? '+' : ''}{change.toFixed(2)}%
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="dust-card">
            <div className="dust-card-header">
              <div className="dust-card-title">RESUMO HOLDING</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'ENTIDADE OPERANTE', value: 'De Coninck & Co.', accent: 'var(--ops-primary)' },
                { label: 'TIPO DE ESTRUTURA', value: 'Holding Patrimonial', accent: 'var(--text-secondary)' },
                { label: 'FOCO DE CAPITAL', value: 'SaaS · Data · FinTech · Real Assets', accent: 'var(--data-primary)' },
                { label: 'FILOSOFIA DE ALOCAÇÃO', value: '70% Produtivos · 30% Hedge', accent: 'var(--text-secondary)' },
                { label: 'ATIVOS MONITORADOS', value: `${assets.length} posições`, accent: 'var(--gain)' },
                { label: 'EXPOSIÇÃO TECH/AI', value: '55%', accent: 'var(--data-primary)' },
                { label: 'EXPOSIÇÃO CRYPTO', value: '25%', accent: 'var(--read-primary)' },
                { label: 'EXPOSIÇÃO MACRO/ETF', value: '20%', accent: 'var(--text-secondary)' },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '10px',
                  borderBottom: '1px solid var(--border-dim)'
                }}>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '8px',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: 'var(--text-ghost)'
                  }}>{item.label}</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: item.accent
                  }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── COUNCIL ── */}
      {tab === 'council' && (
        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '16px' }}>
          <div className="dust-card">
            <div className="dust-card-header">
              <div className="dust-card-title">COUNCIL OF HIGH INTELLIGENCE</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                padding: '10px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-dim)',
                borderRadius: '2px',
                fontSize: '10px',
                color: 'var(--text-muted)',
                fontFamily: 'JetBrains Mono, monospace',
                lineHeight: 1.6
              }}>
                Submeta uma questão estratégica ao conselho de 18 mentes históricas. O AI sintetizará um debate e veredito executivo.
              </div>
              <div>
                <label className="field-label">QUESTÃO ESTRATÉGICA</label>
                <textarea
                  className="dust-textarea"
                  rows={5}
                  placeholder="Ex: Devo alocar capital em equity local ou manter posição em tech americana?&#10;&#10;Ex: Qual a melhor estratégia para escalar o produto SaaS com margem >70%?"
                  value={councilQ}
                  onChange={e => setCouncilQ(e.target.value)}
                  style={{ resize: 'none', minHeight: '120px' }}
                />
              </div>
              <button
                className="btn btn-data"
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                onClick={runCouncil}
                disabled={!councilQ.trim() || councilLoading}
              >
                {councilLoading
                  ? <><span className="spinner" style={{ borderTopColor: 'var(--data-primary)' }} /> DELIBERANDO...</>
                  : '⚖ CONVOCAR O CONSELHO'}
              </button>

              {/* Council members */}
              <div style={{ marginTop: '8px' }}>
                <div className="field-label" style={{ marginBottom: '8px' }}>18 MEMBROS ATIVOS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {['Aristóteles','Sócrates','Sun Tzu','Ada Lovelace','Marco Aurélio','Maquiavel','Lao Tzu',
                    'Feynman','Torvalds','Musashi','Alan Watts','Karpathy','Sutskever',
                    'Kahneman','D. Meadows','Munger','Taleb','Dieter Rams'].map(m => (
                    <span key={m} style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '8px',
                      padding: '2px 6px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-dim)',
                      borderRadius: '2px',
                      color: 'var(--text-ghost)'
                    }}>{m}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="dust-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="dust-card-header">
              <div className="dust-card-title">VEREDITO DO CONSELHO</div>
            </div>
            <div className="scroll-area" style={{ flex: 1 }}>
              {councilLoading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} style={{
                      padding: '12px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-dim)',
                      borderRadius: '2px',
                      animation: 'scanPulse 1.5s ease-in-out infinite',
                      animationDelay: `${i * 0.2}s`
                    }}>
                      <div style={{ height: '8px', background: 'var(--border-dim)', borderRadius: '2px', width: '30%', marginBottom: '6px' }} />
                      <div style={{ height: '6px', background: 'var(--border-dim)', borderRadius: '2px', width: '80%' }} />
                    </div>
                  ))}
                </div>
              ) : councilResult ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Debate */}
                  {councilResult.debate?.map((msg, i) => (
                    <div key={i} style={{
                      padding: '12px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-dim)',
                      borderRadius: '2px',
                      borderLeft: '2px solid var(--data-primary)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'var(--data-primary)'
                        }}>{msg.persona}</span>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '8px',
                          color: 'var(--text-ghost)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.1em'
                        }}>{msg.polarity}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {msg.message}
                      </div>
                    </div>
                  ))}

                  {/* Verdict */}
                  {councilResult.verdict && (
                    <div style={{
                      padding: '16px',
                      background: 'rgba(0,184,217,0.04)',
                      border: '1px solid rgba(0,184,217,0.2)',
                      borderRadius: '2px'
                    }}>
                      <div style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.16em',
                        color: 'var(--data-primary)',
                        marginBottom: '10px',
                        textTransform: 'uppercase'
                      }}>
                        VEREDITO FINAL
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                        {councilResult.verdict}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="empty-state" style={{ height: '100%' }}>
                  <div className="empty-state-icon">⚖</div>
                  <div className="empty-state-label">O Conselho aguarda</div>
                  <div className="empty-state-sub">Submeta uma questão estratégica para convocar os 18 membros do conselho de inteligência</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
