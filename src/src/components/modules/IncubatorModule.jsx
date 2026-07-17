import { useState, useEffect } from 'react'

const API = 'http://127.0.0.1:5174'

const IDEA_TEMPLATE = {
  name: '',
  category: 'SaaS',
  targetMarket: '',
  problem: '',
  solution: '',
  monetization: '',
  techStack: '',
  feedbackLoop: '',
  status: 'BRAINSTORM',
  goldScore: null,
  createdAt: new Date().toISOString()
}

const CATEGORIES = ['SaaS', 'FinTech', 'Data/Analytics', 'AI Tool', 'MarketPlace', 'Agency Tool', 'B2B Platform']
const STATUSES   = ['BRAINSTORM', 'VALIDATING', 'MVP', 'SCALING', 'ARCHIVED']

const STATUS_COLORS = {
  BRAINSTORM: 'var(--text-muted)',
  VALIDATING: 'var(--data-primary)',
  MVP:        'var(--read-primary)',
  SCALING:    'var(--gain)',
  ARCHIVED:   'var(--text-ghost)',
}

function processIdeaWithAI(raw) {
  const lower = raw.toLowerCase()
  const isSaaS    = lower.includes('saas') || lower.includes('software') || lower.includes('plataforma')
  const isFinance = lower.includes('finan') || lower.includes('invest') || lower.includes('holding') || lower.includes('capital')
  const isData    = lower.includes('dados') || lower.includes('analytics') || lower.includes('relatorio') || lower.includes('metrics')
  const isAI      = lower.includes('ia') || lower.includes('ai') || lower.includes('inteligência') || lower.includes('automação')

  let category    = 'SaaS'
  let target      = 'Empresas e Holdings B2B'
  let monetModel  = 'SaaS mensal com tier por volume de uso'
  let techSuggestion = 'React + Node.js + PostgreSQL + AI API'
  let score       = 12 + Math.random() * 8

  if (isFinance) { category = 'FinTech'; target = 'Holdings e Gestoras de Patrimônio'; score += 3 }
  if (isData)    { category = 'Data/Analytics'; techSuggestion = 'Python + dbt + PostgreSQL + React Dashboard'; score += 2 }
  if (isAI)      { category = 'AI Tool'; techSuggestion = 'Next.js + LangChain + OpenAI/Gemini + Vector DB'; score += 2 }
  if (isSaaS)    { category = 'SaaS'; monetModel = 'Freemium → Paid. Plano base R$297/mês, Pro R$997/mês'; score += 1 }

  const words  = raw.split(' ')
  const noun   = words.slice(0, 4).join(' ')
  const problem = `Empresas de ${target.toLowerCase()} sofrem com processos manuais e falta de centralização de dados relacionados a ${noun}.`
  const solution = `Plataforma que automatiza e centraliza ${noun} com integração nativa a ferramentas existentes e interface minimalista de alta densidade de dados.`
  const feedback = `Validar com 3-5 clientes beta da carteira De Coninck & Co. Medir: tempo de onboarding, NPS após 30 dias, e conversão de trial para pago.`

  return {
    ...IDEA_TEMPLATE,
    name: noun.charAt(0).toUpperCase() + noun.slice(1),
    category,
    targetMarket: target,
    problem,
    solution,
    monetization: monetModel,
    techStack: techSuggestion,
    feedbackLoop: feedback,
    goldScore: Math.min(25, score),
    status: 'BRAINSTORM',
    createdAt: new Date().toISOString()
  }
}

