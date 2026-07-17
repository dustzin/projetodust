import React, { useState, useEffect } from 'react';
import { SystemLogger } from './App.jsx';

const INITIAL_NEWS = [
  {
    id: 'news-1',
    title: 'Aceleração de Chips Quânticos em Escala de Silício',
    summary: 'Nova arquitetura modular de semicondutores atinge coerência em temperatura ambiente, impactando as teses de computação e modelagem de Veronica.',
    category: 'CIÊNCIA',
    impact: 'Alto (Veronica Tese +15%)',
    relevance: 90,
    source: 'Nature Physics',
    timestamp: '15m atrás'
  },
  {
    id: 'news-2',
    title: 'Restrições à Exportação de Metais Raros na Ásia',
    summary: 'Tensões geopolíticas crescentes provocam embargos de exportação de Neodímio e Gálio, afetando a cadeia de produção global de tecnologia e mercados de semicondutores.',
    category: 'GEOPOLÍTICA',
    impact: 'Médio (Mercado EWZ -1.2%)',
    relevance: 75,
    source: 'Reuters Intelligence',
    timestamp: '45m atrás'
  },
  {
    id: 'news-3',
    title: 'Fed Mantém Taxa de Juros e Sinaliza Flexibilização',
    summary: 'Em pronunciamento surpresa, o Federal Reserve sinaliza redução nas taxas nas próximas sessões de comitê. BTC reage com alta e volatilidade aumenta.',
    category: 'MERCADO',
    impact: 'Crítico (Trading Bot ativo)',
    relevance: 95,
    source: 'Bloomberg Terminal',
    timestamp: '1h atrás'
  },
  {
    id: 'news-4',
    title: 'Fusão Nuclear Comercial Alcança Q-Factor de 1.8',
    summary: 'Reator experimental de confinamento magnético sustenta plasma estável por mais de 5 minutos. Tese de física clássica e ressonância vibracional validada.',
    category: 'CIÊNCIA',
    impact: 'Médio (VibPhys Model)',
    relevance: 80,
    source: 'MIT Tech Review',
    timestamp: '3h atrás'
  }
];

