import { useState } from 'react'

// ── Sub-module definitions ────────────────────────────────────────
const SUBMODULES = [
  {
    id: 'deconinck',
    name: 'DE CONINCK & CO.',
    code: 'DCC-001',
    status: 'ACTIVE',
    accent: 'var(--ops-primary)',
    description: 'Agência de serviços de Inteligência Artificial · B2B Enterprise',
    icon: '◈',
    metrics: [
      { label: 'MODELO', value: 'B2B Agency' },
      { label: 'FOCO', value: 'AI Implementation' },
      { label: 'STATUS', value: 'ACTIVE' },
      { label: 'TIER', value: 'Enterprise' },
    ],
    details: `
## Estratégia de Aquisição

### Outbound de Elite
- **LinkedIn Sales Navigator:** Mapeamento cirúrgico de decisores (CTOs, diretores de operações, fundadores) com abordagem altamente personalizada.
- **Cold Mail + Loom:** Campanhas de email frio com demonstrações em vídeo personalizadas mostrando ineficiências identificadas nas empresas-alvo.
- **Networking de Elite:** Participação em ecossistemas fechados de fundadores e comunidades de alto nível.

### Inbound de Autoridade
- **Autoridade em Redes:** Cases técnicos reais de automação e engenharia de IA publicados no X e Instagram.
- **SEO Técnico:** Artigos aprofundados sobre implementação empresarial de IA.
- **Parcerias Estratégicas:** Indicação mútua com agências e consultores de vendas.

### Aquisição Automatizada — CHLOE
- **Sistema:** CHLOE (Conversational Hyper-Localized Outreach Engine)
- **Capacidade:** 200 disparos/dia sem trigger de spam
- **Função:** Qualificação de leads, agendamento de calls, triagem de intenção de compra
    `.trim()
  },
  {
    id: 'ultron',
    name: 'PROJETO ULTRON',
    code: 'ULT-002',
    status: 'PLANNING',
    accent: 'var(--data-primary)',
    description: 'Plataforma de automação cognitiva e orquestração de agentes autônomos',
    icon: '◎',
    metrics: [
      { label: 'TIPO', value: 'SaaS Platform' },
      { label: 'FASE', value: 'Blueprint' },
      { label: 'MARGEM ALVO', value: '>80%' },
      { label: 'MODELO', value: 'B2B SaaS' },
    ],
    details: `
## Visão do Produto

Plataforma de orquestração de agentes de IA para empresas e holdings que precisam de automação cognitiva avançada, com alto nível de controle e rastreabilidade.

### Diferenciais Estratégicos
- **Orquestração multi-agente:** Coordenação de N agentes simultâneos com contexto compartilhado.
- **Rastreabilidade total:** Audit trail completo de todas as decisões e ações dos agentes.
- **Integração nativa:** Conectores prontos para ERPs, CRMs e ferramentas de mercado.

### Modelo de Receita
- SaaS com tier por volume de operações/mês
- Implementação white-label para grandes clientes
- Revenue sharing em pipelines automatizados gerados

### Próximos Passos
1. Validar MVP com 3 clientes beta da carteira De Coninck & Co.
2. Desenvolver dashboard de controle com métricas de ROI em tempo real
3. Estruturar go-to-market B2B com foco em holdings e grupos empresariais
    `.trim()
  },
  {
    id: 'atlas',
    name: 'PROJETO ATLAS',
    code: 'ATL-003',
    status: 'RESEARCH',
    accent: 'var(--read-primary)',
    description: 'Fundo de investimento em ativos digitais e SaaS de alta margem',
    icon: '◇',
    metrics: [
      { label: 'TIPO', value: 'Investment Fund' },
      { label: 'FASE', value: 'Research' },
      { label: 'FOCO', value: 'Digital Assets' },
      { label: 'HORIZONTE', value: '3-5 Anos' },
    ],
    details: `
## Tese de Investimento

Fundo focado em aquisição e desenvolvimento de ativos digitais (SaaS, dados, IP) com margem bruta superior a 70% e potencial de escala global.

### Critérios de Seleção
- Margem bruta > 70%
- Mercado endereçável > USD 1B
- Diferencial técnico defensável (moat)
- Equipe fundadora com track record comprovado

### Pipeline de Análise
- Ferramentas de SaaS financeiro (FinTech B2B)
- Plataformas de dados e analytics
- Infraestrutura de IA (compute, tooling, APIs)
- PropTech de alta margem (software, não tijolo)

### Estrutura do Fundo
- Holding patrimonial como veículo principal
- Co-investimento com angels selecionados
- Objetivo: 10x em 5 anos com portfolio de 8-12 ativos
    `.trim()
  },
  {
    id: 'hermes',
    name: 'PROJETO HERMES',
    code: 'HRM-004',
    status: 'ACTIVE',
    accent: 'var(--gain)',
    description: 'Sistema de distribuição e go-to-market para produtos digitais da holding',
    icon: '◉',
    metrics: [
      { label: 'TIPO', value: 'Distribution Engine' },
      { label: 'FASE', value: 'Active' },
      { label: 'CANAIS', value: '5 Ativos' },
      { label: 'FOCO', value: 'B2B GTM' },
    ],
    details: `
## Motor de Distribuição

Sistema centralizado de go-to-market para todos os produtos da holding, integrando canais, automações e rastreamento de performance.

### Canais Ativos
- **Outbound automatizado:** Email sequences + LinkedIn via Apollo/Hunter
- **Content marketing:** Distribuição de cases e artigos técnicos
- **Parcerias de canal:** Rede de resellers e integradores
- **Paid acquisition:** Meta Ads e Google Ads para produtos validados
- **Comunidade:** Discord/Slack fechado para clientes e parceiros

### Stack de Ferramentas
- CRM: HubSpot / custom DUST integration
- Automação: Make.com + custom agents
- Analytics: Google Analytics 4 + Mixpanel
- Comunicação: WhatsApp Business API (CHLOE)

### KPIs do Sistema
- CAC por canal
- LTV / CAC ratio
- Time-to-close por segmento
- Pipeline coverage (3x meta mensal)
    `.trim()
  },
]