export default function IncubatorModule() {
  const [ideas, setIdeas]           = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [brainDump, setBrainDump]   = useState('')
  const [processing, setProcessing] = useState(false)
  const [editMode, setEditMode]     = useState(false)
  const [draft, setDraft]           = useState(null)
  const [filterStatus, setFilterStatus] = useState('Todos')

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('dust_incubator_ideas_v25')
      if (saved) setIdeas(JSON.parse(saved))
    } catch {}
  }, [])

  const saveIdeas = (list) => {
    setIdeas(list)
    try { localStorage.setItem('dust_incubator_ideas_v25', JSON.stringify(list)) } catch {}
  }

  const selected = ideas.find(i => i.id === selectedId)

  const processIdea = () => {
    if (!brainDump.trim() || processing) return
    setProcessing(true)
    setTimeout(() => {
      const processed = processIdeaWithAI(brainDump)
      const newIdea = { ...processed, id: `idea-${Date.now()}` }
      const updated = [newIdea, ...ideas]
      saveIdeas(updated)
      setSelectedId(newIdea.id)
      setBrainDump('')
      setProcessing(false)
    }, 1800)
  }

  const saveEdit = () => {
    if (!draft) return
    const updated = ideas.map(i => i.id === draft.id ? draft : i)
    saveIdeas(updated)
    setEditMode(false)
    setDraft(null)
  }

  const deleteIdea = (id) => {
    if (!window.confirm('Remover esta ideia do incubator?')) return
    const updated = ideas.filter(i => i.id !== id)
    saveIdeas(updated)
    if (selectedId === id) { setSelectedId(null); setEditMode(false) }
  }

  const startEdit = () => {
    setDraft({ ...selected })
    setEditMode(true)
  }

  const filteredIdeas = ideas.filter(i => filterStatus === 'Todos' || i.status === filterStatus)

  return (
    <div className="module-page fade-in">
      {/* Header */}
      <div className="module-header">
        <div>
          <div className="module-title">
            <div className="module-accent-dot" style={{ background: 'var(--inc-primary)' }} />
            INCUBATOR
          </div>
          <div className="module-subtitle">Laboratório de ideias de software · Brain Dump → Estruturação IA</div>
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '9px',
          color: 'var(--text-ghost)'
        }}>
          {ideas.length} IDEIA{ideas.length !== 1 ? 'S' : ''} · {ideas.filter(i => i.status === 'VALIDATING' || i.status === 'MVP').length} EM TRAÇÃO
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', minHeight: '520px' }}>
        {/* Left column: input + list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Brain Dump input */}
          <div className="dust-card">
            <div className="dust-card-header">
              <div className="dust-card-title">BRAIN DUMP</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                className="dust-textarea"
                rows={4}
                placeholder="Escreva livremente sua ideia de produto, sistema ou oportunidade de mercado...&#10;&#10;Ex: quero um painel que consolida métricas de todas as holdings em um único lugar..."
                value={brainDump}
                onChange={e => setBrainDump(e.target.value)}
                style={{ resize: 'none' }}
              />
              <button
                className="btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  color: 'var(--inc-primary)',
                  borderColor: 'rgba(255,109,0,0.3)',
                  background: 'rgba(255,109,0,0.08)',
                  padding: '9px'
                }}
                onClick={processIdea}
                disabled={!brainDump.trim() || processing}
              >
                {processing
                  ? <><span className="spinner" style={{ borderTopColor: 'var(--inc-primary)' }} /> ESTRUTURANDO COM IA...</>
                  : '⚡ PROCESSAR COM DUST AI'}
              </button>
            </div>
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['Todos', ...STATUSES].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '7px',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '3px 7px',
                  border: `1px solid ${filterStatus === s ? 'rgba(255,109,0,0.4)' : 'var(--border-dim)'}`,
                  background: filterStatus === s ? 'rgba(255,109,0,0.1)' : 'transparent',
                  color: filterStatus === s ? 'var(--inc-primary)' : 'var(--text-ghost)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all var(--transition)'
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Ideas list */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'auto', maxHeight: '400px' }}>
            {filteredIdeas.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">💡</div>
                <div className="empty-state-label">Nenhuma ideia</div>
                <div className="empty-state-sub">Faça um brain dump acima para estruturar sua primeira ideia</div>
              </div>
            ) : (
              filteredIdeas.map(idea => (
                <div
                  key={idea.id}
                  onClick={() => { setSelectedId(idea.id); setEditMode(false) }}
                  style={{
                    padding: '10px 12px',
                    background: selectedId === idea.id ? 'var(--bg-hover)' : 'var(--bg-card)',
                    border: `1px solid ${selectedId === idea.id ? 'rgba(255,109,0,0.4)' : 'var(--border-dim)'}`,
                    borderLeft: `3px solid ${selectedId === idea.id ? 'var(--inc-primary)' : 'transparent'}`,
                    borderRadius: '2px',
                    cursor: 'pointer',
                    transition: 'all var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '10px',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '160px'
                    }}>
                      {idea.name || 'Ideia sem nome'}
                    </span>
                    {idea.goldScore && (
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '11px',
                        fontWeight: 800,
                        color: 'var(--scout-primary)',
                        flexShrink: 0
                      }}>
                        {idea.goldScore.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '7px',
                      padding: '1px 5px',
                      border: `1px solid ${STATUS_COLORS[idea.status]}33`,
                      color: STATUS_COLORS[idea.status],
                      borderRadius: '2px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em'
                    }}>
                      {idea.status}
                    </span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'var(--text-ghost)' }}>
                      {idea.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="dust-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selected ? (
            <>
              <div className="dust-card-header">
                <div>
                  <div className="dust-card-title">IDEA DETAIL</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {selected.name}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {!editMode && (
                    <button className="btn btn-ghost" onClick={startEdit}>✎ EDITAR</button>
                  )}
                  {editMode && (
                    <>
                      <button className="btn btn-scout" onClick={saveEdit}>✓ SALVAR</button>
                      <button className="btn btn-ghost" onClick={() => { setEditMode(false); setDraft(null) }}>CANCELAR</button>
                    </>
                  )}
                  <button className="btn btn-danger" onClick={() => deleteIdea(selected.id)}>✕</button>
                </div>
              </div>

              <div className="scroll-area" style={{ flex: 1 }}>
                {editMode && draft ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="field-label">NOME DA IDEIA</label>
                        <input className="dust-input" value={draft.name} onChange={e => setDraft({...draft, name: e.target.value})} />
                      </div>
                      <div>
                        <label className="field-label">CATEGORIA</label>
                        <select className="dust-select" value={draft.category} onChange={e => setDraft({...draft, category: e.target.value})}>
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label className="field-label">STATUS</label>
                        <select className="dust-select" value={draft.status} onChange={e => setDraft({...draft, status: e.target.value})}>
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="field-label">MERCADO-ALVO</label>
                        <input className="dust-input" value={draft.targetMarket} onChange={e => setDraft({...draft, targetMarket: e.target.value})} />
                      </div>
                    </div>
                    {[
                      { key: 'problem', label: 'PROBLEMA CENTRAL' },
                      { key: 'solution', label: 'SOLUÇÃO PROPOSTA' },
                      { key: 'monetization', label: 'MODELO DE MONETIZAÇÃO' },
                      { key: 'techStack', label: 'STACK TÉCNICA' },
                      { key: 'feedbackLoop', label: 'FEEDBACK LOOP INICIAL' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="field-label">{f.label}</label>
                        <textarea
                          className="dust-textarea"
                          rows={2}
                          value={draft[f.key] || ''}
                          onChange={e => setDraft({...draft, [f.key]: e.target.value})}
                          style={{ resize: 'none' }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Metrics row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                      {[
                        { label: 'GOLD SCORE', value: selected.goldScore ? selected.goldScore.toFixed(1) : '—', accent: 'var(--scout-primary)' },
                        { label: 'STATUS', value: selected.status, accent: STATUS_COLORS[selected.status] },
                        { label: 'CATEGORIA', value: selected.category, accent: 'var(--inc-primary)' },
                        { label: 'MERCADO', value: selected.targetMarket?.split(' ').slice(0,2).join(' ') || '—', accent: 'var(--text-secondary)' },
                      ].map(m => (
                        <div key={m.label} style={{
                          padding: '10px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-dim)',
                          borderRadius: '2px'
                        }}>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '7px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-ghost)', marginBottom: '5px' }}>{m.label}</div>
                          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 600, color: m.accent }}>{m.value}</div>
                        </div>
                      ))}
                    </div>

                    {[
                      { key: 'problem', label: 'PROBLEMA CENTRAL', accent: 'var(--loss)' },
                      { key: 'solution', label: 'SOLUÇÃO PROPOSTA', accent: 'var(--gain)' },
                      { key: 'monetization', label: 'MODELO DE MONETIZAÇÃO', accent: 'var(--read-primary)' },
                      { key: 'techStack', label: 'STACK TÉCNICA', accent: 'var(--data-primary)' },
                      { key: 'feedbackLoop', label: 'FEEDBACK LOOP INICIAL', accent: 'var(--ops-primary)' },
                    ].map(f => selected[f.key] ? (
                      <div key={f.key} style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-dim)' }}>
                        <div className="field-label" style={{ color: f.accent, marginBottom: '5px' }}>{f.label}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {selected[f.key]}
                        </div>
                      </div>
                    ) : null)}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="empty-state" style={{ height: '100%' }}>
              <div className="empty-state-icon">💡</div>
              <div className="empty-state-label">Selecione uma ideia</div>
              <div className="empty-state-sub">Ou faça um brain dump à esquerda para estruturar uma nova ideia com IA</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
