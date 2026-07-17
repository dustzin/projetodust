import { useState, useEffect } from 'react'

export default function HobbiesModule() {
  const [activeTab, setActiveTab] = useState('math') // math | ee | chess

  // 1. Matemática States
  const [mathCount, setMathCount] = useState(0)
  const [mathTopics, setMathTopics] = useState([
    { name: 'Cálculo Limites & Derivadas', studied: false },
    { name: 'Álgebra Linear (Matrizes e Vetores)', studied: false },
    { name: 'Equações Diferenciais', studied: false },
    { name: 'Geometria Analítica', studied: false }
  ])
  const [mathNotes, setMathNotes] = useState('')

  // 2. Engenharia Elétrica States
  const [eeProjects, setEeProjects] = useState([
    { id: 1, name: 'Oscilador Astável Transistorizado', status: 'Montado', notes: 'Pronto na protoboard usando BC547.' },
    { id: 2, name: 'Fonte Regulada Linear LM317', status: 'Em andamento', notes: 'Falta soldar os diodos e capacitores na placa padrão.' }
  ])
  const [newProjectName, setNewProjectName] = useState('')
  const [eeNotes, setEeNotes] = useState('')

  // 3. Xadrez States
  const [elo, setElo] = useState(1200)
  const [chessHistory, setChessHistory] = useState([
    { id: 1, opponent: 'ChessBot_Medium', result: 'W', eloDiff: 8, date: '2026-07-13' },
    { id: 2, opponent: 'MagnusClone', result: 'L', eloDiff: -7, date: '2026-07-14' }
  ])
  const [newMatchOpponent, setNewMatchOpponent] = useState('')
  const [newMatchResult, setNewMatchResult] = useState('W')
  const [newMatchEloDiff, setNewMatchEloDiff] = useState(8)

  // Load stats from localStorage
  useEffect(() => {
    try {
      const savedMath = localStorage.getItem('dust_hobbies_math_v25')
      if (savedMath) {
        const parsed = JSON.parse(savedMath)
        setMathCount(parsed.count || 0)
        setMathTopics(parsed.topics || [])
        setMathNotes(parsed.notes || '')
      }
      const savedEe = localStorage.getItem('dust_hobbies_ee_v25')
      if (savedEe) {
        const parsed = JSON.parse(savedEe)
        setEeProjects(parsed.projects || [])
        setEeNotes(parsed.notes || '')
      }
      const savedChess = localStorage.getItem('dust_hobbies_chess_v25')
      if (savedChess) {
        const parsed = JSON.parse(savedChess)
        setElo(parsed.elo || 1200)
        setChessHistory(parsed.history || [])
      }
    } catch {}
  }, [])

  // Save actions
  const saveMath = (updatedCount, updatedTopics, updatedNotes) => {
    localStorage.setItem('dust_hobbies_math_v25', JSON.stringify({ count: updatedCount, topics: updatedTopics, notes: updatedNotes }))
  }

  const saveEe = (updatedProjects, updatedNotes) => {
    localStorage.setItem('dust_hobbies_ee_v25', JSON.stringify({ projects: updatedProjects, notes: updatedNotes }))
  }

  const saveChess = (updatedElo, updatedHistory) => {
    localStorage.setItem('dust_hobbies_chess_v25', JSON.stringify({ elo: updatedElo, history: updatedHistory }))
  }

  // 4. Books / Library States
  const [books, setBooks] = useState([
    { id: 1, title: 'Gödel, Escher, Bach', author: 'Douglas Hofstadter', status: 'Quero comprar', notes: 'Ligado à inteligência artificial, matemática e lógica.' },
    { id: 2, title: 'Microeletrônica', author: 'Sedra & Smith', status: 'Estudando', notes: 'Bíblia da engenharia elétrica para semicondutores.' }
  ])
  const [newBookTitle, setNewBookTitle] = useState('')
  const [newBookAuthor, setNewBookAuthor] = useState('')
  const [newBookStatus, setNewBookStatus] = useState('Quero comprar')

  // Load stats from localStorage
  useEffect(() => {
    try {
      const savedMath = localStorage.getItem('dust_hobbies_math_v25')
      if (savedMath) {
        const parsed = JSON.parse(savedMath)
        setMathCount(parsed.count || 0)
        setMathTopics(parsed.topics || [])
        setMathNotes(parsed.notes || '')
      }
      const savedEe = localStorage.getItem('dust_hobbies_ee_v25')
      if (savedEe) {
        const parsed = JSON.parse(savedEe)
        setEeProjects(parsed.projects || [])
        setEeNotes(parsed.notes || '')
      }
      const savedChess = localStorage.getItem('dust_hobbies_chess_v25')
      if (savedChess) {
        const parsed = JSON.parse(savedChess)
        setElo(parsed.elo || 1200)
        setChessHistory(parsed.history || [])
      }
      const savedBooks = localStorage.getItem('dust_hobbies_books_v25')
      if (savedBooks) {
        setBooks(JSON.parse(savedBooks))
      }
    } catch {}
  }, [])

  const saveBooks = (updatedBooks) => {
    localStorage.setItem('dust_hobbies_books_v25', JSON.stringify(updatedBooks))
  }

  // Books Handlers
  const addBook = () => {
    if (!newBookTitle.trim()) return
    const updated = [...books, {
      id: Date.now(),
      title: newBookTitle.trim(),
      author: newBookAuthor.trim() || 'Desconhecido',
      status: newBookStatus,
      notes: ''
    }]
    setBooks(updated)
    setNewBookTitle('')
    setNewBookAuthor('')
    saveBooks(updated)
  }

  const deleteBook = (id) => {
    const updated = books.filter(b => b.id !== id)
    setBooks(updated)
    saveBooks(updated)
  }

  const updateBookStatus = (id, status) => {
    const updated = books.map(b => b.id === id ? { ...b, status } : b)
    setBooks(updated)
    saveBooks(updated)
  }

  const updateBookNotes = (id, notes) => {
    const updated = books.map(b => b.id === id ? { ...b, notes } : b)
    setBooks(updated)
    saveBooks(updated)
  }

  // Matemática Handlers
  const handleMathCount = (val) => {
    const next = Math.max(0, mathCount + val)
    setMathCount(next)
    saveMath(next, mathTopics, mathNotes)
  }

  const toggleMathTopic = (index) => {
    const updated = mathTopics.map((t, idx) => idx === index ? { ...t, studied: !t.studied } : t)
    setMathTopics(updated)
    saveMath(mathCount, updated, mathNotes)
  }

  const handleMathNotes = (text) => {
    setMathNotes(text)
    saveMath(mathCount, mathTopics, text)
  }

  // Engenharia Elétrica Handlers
  const addProject = () => {
    if (!newProjectName.trim()) return
    const updated = [...eeProjects, { id: Date.now(), name: newProjectName, status: 'Planejado', notes: '' }]
    setEeProjects(updated)
    setNewProjectName('')
    saveEe(updated, eeNotes)
  }

  const deleteProject = (id) => {
    const updated = eeProjects.filter(p => p.id !== id)
    setEeProjects(updated)
    saveEe(updated, eeNotes)
  }

  const updateProjectStatus = (id, newStatus) => {
    const updated = eeProjects.map(p => p.id === id ? { ...p, status: newStatus } : p)
    setEeProjects(updated)
    saveEe(updated, eeNotes)
  }

  const updateProjectNotes = (id, notesText) => {
    const updated = eeProjects.map(p => p.id === id ? { ...p, notes: notesText } : p)
    setEeProjects(updated)
    saveEe(updated, eeNotes)
  }

  const handleEeNotes = (text) => {
    setEeNotes(text)
    saveEe(eeProjects, text)
  }

  // Xadrez Handlers
  const addMatch = () => {
    if (!newMatchOpponent.trim()) return
    const diff = Number(newMatchEloDiff)
    const updatedElo = elo + diff
    const newMatch = {
      id: Date.now(),
      opponent: newMatchOpponent,
      result: newMatchResult,
      eloDiff: diff,
      date: new Date().toISOString().split('T')[0]
    }
    const updatedHistory = [newMatch, ...chessHistory]
    setElo(updatedElo)
    setChessHistory(updatedHistory)
    setNewMatchOpponent('')
    saveChess(updatedElo, updatedHistory)
  }

  const deleteMatch = (id, diff) => {
    const updatedElo = elo - diff
    const updatedHistory = chessHistory.filter(h => h.id !== id)
    setElo(updatedElo)
    setChessHistory(updatedHistory)
    saveChess(updatedElo, updatedHistory)
  }

  return (
    <div className="module-page fade-in">
      {/* Header */}
      <div className="module-header">
        <div>
          <div className="module-title">
            <div className="module-accent-dot" style={{ background: 'var(--read-primary)' }} />
            HOBBIES & ESTUDOS
          </div>
          <div className="module-subtitle">Registro de evolução em Matemática, Engenharia Elétrica e Xadrez</div>
        </div>

        {/* Hobby Selector Tab Bar */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {[
            { id: 'math', label: '🧮 MATEMÁTICA', color: 'var(--data-primary)' },
            { id: 'ee', label: '⚡ ENG. ELÉTRICA', color: 'var(--inc-primary)' },
            { id: 'chess', label: '♟ XADREZ', color: 'var(--read-primary)' },
            { id: 'books', label: '📚 LIVROS', color: 'var(--scout-primary)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '9px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                padding: '8px 14px',
                border: `1px solid ${activeTab === tab.id ? tab.color : 'var(--border-dim)'}`,
                background: activeTab === tab.id ? `${tab.color}15` : 'transparent',
                color: activeTab === tab.id ? tab.color : 'var(--text-ghost)',
                borderRadius: '2px',
                cursor: 'pointer',
                transition: 'all var(--transition)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Area */}
      {activeTab === 'math' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }} className="fade-in">
          {/* Exercises and Topics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="dust-card">
              <div className="dust-card-header">
                <div className="dust-card-title">EXERCÍCIOS RESOLVIDOS</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '10px 0' }}>
                <div style={{ fontSize: '32px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--data-primary)' }}>
                  {mathCount}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-ghost" onClick={() => handleMathCount(1)}>+1 EXERCÍCIO</button>
                  <button className="btn btn-ghost" onClick={() => handleMathCount(5)}>+5</button>
                  <button className="btn btn-ghost" onClick={() => handleMathCount(-1)}>-</button>
                </div>
              </div>
            </div>

            <div className="dust-card">
              <div className="dust-card-header">
                <div className="dust-card-title">TÓPICOS DE ESTUDO</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                {mathTopics.map((t, idx) => (
                  <div
                    key={t.name}
                    onClick={() => toggleMathTopic(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 10px',
                      borderBottom: '1px solid var(--border-dim)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '12px',
                      height: '12px',
                      border: `1px solid ${t.studied ? 'var(--data-primary)' : 'var(--text-ghost)'}`,
                      borderRadius: '1px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: t.studied ? 'var(--data-primary)' : 'transparent'
                    }}>
                      {t.studied && <span style={{ color: '#000', fontSize: '9px', fontWeight: 'bold' }}>✓</span>}
                    </div>
                    <span style={{ fontSize: '11px', color: t.studied ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Math Notes */}
          <div className="dust-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="dust-card-header">
              <div className="dust-card-title">FÓRMULAS & NOTAS DE ESTUDO</div>
            </div>
            <textarea
              className="dust-textarea"
              style={{ flex: 1, minHeight: '320px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}
              placeholder="Escreva fórmulas úteis, regras teóricas ou teoremas...&#10;&#10;Ex: Derivada de e^x = e^x"
              value={mathNotes}
              onChange={e => handleMathNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      {activeTab === 'ee' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }} className="fade-in">
          {/* Projects and Circuits list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="dust-card">
              <div className="dust-card-header">
                <div className="dust-card-title">PROJETOS & CIRCUITOS</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <input
                  className="dust-input"
                  placeholder="Nome do novo circuito..."
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addProject()}
                />
                <button className="btn btn-ghost" onClick={addProject}>ADICIONAR</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {eeProjects.map(proj => (
                  <div key={proj.id} style={{ border: '1px solid var(--border-dim)', padding: '10px 12px', background: 'rgba(255,255,255,0.01)', borderRadius: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '11px' }}>{proj.name}</span>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <select
                          className="dust-select"
                          style={{ padding: '2px 5px', fontSize: '9px', width: 'auto' }}
                          value={proj.status}
                          onChange={e => updateProjectStatus(proj.id, e.target.value)}
                        >
                          <option>Planejado</option>
                          <option>Em andamento</option>
                          <option>Montado</option>
                          <option>Comissionado</option>
                        </select>
                        <button className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '9px' }} onClick={() => deleteProject(proj.id)}>✕</button>
                      </div>
                    </div>
                    <input
                      className="dust-input"
                      style={{ fontSize: '10px', padding: '4px 8px' }}
                      placeholder="Detalhes ou componentes do projeto..."
                      value={proj.notes}
                      onChange={e => updateProjectNotes(proj.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Electric notes */}
          <div className="dust-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="dust-card-header">
              <div className="dust-card-title">TEORIA & NOTAS DE CIRCUITOS</div>
            </div>
            <textarea
              className="dust-textarea"
              style={{ flex: 1, minHeight: '320px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }}
              placeholder="Notas rápidas conceituais: Lei de Ohm, Teorema de Thevenin, filtros ativos, transistores..."
              value={eeNotes}
              onChange={e => handleEeNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      {activeTab === 'chess' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }} className="fade-in">
          {/* Matches & Log */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="dust-card">
              <div className="dust-card-header">
                <div className="dust-card-title">RATING ELO ATUAL</div>
              </div>
              <div style={{ fontSize: '32px', fontFamily: 'JetBrains Mono, monospace', fontWeight: 800, color: 'var(--read-primary)' }}>
                {elo}
              </div>
            </div>

            <div className="dust-card">
              <div className="dust-card-header">
                <div className="dust-card-title">NOVA PARTIDA</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: '130px' }}>
                  <label className="field-label">OPONENTE</label>
                  <input className="dust-input" placeholder="User ou Bot..." value={newMatchOpponent} onChange={e => setNewMatchOpponent(e.target.value)} />
                </div>
                <div>
                  <label className="field-label">RESULTADO</label>
                  <select className="dust-select" value={newMatchResult} onChange={e => setNewMatchResult(e.target.value)}>
                    <option value="W">VITÓRIA (W)</option>
                    <option value="L">DERROTA (L)</option>
                    <option value="D">EMPATE (D)</option>
                  </select>
                </div>
                <div>
                  <label className="field-label">DIFERENÇA ELO</label>
                  <input className="dust-input" type="number" style={{ width: '80px' }} value={newMatchEloDiff} onChange={e => setNewMatchEloDiff(Number(e.target.value))} />
                </div>
              </div>
              <button className="btn btn-ghost" style={{ width: '100%', marginTop: '14px' }} onClick={addMatch}>REGISTRAR PARTIDA</button>
            </div>
          </div>

          {/* History list */}
          <div className="dust-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '420px', overflow: 'auto' }}>
            <div className="dust-card-header">
              <div className="dust-card-title">HISTÓRICO DE PARTIDAS</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {chessHistory.map(match => (
                <div
                  key={match.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 8px',
                    borderBottom: '1px solid var(--border-dim)',
                    fontSize: '11px'
                  }}
                >
                  <div>
                    <span style={{
                      fontWeight: 'bold',
                      color: match.result === 'W' ? 'var(--gain)' : match.result === 'L' ? 'var(--loss)' : 'var(--text-secondary)',
                      marginRight: '8px'
                    }}>
                      [{match.result}]
                    </span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>vs {match.opponent}</span>
                    <span style={{ fontSize: '9px', color: 'var(--text-ghost)', marginLeft: '8px' }}>{match.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      color: match.eloDiff >= 0 ? 'var(--gain)' : 'var(--loss)'
                    }}>
                      {match.eloDiff >= 0 ? `+${match.eloDiff}` : match.eloDiff}
                    </span>
                    <button className="btn btn-danger" style={{ padding: '1px 5px', fontSize: '8px' }} onClick={() => deleteMatch(match.id, match.eloDiff)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'books' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '16px' }} className="fade-in">
          {/* Books List & Adder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="dust-card">
              <div className="dust-card-header">
                <div className="dust-card-title">BIBLIOTECA & DESEJOS</div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    className="dust-input"
                    placeholder="Título do livro..."
                    value={newBookTitle}
                    onChange={e => setNewBookTitle(e.target.value)}
                  />
                  <input
                    className="dust-input"
                    placeholder="Autor..."
                    value={newBookAuthor}
                    onChange={e => setNewBookAuthor(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="dust-select"
                    style={{ flex: 1 }}
                    value={newBookStatus}
                    onChange={e => setNewBookStatus(e.target.value)}
                  >
                    <option value="Quero comprar">Quero comprar</option>
                    <option value="Comprado / Na fila">Comprado / Na fila</option>
                    <option value="Lendo">Lendo</option>
                    <option value="Estudando">Estudando</option>
                    <option value="Lido">Lido</option>
                  </select>
                  <button className="btn btn-ghost" onClick={addBook}>ADICIONAR</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {books.map(book => (
                  <div key={book.id} style={{ border: '1px solid var(--border-dim)', padding: '10px 12px', background: 'rgba(255,255,255,0.01)', borderRadius: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '11px', color: 'var(--text-primary)' }}>{book.title}</div>
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>por {book.author}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <select
                          className="dust-select"
                          style={{ padding: '2px 5px', fontSize: '9px', width: 'auto' }}
                          value={book.status}
                          onChange={e => updateBookStatus(book.id, e.target.value)}
                        >
                          <option value="Quero comprar">Quero comprar</option>
                          <option value="Comprado / Na fila">Comprado / Na fila</option>
                          <option value="Lendo">Lendo</option>
                          <option value="Estudando">Estudando</option>
                          <option value="Lido">Lido</option>
                        </select>
                        <button className="btn btn-danger" style={{ padding: '2px 6px', fontSize: '9px' }} onClick={() => deleteBook(book.id)}>✕</button>
                      </div>
                    </div>
                    <input
                      className="dust-input"
                      style={{ fontSize: '10px', padding: '4px 8px' }}
                      placeholder="Anotações conceituais ou link de compra..."
                      value={book.notes || ''}
                      onChange={e => updateBookNotes(book.id, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Library Info Side Panel */}
          <div className="dust-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="dust-card-header">
              <div className="dust-card-title">MÉTRICAS & STATUS</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Total cadastrados', value: books.length },
                { label: 'Quero comprar', value: books.filter(b => b.status === 'Quero comprar').length },
                { label: 'Em leitura / estudo', value: books.filter(b => b.status === 'Lendo' || b.status === 'Estudando').length },
                { label: 'Lidos', value: books.filter(b => b.status === 'Lido').length },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border-dim)'
                }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '8px', color: 'var(--text-ghost)', letterSpacing: '0.12em' }}>
                    {item.label.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'var(--text-secondary)' }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
