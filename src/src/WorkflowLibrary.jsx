import { useState, useMemo } from "react"

// ─── DATA ──────────────────────────────────────────────────────────────────
const WORKFLOW_DB = [
  {
    id: "w1",
    title: "Automated Social Media Content Publisher",
    category: "Social Media",
    tech: ["n8n", "OpenAI GPT-4", "LangChain", "pollinations.ai"],
    link: "https://drive.google.com/file/d/16jOzRwqjY7ncWhBPbfXLX6V1Nkl0HqzB",
    linkLabel: "Google Drive",
    status: "Em Uso",
    purpose: "Automatiza criação e publicação de conteúdo com IA no Twitter, Instagram, Facebook, LinkedIn, Threads e YouTube Shorts. Gera imagens e posts contextuais a partir de prompts no Google Docs.",
    accent: "#a855f7",
  },
  {
    id: "w2",
    title: "AI-Powered Appointment Scheduler Chatbot",
    category: "Agendamento",
    tech: ["n8n", "OpenAI GPT-4", "Microsoft Outlook", "LangChain"],
    link: "https://drive.google.com/file/d/18563TRe1PCjEVkY2jLrGyKLXriiqpdDj",
    linkLabel: "Google Drive",
    status: "Em Uso",
    purpose: "Chatbot assistente pessoal que gerencia disponibilidade, agenda reuniões com fuso horário e envia notificações por e-mail via Outlook.",
    accent: "#3b82f6",
  },
  {
    id: "w3",
    title: "AI Phone Agent with RetellAI & RAG",
    category: "Suporte",
    tech: ["RetellAI", "OpenAI GPT-4o-mini", "Qdrant", "Google Agenda", "Telegram"],
    link: "https://drive.google.com/file/d/1kf0VqM0MJD4mNrkQeo51nNKZqmPzvn8U",
    linkLabel: "Google Drive",
    status: "Em Testes",
    purpose: "Agente telefônico com IA usando RetellAI para voz, RAG com Qdrant para recuperação de conhecimento e agendamento automático. Envia resumos via Telegram.",
    accent: "#06b6d4",
  },
  {
    id: "w4",
    title: "AI WhatsApp Chatbot: Text, Voice, Image, PDF",
    category: "Suporte",
    tech: ["n8n", "WhatsApp API", "OpenAI GPT-4o-mini"],
    link: "https://drive.google.com/file/d/1ex5rvdYYR6MUnZTfbEdfdWMVYyXDJVu7",
    linkLabel: "Google Drive",
    status: "Em Uso",
    purpose: "Chatbot multimodal para WhatsApp que processa texto, voz, imagens e PDFs com GPT-4o-mini para gerar respostas contextuais inteligentes.",
    accent: "#22c55e",
  },
  {
    id: "w5",
    title: "Branded AI-Powered Website Chatbot",
    category: "Suporte",
    tech: ["n8n", "OpenAI"],
    link: "https://n8n.io/workflows/2786-create-a-branded-ai-powered-website-chatbot/",
    linkLabel: "n8n.io",
    status: "Backlog",
    purpose: "Cria um chatbot com identidade visual de marca para sites, usando IA para responder dúvidas de visitantes em tempo real.",
    accent: "#f59e0b",
  },
  {
    id: "w6",
    title: "Company Enrichment from Website Content",
    category: "Leads",
    tech: ["n8n", "OpenAI GPT-3"],
    link: "https://n8n.io/workflows/1862-openai-gpt-3-company-enrichment-from-website-content/",
    linkLabel: "n8n.io",
    status: "Backlog",
    purpose: "Extrai e enriquece dados de empresas a partir do conteúdo de seus websites usando GPT-3, gerando inteligência de mercado automatizada.",
    accent: "#f97316",
  },
  {
    id: "w7",
    title: "Gmail AI Auto-Responder",
    category: "Agendamento",
    tech: ["n8n", "OpenAI", "Gmail API"],
    link: "https://n8n.io/workflows/2271-gmail-ai-auto-responder-create-draft-replies-to-incoming-emails/",
    linkLabel: "n8n.io",
    status: "Backlog",
    purpose: "Lê e-mails recebidos no Gmail e gera rascunhos de resposta automáticos usando IA, agilizando o fluxo de comunicação.",
    accent: "#ec4899",
  },
  {
    id: "w8",
    title: "Generate Leads with Google Maps",
    category: "Leads",
    tech: ["n8n", "Google Maps API"],
    link: "https://n8n.io/workflows/2605-generate-leads-with-google-maps/",
    linkLabel: "n8n.io",
    status: "Em Uso",
    purpose: "Extrai dados de empresas do Google Maps (nome, telefone, endereço, avaliação) para gerar listas de leads qualificados automaticamente.",
    accent: "#10b981",
  },
]

