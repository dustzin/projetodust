import { useState, useEffect, useCallback } from 'react'

const API = 'http://127.0.0.1:5174'

const DEFAULT_QUESTS = [
  { id: 1, title: 'Creatina', desc: 'Check-in de Creatina Monohidratada (5g)', completed: false },
  { id: 2, title: 'Omega 3', desc: 'Ingestão de Cápsulas de Omega 3', completed: false },
  { id: 3, title: 'Calistenia', desc: 'Sessão de Calistenia / Treino de Força', completed: false },
  { id: 4, title: 'Boxe', desc: 'Treino de Sprints/Boxe (Cinética)', completed: false },
  { id: 5, title: 'Skincare', desc: 'Rotina de cuidados com a pele (Matutina/Noturna)', completed: false },
  { id: 6, title: 'Meditação', desc: 'Sessão de meditação / respiração para acalmar o SNC', completed: false },
  { id: 7, title: 'Matemática', desc: 'Resolução de Exercícios / Estudo Teórico', completed: false },
  { id: 8, title: 'Engenharia Elétrica', desc: 'Estudos de Circuitos / Teoria ou Projetos', completed: false },
  { id: 9, title: 'Xadrez', desc: 'Treino Cognitivo / Táticas / Partidas', completed: false },
  { id: 10, title: 'Artigos', desc: 'Leitura e Análise de pelo menos 1 Artigo Científico', completed: false }
]

export default function DQuestsModule() {
  const [quests, setQuests] = useState(DEFAULT_QUESTS)
  const [date, setDate] = useState(() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [savedStatus, setSavedStatus] = useState('')

  const getFilePath = useCallback((dStr) => `data/quest_logs/${dStr}.json`, [])

  const loadQuests = useCallback(async (selectedDate) => {
    setLoading(true)
    setSavedStatus('')
    try {
      const r = await fetch(`${API}/api/read?filePath=${getFilePath(selectedDate)}`)
      const d = await r.json()
      if (d.success && d.content) {
        setQuests(JSON.parse(d.content))
      } else {
        // Se não existir, inicia com a lista padrão vazia
        setQuests(DEFAULT_QUESTS.map(q => ({ ...q, completed: false })))
      }
    } catch (e) {
      console.error('[D-QUESTS] Load error:', e)
    } finally {
      setLoading(false)
    }
  }, [getFilePath])

  useEffect(() => {
    loadQuests(date)
  }, [date, loadQuests])

  const toggleQuest = (id) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: !q.completed } : q))
    setSavedStatus('Modificado (não salvo)')
  }

  const saveQuests = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: getFilePath(date),
          content: JSON.stringify(quests, null, 2)
        })
      })
      const d = await r.json()
      if (d.success) {
        setSavedStatus('✓ Salvo com sucesso!')
        setTimeout(() => setSavedStatus(''), 3000)
      } else {
        setSavedStatus('✕ Erro ao salvar')
      }
    } catch (e) {
      console.error('[D-QUESTS] Save error:', e)
      setSavedStatus('✕ Falha de conexão')
    } finally {
      setLoading(false)
    }
  }

  const completedCount = quests.filter(q => q.completed).length
  const pct = quests.length > 0 ? Math.round((completedCount / quests.length) * 100) : 0

  return (
    <div className="module-page fade-in">
      <div className="module-header">
        <div>
          <div className="module-title">
            <div className="module-accent-dot" style={{ background: 'var(--scout-primary)' }} />
            D-QUESTS DIÁRIAS
          </div>
          <div className="module-subtitle">Check-in de Hábitos, Treino e Desenvolvimento Pessoal</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="date"
            className="dust-input"
            style={{ width: '150px', padding: '6px 10px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <button className="btn" style={{ borderColor: 'var(--scout-primary)', color: 'var(--scout-primary)', background: 'var(--scout-dim)' }} onClick={saveQuests} disabled={loading}>
            {loading ? 'SALVANDO...' : 'SALVAR LOG'}
          </button>
        </div>
      </div>

      {savedStatus && (
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '10px',
          color: savedStatus.includes('✓') ? 'var(--gain)' : savedStatus.includes('Modificado') ? 'var(--read-primary)' : 'var(--loss)',
          marginBottom: '12px',
          letterSpacing: '0.05em'
        }}>
          {savedStatus.toUpperCase()}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px' }}>
        {/* Quest List */}
        <div className="dust-card" style={{ padding: '0px' }}>
          {quests.map(q => (
            <div
              key={q.id}
              onClick={() => toggleQuest(q.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-dim)',
                cursor: 'pointer',
                background: q.completed ? 'rgba(0, 230, 118, 0.02)' : 'transparent',
                transition: 'background-color 0.2s',
                userSelect: 'none'
              }}
            >
              <div style={{
                width: '16px',
                height: '16px',
                border: `1px solid ${q.completed ? 'var(--scout-primary)' : 'var(--text-ghost)'}`,
                borderRadius: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: q.completed ? 'var(--scout-primary)' : 'transparent',
                transition: 'all 0.15s'
              }}>
                {q.completed && <span style={{ color: '#000', fontSize: '11px', fontWeight: 'bold' }}>✓</span>}
              </div>
              <div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: q.completed ? 'var(--text-primary)' : 'var(--text-secondary)',
                  textDecoration: q.completed ? 'line-through' : 'none',
                  opacity: q.completed ? 0.7 : 1
                }}>{q.title}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{q.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Status & Analytics Side Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="dust-card" style={{ textAlign: 'center', padding: '24px' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', letterSpacing: '0.2em', color: 'var(--text-ghost)', marginBottom: '16px' }}>
              CONCLUSÃO DO DIA
            </div>
            <div style={{
              fontSize: '48px',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 800,
              color: pct === 100 ? 'var(--scout-primary)' : 'var(--text-primary)'
            }}>
              {pct}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px' }}>
              {completedCount} de {quests.length} Quests Concluídas
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              background: 'var(--bg-surface)',
              borderRadius: '2px',
              marginTop: '16px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${pct}%`,
                height: '100%',
                background: 'var(--scout-primary)',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          <div className="dust-card">
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', letterSpacing: '0.15em', color: 'var(--text-ghost)', marginBottom: '12px' }}>
              SUGESTÕES DE FOCO
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Mantenha a constância diária para solidificar a rotina. Dedique pelo menos 20 minutos focados a cada um de seus hobbies hoje (Matemática, Engenharia e Xadrez).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