const STATUS_COLORS = {
  ACTIVE:    { color: 'var(--gain)',         bg: 'var(--gain-bg)' },
  PLANNING:  { color: 'var(--data-primary)', bg: 'var(--data-dim)' },
  RESEARCH:  { color: 'var(--read-primary)', bg: 'var(--read-dim)' },
  PAUSED:    { color: 'var(--text-muted)',   bg: 'var(--bg-surface)' },
}

// ── Simple Markdown renderer ──────────────────────────────────────
function MdRender({ text }) {
  if (!text) return null
  return (
    <div className="dust-markdown">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('## '))  return <h2 key={i}>{line.slice(3)}</h2>
        if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>
        if (line.startsWith('- **')) {
          const [, key, ...rest] = line.replace('- **', '').split('**')
          return (
            <p key={i} style={{ marginLeft: '12px', marginBottom: '3px', fontSize: '11px' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{key}:</span>
              <span style={{ color: 'var(--text-muted)' }}>{rest.join('').replace(/^:\s*/, ' ')}</span>
            </p>
          )
        }
        if (line.startsWith('- ')) return (
          <p key={i} style={{ marginLeft: '12px', marginBottom: '3px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--ops-primary)', marginRight: '6px' }}>▸</span>
            {line.slice(2)}
          </p>
        )
        if (/^\d+\./.test(line)) return (
          <p key={i} style={{ marginLeft: '12px', marginBottom: '3px', fontSize: '11px', color: 'var(--text-muted)' }}>
            {line}
          </p>
        )
        if (line.trim() === '') return <div key={i} style={{ height: '6px' }} />
        return <p key={i} style={{ fontSize: '11px', marginBottom: '4px', color: 'var(--text-muted)' }}>{line}</p>
      })}
    </div>
  )
}

export default function OperationsModule() {
  const [selectedId, setSelectedId] = useState(SUBMODULES[0].id)
  const selected = SUBMODULES.find(s => s.id === selectedId)

  return (
    <div className="module-page fade-in">
      {/* Header */}
      <div className="module-header">
        <div>
          <div className="module-title">
            <div className="module-accent-dot" style={{ background: 'var(--ops-primary)' }} />
            OPERATIONS CENTER
          </div>
          <div className="module-subtitle">Planos estratégicos ativos · Holdings · Projetos de alta margem</div>
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '9px',
          color: 'var(--text-ghost)',
          letterSpacing: '0.12em'
        }}>
          {SUBMODULES.filter(s => s.status === 'ACTIVE').length} ATIVOS · {SUBMODULES.length} TOTAL
        </div>
      </div>

      {/* Layout: sidebar list + detail */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', minHeight: '500px' }}>
        {/* Sub-module list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {SUBMODULES.map(sm => {
            const statusStyle = STATUS_COLORS[sm.status] || STATUS_COLORS.PAUSED
            const isActive = selectedId === sm.id

            return (
              <button
                key={sm.id}
                onClick={() => setSelectedId(sm.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: '6px',
                  padding: '12px 14px',
                  background: isActive ? 'var(--bg-hover)' : 'var(--bg-card)',
                  border: `1px solid ${isActive ? sm.accent : 'var(--border-dim)'}`,
                  borderLeft: `3px solid ${isActive ? sm.accent : 'transparent'}`,
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', color: isActive ? sm.accent : 'var(--text-ghost)' }}>
                      {sm.icon}
                    </span>
                    <span style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      letterSpacing: '0.06em'
                    }}>
                      {sm.name}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '7px',
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: statusStyle.color,
                    background: statusStyle.bg,
                    border: `1px solid ${statusStyle.color}33`,
                    padding: '2px 5px',
                    borderRadius: '2px',
                    flexShrink: 0
                  }}>
                    {sm.status}
                  </span>
                </div>
                <div style={{
                  fontSize: '9px',
                  color: 'var(--text-ghost)',
                  fontFamily: 'JetBrains Mono, monospace',
                  lineHeight: 1.4,
                  paddingLeft: '22px'
                }}>
                  {sm.code} · {sm.description.slice(0, 50)}...
                </div>
              </button>
            )
          })}
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="dust-card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Detail header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingBottom: '14px',
              borderBottom: '1px solid var(--border-dim)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '20px', color: selected.accent }}>{selected.icon}</span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '0.04em'
                  }}>
                    {selected.name}
                  </span>
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginLeft: '30px'
                }}>
                  {selected.description}
                </div>
              </div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '9px', color: 'var(--text-ghost)' }}>
                {selected.code}
              </div>
            </div>

            {/* Metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {selected.metrics.map(m => (
                <div key={m.label} style={{
                  padding: '10px 12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-dim)',
                  borderRadius: '2px'
                }}>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '7px',
                    fontWeight: 600,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: 'var(--text-ghost)',
                    marginBottom: '5px'
                  }}>{m.label}</div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: selected.accent
                  }}>{m.value}</div>
                </div>
              ))}
            </div>

            {/* Detail content */}
            <div className="scroll-area" style={{ flex: 1, maxHeight: '400px' }}>
              <MdRender text={selected.details} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
