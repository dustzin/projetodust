import { useState, useEffect, useCallback } from 'react'

const API = 'http://127.0.0.1:5174'

const CATEGORIES = ['Todos', 'CIÊNCIA', 'IA & ENG', 'ENG. ELÉTRICA', 'XADREZ']

export default function ReadingsModule() {
  const [articles, setArticles]   = useState([])
  const [loading, setLoading]     = useState(false)
  const [category, setCategory]   = useState('Todos')
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)

  const [aiGenerating, setAiGenerating] = useState(false)

  const loadArticles = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/fetch-rss`)
      const d = await r.json()
      if (d.success && Array.isArray(d.articles)) {
        setArticles(d.articles)
      }
    } catch (e) {
      console.error('[READINGS] RSS fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const generateAiArticles = async () => {
    setAiGenerating(true)
    try {
      const r = await fetch(`${API}/api/generate-ai-articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const d = await r.json()
      if (d.success && Array.isArray(d.articles)) {
        // Prepend generated AI articles to the top of the feed
        setArticles(prev => [...d.articles, ...prev])
      }
    } catch (e) {
      console.error('[READINGS] AI generation error:', e)
    } finally {
      setAiGenerating(false)
    }
  }

  useEffect(() => { loadArticles() }, [loadArticles])

  const filtered = articles.filter(a => {
    const matchCat = category === 'Todos' || a.category === category
    const matchSearch = !search || 
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.source?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const fmtDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    } catch { return '—' }
  }

  return (
    <div className="module-page fade-in">
      {/* Header */}
      <div className="module-header">
        <div>
          <div className="module-title">
            <div className="module-accent-dot" style={{ background: 'var(--read-primary)' }} />
            READINGS HUB
          </div>
          <div className="module-subtitle">Feeds curados · Ciência · Matemática · Engenharia · Xadrez</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn" style={{ borderColor: 'var(--read-primary)', color: 'var(--read-primary)', background: 'var(--read-dim)' }} onClick={generateAiArticles} disabled={aiGenerating}>
            {aiGenerating ? <><span className="spinner" style={{ borderTopColor: 'var(--read-primary)' }} /> CURANDO...</> : '✨ CURAR ARTIGOS COM IA'}
          </button>
          <button className="btn btn-ghost" onClick={loadArticles} disabled={loading}>
            {loading ? <><span className="spinner" /> CARREGANDO</> : '↻ ATUALIZAR FEEDS'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', alignItems: 'center' }}>
        <input
          className="dust-input"
          style={{ maxWidth: '240px' }}
          placeholder="Buscar artigos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '4px' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '8px',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                padding: '5px 10px',
                border: `1px solid ${category === cat ? 'rgba(255,215,64,0.4)' : 'var(--border-dim)'}`,
                background: category === cat ? 'var(--read-dim)' : 'transparent',
                color: category === cat ? 'var(--read-primary)' : 'var(--text-ghost)',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'all var(--transition)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div style={{
          marginLeft: 'auto',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '9px',
          color: 'var(--text-ghost)'
        }}>
          {filtered.length} ARTIGOS
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '16px' }}>
        {/* Article list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {loading && articles.length === 0 ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px', gap: '10px', alignItems: 'center' }}>
              <span className="spinner" style={{ borderTopColor: 'var(--read-primary)' }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'var(--text-ghost)' }}>
                CARREGANDO FEEDS DE INTELIGÊNCIA...
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">◎</div>
              <div className="empty-state-label">Nenhum artigo</div>
              <div className="empty-state-sub">
                {articles.length === 0
                  ? 'Configure feeds RSS no arquivo data/feeds.json e clique em Atualizar'
                  : 'Nenhum artigo corresponde ao filtro selecionado'}
              </div>
            </div>
          ) : (
            filtered.map(article => (
              <div
                key={article.id}
                onClick={() => setSelected(selected?.id === article.id ? null : article)}
                style={{
                  display: 'flex',
                  gap: '12px',
                  padding: '12px 14px',
                  background: selected?.id === article.id ? 'var(--bg-hover)' : 'transparent',
                  borderBottom: '1px solid var(--border-dim)',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition)',
                  borderLeft: selected?.id === article.id ? '2px solid var(--read-primary)' : '2px solid transparent',
                }}
              >
                <div style={{ flexShrink: 0, paddingTop: '2px', fontSize: '16px' }}>
                  {article.icon || '📄'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    marginBottom: '3px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {article.title}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'var(--text-ghost)' }}>
                      {article.source}
                    </span>
                    <span style={{ color: 'var(--border-mid)' }}>·</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'var(--text-ghost)' }}>
                      {fmtDate(article.pubDate)}
                    </span>
                    {article.readTimeMin && (
                      <>
                        <span style={{ color: 'var(--border-mid)' }}>·</span>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'var(--text-ghost)' }}>
                          {article.readTimeMin}min
                        </span>
                      </>
                    )}
                    {article.category && (
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '7px',
                        padding: '1px 5px',
                        background: 'var(--read-dim)',
                        border: '1px solid rgba(255,215,64,0.2)',
                        borderRadius: '2px',
                        color: 'var(--read-primary)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginLeft: 'auto'
                      }}>
                        {article.category}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); window.open(article.url, '_blank') }}
                  className="btn btn-ghost"
                  style={{ flexShrink: 0, padding: '4px 8px', alignSelf: 'center' }}
                >
                  ↗
                </button>
              </div>
            ))
          )}
        </div>

        {/* Article detail */}
        {selected && (
          <div className="dust-card fade-in" style={{ display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, maxHeight: 'calc(100vh - 160px)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '12px',
              paddingBottom: '10px',
              borderBottom: '1px solid var(--border-dim)'
            }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: '10px' }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.4,
                  marginBottom: '6px'
                }}>
                  {selected.title}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'var(--text-ghost)' }}>
                    {selected.source}
                  </span>
                  <span style={{ color: 'var(--border-dim)' }}>·</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'var(--text-ghost)' }}>
                    {fmtDate(selected.pubDate)}
                  </span>
                </div>
              </div>
              <button className="btn btn-ghost" onClick={() => setSelected(null)} style={{ flexShrink: 0, padding: '4px 8px' }}>
                ✕
              </button>
            </div>

            <div className="scroll-area" style={{ flex: 1 }}>
              <p style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
                marginBottom: '16px'
              }}>
                {selected.summary || 'Sem resumo disponível.'}
              </p>
            </div>

            <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-dim)' }}>
              <button
                className="btn btn-ghost"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => window.open(selected.url, '_blank')}
              >
                ABRIR ARTIGO COMPLETO ↗
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