export default function OmniNews({ onUpdateTokenUsage }) {
  const [news, setNews] = useState(INITIAL_NEWS);
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchLogs, setSearchLogs] = useState([]);
  
  // Heatmap nodes data
  const [heatmapNodes, setHeatmapNodes] = useState([
    { name: 'América do Norte', x: 70, y: 70, val: 85, color: '#a855f7' },
    { name: 'Europa', x: 170, y: 65, val: 60, color: '#06b6d4' },
    { name: 'Ásia-Pacífico', x: 260, y: 90, val: 95, color: '#10b981' },
    { name: 'América Latina', x: 100, y: 160, val: 40, color: '#eab308' },
    { name: 'África', x: 180, y: 140, val: 30, color: '#f97316' }
  ]);

  const handleExaSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchLogs([
      '[Exa API] Iniciando conexão com o indexador neural...',
      `[Exa API] Buscando por: "${searchQuery}"`,
      '[FireCrawl] Ignorando barreiras de antibot e capturando markup...',
      '[Stark-Filter] Analisando relevância semântica e calculando impactos...',
    ]);

    if (onUpdateTokenUsage) {
      onUpdateTokenUsage('exa', 15);
    }

    setTimeout(() => {
      setSearchLogs(prev => [...prev, '[Stark-Filter] Análise de sentimento concluída. Novo insight detectado!']);
      
      const newArticle = {
        id: `news-${Date.now()}`,
        title: `Deep Search: ${searchQuery.slice(0, 45)}...`,
        summary: `Resultados sintetizados de 12 fontes via Exa/FireCrawl. A pesquisa sobre '${searchQuery}' demonstra alto grau de correlação com geopolítica e mercados no trimestre corrente.`,
        category: searchQuery.toLowerCase().includes('física') || searchQuery.toLowerCase().includes('quantum') ? 'CIÊNCIA' : 
                  searchQuery.toLowerCase().includes('dolar') || searchQuery.toLowerCase().includes('trade') ? 'MERCADO' : 'GEOPOLÍTICA',
        impact: 'Calculado pelo JARVIS (Relevância Dinâmica)',
        relevance: Math.floor(Math.random() * 30) + 70,
        source: 'Exa Omniscience Core',
        timestamp: 'Agora mesmo'
      };

      setNews(prev => [newArticle, ...prev]);
      
      // Update heatmap values randomly to simulate live changes
      setHeatmapNodes(prev => prev.map(node => ({
        ...node,
        val: Math.min(100, Math.max(20, node.val + Math.floor(Math.random() * 30) - 15))
      })));

      setIsSearching(false);
      setSearchQuery('');

      // Central Event Bus Dispatch
      window.dispatchEvent(new CustomEvent('DUST_EVENT', {
        detail: { 
          type: 'NEWS_ALERT', 
          source: 'OMNI_NEWS', 
          message: `Nova notícia adicionada: ${newArticle.title}` 
        }
      }));
    }, 2000);
  };

  const filteredNews = news.filter(n => filter === 'ALL' || n.category === filter);

  return (
    <div className="space-y-6 fade-in p-4 text-[#e3e3e6] font-mono select-none">
      
      {/* 2D Heatmap SVG Visualizer */}
      <div className="bg-[#0b0b0d]/80 border border-[#1a1a22] p-5 rounded-sm relative overflow-hidden">
        <h3 className="text-xs text-[#a855f7] uppercase tracking-wider mb-4 flex items-center">
          <span className="w-2 h-2 bg-[#a855f7] rounded-full mr-2 animate-ping"></span>
          Global Relevance Heatmap // OMNISCIÊNCIA v10.0
        </h3>
        
        <div className="flex justify-center items-center w-full bg-[#050508]/50 border border-[#1a1a22]/50 p-2 rounded-sm relative">
          <svg className="w-full max-w-[500px] h-[220px]" viewBox="0 0 350 220" xmlns="http://www.w3.org/2000/svg">
            {/* Simulated abstract map grids */}
            <path d="M10,40 L60,40 L90,70 L110,70 M80,120 L110,180 L130,190 M130,60 L180,40 L220,70 L250,70 M250,90 L280,80 L320,110 L340,110" 
                  fill="none" stroke="#1a1a28" strokeWidth="1.5" strokeDasharray="5,5" />
            
            {/* Heatmap Node Glow Circles */}
            {heatmapNodes.map((node, idx) => {
              const radius = node.val / 4;
              const opacity = node.val / 100 * 0.45;
              return (
                <g key={idx} className="cursor-pointer hover:opacity-80 transition-opacity">
                  <defs>
                    <radialGradient id={`glow-${idx}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={node.color} stopOpacity={opacity * 1.5} />
                      <stop offset="100%" stopColor={node.color} stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  
                  {/* Glowing aura */}
                  <circle cx={node.x} cy={node.y} r={radius * 2} fill={`url(#glow-${idx})`} className="animate-pulse" />
                  
                  {/* Node Center Point */}
                  <circle cx={node.x} cy={node.y} r="4" fill={node.color} />
                  
                  {/* Text Label */}
                  <text x={node.x} y={node.y - 12} textAnchor="middle" fill="#71717a" fontSize="7" letterSpacing="0.5">
                    {node.name.toUpperCase()} ({node.val}%)
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Exa/FireCrawl Deep Search Terminal */}
      <div className="bg-[#0b0b0d] border border-[#1a1a22] p-5 rounded-sm grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className="text-xs text-[#06b6d4] uppercase tracking-wider">Exa / FireCrawl Deep Engine</h3>
          <p className="text-[11px] text-[#71717a] font-sans leading-relaxed">
            Busca neural descentralizada. Insira um tópico para fazer varredura em tempo real na rede mundial. O DUST processará e auto-categorizará a relevância geopolítica, de mercado e científica.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o tema de pesquisa Stark..."
              className="flex-1 bg-[#111115] border border-[#1a1a22] text-xs text-[#e3e3e6] px-3 py-2 outline-none font-mono focus:border-[#06b6d4]/40"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExaSearch();
              }}
            />
            <button
              onClick={handleExaSearch}
              disabled={isSearching}
              className="px-4 py-2 bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 border border-[#06b6d4]/30 text-[#06b6d4] text-xs transition-colors rounded-sm"
            >
              {isSearching ? '[ BUSCANDO... ]' : '[ DEEP SEARCH ]'}
            </button>
          </div>
        </div>
        
        <div className="bg-[#050507] border border-[#1a1a22] p-4 rounded-sm h-[130px] overflow-y-auto flex flex-col justify-start text-[10px] text-[#06b6d4] space-y-1">
          {searchLogs.length === 0 ? (
            <span className="text-[#71717a] italic">[Aguardando gatilho de busca neural...]</span>
          ) : (
            searchLogs.map((log, i) => <div key={i}>{log}</div>)
          )}
        </div>
      </div>

      {/* News Feeds with Filter tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1a1a22] pb-3">
          <h3 className="text-xs text-[#e3e3e6] uppercase tracking-wider">Feed OMNI-NEWS</h3>
          
          <div className="flex space-x-1">
            {['ALL', 'GEOPOLÍTICA', 'MERCADO', 'CIÊNCIA'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2 py-0.5 text-[9px] border transition-all ${filter === cat ? 'bg-[#a855f7]/20 text-[#a855f7] border-[#a855f7]/30' : 'text-[#71717a] border-transparent hover:text-[#e3e3e6]'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredNews.map((n) => (
            <div
              key={n.id}
              className="bg-[#0b0b0d]/70 border border-[#1a1a22] p-4 rounded-sm hover:border-[#a855f7]/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-2">
                  <span className={`text-[9px] px-1.5 py-0.5 border rounded-sm font-bold ${
                    n.category === 'CIÊNCIA' ? 'text-[#10b981] bg-[#10b981]/5 border-[#10b981]/20' :
                    n.category === 'MERCADO' ? 'text-[#06b6d4] bg-[#06b6d4]/5 border-[#06b6d4]/20' :
                    'text-[#f59e0b] bg-[#f59e0b]/5 border-[#f59e0b]/20'
                  }`}>
                    [{n.category}]
                  </span>
                  <span className="text-[10px] text-[#71717a]">{n.source} • {n.timestamp}</span>
                </div>
                <h4 className="text-xs font-bold text-[#e3e3e6]">{n.title}</h4>
                <p className="text-[11px] text-[#a1a1aa] font-sans leading-relaxed">{n.summary}</p>
              </div>

              <div className="flex flex-col items-end border-t md:border-t-0 md:border-l border-[#1a1a22] pt-3 md:pt-0 md:pl-4 text-[10px] min-w-[150px] gap-1">
                <div className="flex justify-between w-full">
                  <span className="text-[#71717a]">RELEVÂNCIA:</span>
                  <span className="text-[#a855f7] font-bold">{n.relevance}%</span>
                </div>
                <div className="flex justify-between w-full">
                  <span className="text-[#71717a]">IMPACTO:</span>
                  <span className="text-[#e3e3e6] font-semibold">{n.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
