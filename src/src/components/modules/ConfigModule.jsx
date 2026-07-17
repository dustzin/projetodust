import { useState, useEffect } from 'react'

const API = 'http://127.0.0.1:5174'

const PROVIDERS = [
  { id: 'gemini',     label: 'Google Gemini' },
  { id: 'deepseek',   label: 'DeepSeek' },
  { id: 'huggingface',label: 'HuggingFace' },
  { id: 'freellmapi', label: 'Free LLM / Local Proxy' },
]

const GEMINI_MODELS = [
  'auto', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash-preview-05-20'
]

export default function ConfigModule() {
  const [config, setConfig] = useState({ provider: 'gemini', token: '', model: 'auto', url: '' })
  const [saved, setSaved]   = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      try {
        const r = await fetch(`${API}/api/read?filePath=data/config.json`)
        const d = await r.json()
        if (d.success && d.content) {
          setConfig(JSON.parse(d.content))
        }
      } catch {}
    }
    loadConfig()
  }, [])

  const save = async () => {
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/sync-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const d = await r.json()
      if (d.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (e) {
      console.error('[CONFIG] Save error:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="module-page fade-in">
      <div className="module-header">
        <div>
          <div className="module-title">
            <div className="module-accent-dot" style={{ background: 'var(--text-muted)', animation: 'none' }} />
            CONFIGURAÇÃO DO SISTEMA
          </div>
          <div className="module-subtitle">Provider de IA · Tokens · Endpoints locais</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="dust-card">
          <div className="dust-card-header">
            <div className="dust-card-title">PROVIDER DE IA</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="field-label">PROVIDER</label>
              <select
                className="dust-select"
                value={config.provider}
                onChange={e => setConfig({ ...config, provider: e.target.value })}
              >
                {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">API KEY / TOKEN</label>
              <input
                className="dust-input"
                type="password"
                placeholder="sk-... / AIza... / hf_..."
                value={config.token}
                onChange={e => setConfig({ ...config, token: e.target.value })}
              />
            </div>
            {config.provider === 'gemini' ? (
              <div>
                <label className="field-label">MODELO GEMINI</label>
                <select
                  className="dust-select"
                  value={config.model}
                  onChange={e => setConfig({ ...config, model: e.target.value })}
                >
                  {GEMINI_MODELS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            ) : config.provider === 'freellmapi' ? (
              <>
                <div>
                  <label className="field-label">URL DO ENDPOINT LOCAL</label>
                  <input
                    className="dust-input"
                    placeholder="http://localhost:3001/v1"
                    value={config.url || ''}
                    onChange={e => setConfig({ ...config, url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-label">MODELO</label>
                  <input
                    className="dust-input"
                    placeholder="llama3, mistral, gpt-4o..."
                    value={config.model === 'auto' ? '' : config.model}
                    onChange={e => setConfig({ ...config, model: e.target.value || 'auto' })}
                  />
                </div>
              </>
            ) : null}
            <button
              className="btn"
              style={{
                justifyContent: 'center',
                color: saved ? 'var(--gain)' : 'var(--text-secondary)',
                borderColor: saved ? 'rgba(0,230,118,0.4)' : 'var(--border-dim)',
                background: saved ? 'var(--gain-bg)' : 'var(--bg-hover)',
                padding: '10px'
              }}
              onClick={save}
              disabled={loading}
            >
              {loading ? <><span className="spinner" /> SALVANDO...</>
                : saved ? '✓ SALVO COM SUCESSO'
                : '[ SALVAR CONFIGURAÇÃO ]'}
            </button>
          </div>
        </div>

        <div className="dust-card">
          <div className="dust-card-header">
            <div className="dust-card-title">INFORMAÇÕES DO SISTEMA</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'VERSÃO DO OS', value: 'DUST OS v2.5 — Life & Hobbies' },
              { label: 'ARQUITETURA', value: 'Electron + Vite + React 19' },
              { label: 'SERVER PORT', value: '5174 (local)' },
              { label: 'MÓDULOS ATIVOS', value: 'D-QUESTS · READINGS · HOBBIES · CONFIG' },
              { label: 'ESCOPO DE DADOS', value: 'Hábitos · Leitura · Estudos Pessoais' },
              { label: 'PROVIDER ATUAL', value: config.provider.toUpperCase() },
              { label: 'MODELO ATUAL', value: config.model },
            ].map(item => (
              <div key={item.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '8px 0',
                borderBottom: '1px solid var(--border-dim)',
                gap: '12px'
              }}>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '8px',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--text-ghost)',
                  flexShrink: 0
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  color: 'var(--text-secondary)',
                  textAlign: 'right'
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