const CATEGORIES = ["Todos", "Social Media", "Leads", "Agendamento", "Suporte"]

const STATUS_STYLE = {
  "Em Uso":    "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30",
  "Em Testes": "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30",
  "Backlog":   "bg-[#71717a]/10 text-[#71717a]  border-[#71717a]/30",
}

// ─── WORKFLOW CARD ──────────────────────────────────────────────────────────
function WorkflowCard({ wf }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxShadow: hovered ? `0 0 32px 0 ${wf.accent}22, 0 0 0 1px ${wf.accent}44` : "",
        borderColor: hovered ? `${wf.accent}44` : "#1a1a22",
        transition: "all 0.3s ease",
      }}
      className="relative bg-[#0d0d10]/80 backdrop-blur-sm border rounded-sm p-5 flex flex-col gap-3 cursor-default"
    >
      {/* Top Row */}
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-[#71717a]">
          {wf.category}
        </span>
        <span className={`text-[9px] font-mono tracking-widest uppercase border px-2 py-0.5 rounded-sm ${STATUS_STYLE[wf.status]}`}>
          {wf.status}
        </span>
      </div>

      {/* Title */}
      <h3
        className="text-[13px] font-semibold leading-snug transition-colors duration-300"
        style={{ color: hovered ? wf.accent : "#e3e3e6" }}
      >
        {wf.title}
      </h3>

      {/* Purpose */}
      <p className="text-[11px] text-[#71717a] leading-relaxed flex-1">
        {wf.purpose}
      </p>

      {/* Tech Stack */}
      <div className="flex flex-wrap gap-1.5">
        {wf.tech.map(t => (
          <span
            key={t}
            className="text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-sm border border-[#1a1a22] text-[#71717a] bg-[#111115]/60"
          >
            {t}
          </span>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-[#1a1a22]/70" />

      {/* Action */}
      <a
        href={wf.link}
        target="_blank"
        rel="noopener noreferrer"
        style={{ borderColor: `${wf.accent}44`, color: wf.accent }}
        className="w-full text-center text-[10px] font-mono tracking-[0.18em] uppercase border py-2 rounded-sm hover:opacity-80 transition-opacity"
      >
        ABRIR NO {wf.linkLabel.toUpperCase()} ↗
      </a>
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function WorkflowLibrary() {
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [searchQuery, setSearchQuery] = useState("")

  const filtered = useMemo(() => {
    return WORKFLOW_DB.filter(wf => {
      const matchCategory = activeCategory === "Todos" || wf.category === activeCategory
      const q = searchQuery.toLowerCase()
      const matchSearch = !q ||
        wf.title.toLowerCase().includes(q) ||
        wf.purpose.toLowerCase().includes(q) ||
        wf.tech.some(t => t.toLowerCase().includes(q)) ||
        wf.category.toLowerCase().includes(q)
      return matchCategory && matchSearch
    })
  }, [activeCategory, searchQuery])

  const inUseCount = WORKFLOW_DB.filter(w => w.status === "Em Uso").length

  return (
    <div className="space-y-8 fade-in">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="border border-[#1a1a22] bg-[#0d0d10]/80 p-6 rounded-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xs tracking-[0.3em] text-[#a855f7] uppercase font-light mb-1">
              Dust // Workflow Library
            </h2>
            <p className="text-[11px] text-[#71717a] font-mono">
              Base de dados de automações ativas — n8n · Scripts · Agentes de IA
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[9px] font-mono text-[#71717a] tracking-widest uppercase">Ativos técnicos</span>
            <div className="flex gap-2">
              <span className="text-[9px] font-mono px-2 py-0.5 border border-[#1a1a22] text-[#22c55e] rounded-sm bg-[#22c55e]/5">
                {inUseCount} em uso
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 border border-[#1a1a22] text-[#71717a] rounded-sm">
                {WORKFLOW_DB.length} total
              </span>
            </div>
          </div>
        </div>

        {/* Search + Category Filters */}
        <div className="flex flex-col gap-3">
          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#71717a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607z"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, tech, finalidade... (ex: Lead, WhatsApp)"
              className="w-full bg-[#111115]/80 border border-[#1a1a22] text-[#e3e3e6] text-[11px] font-mono pl-8 pr-4 py-2.5 rounded-sm outline-none focus:border-[#a855f7]/50 placeholder:text-[#71717a]/50 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#e3e3e6] transition-colors text-sm"
              >
                ×
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[9px] font-mono tracking-[0.15em] uppercase px-3 py-2 border rounded-sm transition-all duration-200 ${
                  activeCategory === cat
                    ? "border-[#a855f7] text-[#a855f7] bg-[#a855f7]/10 shadow-purple-glow"
                    : "border-[#1a1a22] text-[#71717a] hover:border-[#a855f7]/40 hover:text-[#a855f7]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── RESULTS META ───────────────────────────────────────────── */}
      {(searchQuery || activeCategory !== "Todos") && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-[#71717a]">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            {searchQuery ? ` para "${searchQuery}"` : ""}
            {activeCategory !== "Todos" ? ` em ${activeCategory}` : ""}
          </span>
          <button
            onClick={() => { setSearchQuery(""); setActiveCategory("Todos") }}
            className="text-[9px] font-mono text-[#a855f7] hover:underline"
          >
            limpar filtros
          </button>
        </div>
      )}

      {/* ── GRID ───────────────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(wf => (
            <WorkflowCard key={wf.id} wf={wf} />
          ))}
        </div>
      ) : (
        <div className="border border-[#1a1a22] bg-[#0d0d10]/60 rounded-sm py-16 flex flex-col items-center gap-3">
          <svg className="w-8 h-8 text-[#71717a]/40" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/>
          </svg>
          <p className="text-[11px] font-mono text-[#71717a]">Nenhum workflow encontrado.</p>
          <button
            onClick={() => { setSearchQuery(""); setActiveCategory("Todos") }}
            className="text-[9px] font-mono tracking-widest uppercase text-[#a855f7] border border-[#a855f7]/30 px-4 py-1.5 rounded-sm hover:bg-[#a855f7]/10 transition"
          >
            Limpar filtros
          </button>
        </div>
      )}

      {/* ── FUTURE SECTIONS STUB ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-[#1a1a22]/40 border-dashed rounded-sm p-5 flex flex-col items-center gap-2">
          <svg className="w-5 h-5 text-[#71717a]/30" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"/>
          </svg>
          <p className="text-[9px] font-mono tracking-[0.2em] text-[#71717a]/30 uppercase text-center">[ GIT REPOS ] — Em breve</p>
        </div>
        <div className="border border-[#1a1a22]/40 border-dashed rounded-sm p-5 flex flex-col items-center gap-2">
          <svg className="w-5 h-5 text-[#71717a]/30" fill="none" stroke="currentColor" strokeWidth="1.25" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 3.741-1.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"/>
          </svg>
          <p className="text-[9px] font-mono tracking-[0.2em] text-[#71717a]/30 uppercase text-center">[ SKILLS ] — Em breve</p>
        </div>
      </div>

    </div>
  )
}
