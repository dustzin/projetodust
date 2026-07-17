import React, { useState, useEffect, useRef } from 'react';
import { SystemLogger } from './App.jsx';
import { getAgentBehaviorEngine } from './agentBehavior.js';

const DEFAULT_SKILLS = [
  {
    id: 'omni_news',
    name: 'Omni-News Engine',
    description: 'Filtro Stark de relevância em tempo real com mapas de calor geopolíticos, econômicos e científicos.',
    version: 'v2.1.0',
    developer: 'FRIDAY',
    icon: '📰',
    category: 'Operações',
    dependencies: ['Exa API', 'FireCrawl Proxy'],
    systemImpact: 'Habilita painel Omni-News com filtros dinâmicos de inteligência.'
  },
  {
    id: 'trading_bot',
    name: 'Autonomous Trading Bot',
    description: 'Algoritmo de varredura financeira e disparo de ordens de trade com análise técnica preditiva.',
    version: 'v1.4.2',
    developer: 'FRIDAY',
    icon: '📈',
    category: 'Mercado',
    dependencies: ['Yahoo Finance API', 'Webhook Trigger'],
    systemImpact: 'FRIDAY adquire capacidade de execução autónoma no mercado financeiro.'
  },
  {
    id: 'quantum_sim',
    name: 'Quantum Sim Suite',
    description: 'Visualizador avançado de física vibracional de dupla fenda e estados quânticos superpostos.',
    version: 'v3.0.1',
    developer: 'VERONICA',
    icon: '⚛️',
    category: 'Laboratório',
    dependencies: ['VibPhys Engine'],
    systemImpact: 'VERONICA ganha capacidade de simulação de campos de Schrödinger no canvas.'
  },
  {
    id: 'browser_proxy',
    name: 'Browser-Proxy Crawler',
    description: 'Extração seletiva e sumarização profunda de URLs externas direto para o Córtex do JARVIS.',
    version: 'v2.0.0',
    developer: 'JARVIS',
    icon: '🌐',
    category: 'Internet',
    dependencies: ['Exa API', 'Crawl API'],
    systemImpact: 'JARVIS ganha a habilidade de engolir conhecimento de qualquer URL.'
  },
  {
    id: 'remote_exec',
    name: 'Remote Webhook Executor',
    description: 'Disparador de ações e comandos digitais via endpoints POST/GET externos (Remote Controller).',
    version: 'v1.1.0',
    developer: 'FRIDAY',
    icon: '🎮',
    category: 'Operações',
    dependencies: ['Network Client'],
    systemImpact: 'Transforma o DUST OS em controlador remoto da sua vida digital.'
  },
  {
    id: 'sentiment_analyser',
    name: 'Sentiment & Insight Parser',
    description: 'Análise semântica profunda de logs diários, humor, e insights cognitivos do operador.',
    version: 'v1.0.5',
    developer: 'JARVIS',
    icon: '🧠',
    category: 'Intelecto',
    dependencies: ['Gemini LLM API'],
    systemImpact: 'JARVIS expande o mapa de habilidades cognitivas e interpretação emocional.'
  }
];

export default function DustStore({ installedSkills, setInstalledSkills, onUpdateTokenUsage, tokenUsage }) {
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState([
    'DUST Package Manager v10.0.0',
    'Conectado ao DUST Vault. Digite "help" para listar comandos disponíveis.',
    ''
  ]);
  const [activeTab, setActiveTab] = useState('store'); // store, token-manager, terminal
  const terminalEndRef = useRef(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  const dispatchEvent = (title, text) => {
    window.dispatchEvent(
      new CustomEvent('DUST_NOTIFICATION', {
        detail: { id: Date.now(), title, text, timestamp: new Date().toLocaleTimeString() }
      })
    );
  };

  const handleInstall = (skillId) => {
    if (installedSkills.includes(skillId)) return;
    const skill = DEFAULT_SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    SystemLogger.info(`Installing skill: ${skill.name}`);
    const logs = [
      `[Vault] Iniciando instalação do pacote '${skillId}'...`,
      `[Vault] Resolvendo dependências para [${skill.dependencies.join(', ')}]...`,
      `[Vault] Baixando módulos do repositório descentralizado...`,
      `[Vault] Compilando arquivos binários de ${skill.developer}...`,
      `[Kernel] Registrando listeners no Event Bus...`,
      `[Kernel] Sucesso! Habilidade de '${skill.name}' integrada ao núcleo.`,
    ];

    let currentLogIdx = 0;
    const interval = setInterval(() => {
      if (currentLogIdx < logs.length) {
        setTerminalLogs(prev => [...prev, logs[currentLogIdx]]);
        currentLogIdx++;
      } else {
        clearInterval(interval);
        setInstalledSkills(prev => {
          const updated = [...prev, skillId];
          localStorage.setItem('dust_installed_skills', JSON.stringify(updated));
          return updated;
        });
        dispatchEvent('SKILL_INSTALLED', `Skill '${skill.name}' foi instalada com sucesso.`);
        window.dispatchEvent(new CustomEvent('DUST_EVENT', {
          detail: { type: 'STATE_TRANSITION', source: 'DUST_STORE', message: `Skill ${skill.name} instalada. Agentes atualizados.` }
        }));
      }
    }, 200);
  };

  const handleUninstall = (skillId) => {
    if (!installedSkills.includes(skillId)) return;
    const skill = DEFAULT_SKILLS.find(s => s.id === skillId);
    if (!skill) return;

    SystemLogger.info(`Uninstalling skill: ${skill.name}`);
    setInstalledSkills(prev => {
      const updated = prev.filter(id => id !== skillId);
      localStorage.setItem('dust_installed_skills', JSON.stringify(updated));
      return updated;
    });
    setTerminalLogs(prev => [
      ...prev,
      `[Vault] Removendo pacote '${skillId}' do núcleo do sistema...`,
      `[Kernel] Ouvintes do Event Bus desconectados.`,
      `[Vault] Desinstalação concluída.`
    ]);
    dispatchEvent('SKILL_UNINSTALLED', `Skill '${skill.name}' removida do sistema.`);
    window.dispatchEvent(new CustomEvent('DUST_EVENT', {
      detail: { type: 'STATE_TRANSITION', source: 'DUST_STORE', message: `Skill ${skill.name} desinstalada.` }
    }));
  };

  const executeCommand = (cmdText) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    setTerminalLogs(prev => [...prev, `dust@omniscience:~$ ${trimmed}`]);
    const parts = trimmed.split(' ');
    const command = parts[0].toLowerCase();

    if (command === 'help') {
      setTerminalLogs(prev => [
        ...prev,
        'Comandos disponíveis:',
        '  help                       Exibe esta ajuda.',
        '  list                       Lista todas as skills do DUST Vault.',
        '  install skill <id>        Instala uma skill pelo ID.',
        '  uninstall skill <id>      Desinstala uma skill pelo ID.',
        '  clear                      Limpa o console.',
        ''
      ]);
    } else if (command === 'clear') {
      setTerminalLogs([]);
    } else if (command === 'list') {
      setTerminalLogs(prev => {
        const listOutput = DEFAULT_SKILLS.map(s => {
          const status = installedSkills.includes(s.id) ? '[INSTALADO]' : '[DISPONÍVEL]';
          return `  - ${s.id.padEnd(20)} ${status.padEnd(14)} ${s.name} (${s.version})`;
        });
        return [...prev, 'Skills disponíveis no Vault:', ...listOutput, ''];
      });
    } else if (command === 'install' && parts[1] === 'skill' && parts[2]) {
      const targetId = parts[2];
      if (installedSkills.includes(targetId)) {
        setTerminalLogs(prev => [...prev, `[Erro] Skill '${targetId}' já está instalada.`, '']);
      } else if (DEFAULT_SKILLS.some(s => s.id === targetId)) {
        handleInstall(targetId);
      } else {
        setTerminalLogs(prev => [...prev, `[Erro] Skill '${targetId}' não encontrada no repositório.`, '']);
      }
    } else if (command === 'uninstall' && parts[1] === 'skill' && parts[2]) {
      const targetId = parts[2];
      if (!installedSkills.includes(targetId)) {
        setTerminalLogs(prev => [...prev, `[Erro] Skill '${targetId}' não está instalada.`, '']);
      } else {
        handleUninstall(targetId);
      }
    } else {
      setTerminalLogs(prev => [...prev, `[Erro] Comando não reconhecido: '${command}'. Digite 'help' para comandos.`, '']);
    }

    setTerminalInput('');
  };

  const currentTokenUsage = tokenUsage || {
    gemini: { used: 45200, limit: 100000 },
    exa: { used: 1200, limit: 5000 },
    webhooks: { used: 45, limit: 200 }
  };

  return (
    <div className="space-y-6 fade-in p-4 text-[#e3e3e6] font-mono select-none">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#1a1a22] pb-4 mb-4 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#a855f7] animate-pulse shadow-[0_0_8px_#a855f7]"></div>
            <h2 className="text-sm tracking-[0.2em] font-mono text-[#a855f7] uppercase font-light">
              DUST Store // Micro-Skills Registry
            </h2>
          </div>
          <p className="text-[10px] text-[#71717a] mt-1">SISTEMA OPERACIONAL MODULAR OMNISCIÊNCIA v10.0</p>
        </div>

        <div className="flex space-x-1 bg-[#111115] border border-[#1a1a22] p-1 rounded-sm">
          <button
            onClick={() => setActiveTab('store')}
            className={`px-3 py-1 text-xs transition-all ${activeTab === 'store' ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30' : 'text-[#71717a] hover:text-[#e3e3e6]'}`}
          >
            [ DISPONÍVEIS ]
          </button>
          <button
            onClick={() => setActiveTab('daas')}
            className={`px-3 py-1 text-xs transition-all ${activeTab === 'daas' ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30' : 'text-[#71717a] hover:text-[#e3e3e6]'}`}
          >
            [ D.a.a.S. MINING ]
          </button>
          <button
            onClick={() => setActiveTab('token-manager')}
            className={`px-3 py-1 text-xs transition-all ${activeTab === 'token-manager' ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30' : 'text-[#71717a] hover:text-[#e3e3e6]'}`}
          >
            [ RECURSOS API ]
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1 text-xs transition-all ${activeTab === 'terminal' ? 'bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30' : 'text-[#71717a] hover:text-[#e3e3e6]'}`}
          >
            [ VAULT TERMINAL ]
          </button>
        </div>
      </div>

      {activeTab === 'store' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEFAULT_SKILLS.map((skill) => {
            const isInstalled = installedSkills.includes(skill.id);
            return (
              <div
                key={skill.id}
                className={`bg-[#0b0b0d]/80 border ${isInstalled ? 'border-[#a855f7]/40 shadow-[0_0_15px_rgba(168,85,247,0.05)]' : 'border-[#1a1a22]'} p-5 rounded-sm relative overflow-hidden flex flex-col justify-between transition-all hover:border-[#a855f7]/60`}
              >
                <div className="absolute top-0 right-0 p-2 text-xs opacity-25">{skill.category}</div>
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{skill.icon}</span>
                    <div>
                      <h3 className="text-sm font-bold text-[#e3e3e6]">{skill.name}</h3>
                      <p className="text-[9px] text-[#71717a]">{skill.developer} • {skill.version}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#a1a1aa] mb-4 font-sans leading-relaxed">{skill.description}</p>
                  
                  <div className="space-y-2 border-t border-[#1a1a22] pt-3 mb-4">
                    <div className="flex text-[10px]">
                      <span className="text-[#71717a] w-24">DEPENDÊNCIAS:</span>
                      <span className="text-[#a855f7]">{skill.dependencies.join(', ')}</span>
                    </div>
                    <div className="flex text-[10px]">
                      <span className="text-[#71717a] w-24">IMPACTO JARVIS:</span>
                      <span className="text-[#c084fc] font-sans italic">{skill.systemImpact}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-[#1a1a22]/55">
                  {isInstalled ? (
                    <button
                      onClick={() => handleUninstall(skill.id)}
                      className="px-4 py-2 border border-red-500/30 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs transition-colors rounded-sm"
                    >
                      [ UNINSTALL SKILL ]
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInstall(skill.id)}
                      className="px-4 py-2 border border-[#a855f7]/40 bg-[#a855f7]/10 hover:bg-[#a855f7]/20 text-[#a855f7] text-xs transition-colors rounded-sm shadow-[0_0_8px_rgba(168,85,247,0.1)]"
                    >
                      [ INSTALL SKILL ]
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'token-manager' && (
        <div className="bg-[#0b0b0d] border border-[#1a1a22] p-6 rounded-sm space-y-6">
          <div className="flex items-center space-x-3 mb-2 border-b border-[#1a1a22] pb-3">
            <h3 className="text-xs text-[#a855f7] tracking-wider uppercase font-bold">API Global Resource Allocations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111115] border border-[#1a1a22] p-4 rounded-sm space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#e3e3e6] font-bold">GEMINI FLASH 3.5</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-1 border border-emerald-400/20">OPERACIONAL</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#71717a]">
                  <span>Tokens Usados:</span>
                  <span>{currentTokenUsage.gemini.used.toLocaleString()} / {currentTokenUsage.gemini.limit.toLocaleString()}</span>
                </div>
                <div className="w-full bg-[#1c1c24] h-2 rounded-sm overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#a855f7] to-[#c084fc] h-full"
                    style={{ width: `${(currentTokenUsage.gemini.used / currentTokenUsage.gemini.limit) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-[9px] text-[#71717a] font-sans">Responsável pelo Córtex do JARVIS e síntese cognitiva de dados.</p>
            </div>

            <div className="bg-[#111115] border border-[#1a1a22] p-4 rounded-sm space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#e3e3e6] font-bold">EXA / FIRECRAWL API</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-1 border border-cyan-400/20">AQUISIÇÃO</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#71717a]">
                  <span>Requisições:</span>
                  <span>{currentTokenUsage.exa.used} / {currentTokenUsage.exa.limit}</span>
                </div>
                <div className="w-full bg-[#1c1c24] h-2 rounded-sm overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-cyan-400 h-full"
                    style={{ width: `${(currentTokenUsage.exa.used / currentTokenUsage.exa.limit) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-[9px] text-[#71717a] font-sans">Varredura externa de inteligência, feeds de geopolítica.</p>
            </div>

            <div className="bg-[#111115] border border-[#1a1a22] p-4 rounded-sm space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#e3e3e6] font-bold">WEBHOOK DISPATCH</span>
                <span className="text-[10px] text-[#10b981] bg-[#10b981]/10 px-1 border border-[#10b981]/20">PRONTO</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#71717a]">
                  <span>Triggers Ativos:</span>
                  <span>{currentTokenUsage.webhooks.used} / {currentTokenUsage.webhooks.limit}</span>
                </div>
                <div className="w-full bg-[#1c1c24] h-2 rounded-sm overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-full"
                    style={{ width: `${(currentTokenUsage.webhooks.used / currentTokenUsage.webhooks.limit) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-[9px] text-[#71717a] font-sans">Execução remota para APIs externas e controle digital.</p>
            </div>
          </div>

          <div className="p-4 bg-[#111115]/50 border border-[#1a1a22] rounded-sm text-xs space-y-2">
            <h4 className="text-[#e3e3e6] font-bold">Políticas de Alocação Stark:</h4>
            <ul className="list-disc list-inside space-y-1 text-[#71717a] font-sans text-[11px]">
              <li>O estouro do limite aciona hibernação de agentes para conservar custos.</li>
              <li>A API de Exa é chamada sob demanda para o Omni-News ou na execução do Browser-Proxy.</li>
              <li>Webhook Triggers possuem timeout de 5000ms.</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'daas' && (
        <div className="bg-[#0b0b0d] border border-[#1a1a22] p-6 rounded-sm space-y-6">
          <div className="flex justify-between items-center border-b border-[#1a1a22] pb-3">
            <h3 className="text-xs text-[#a855f7] tracking-wider uppercase font-bold">F.R.I.D.A.Y. Data-as-a-Service (Data Mining console)</h3>
            <span className="text-[9px] font-mono border border-emerald-500/30 text-emerald-400 px-2 py-0.5 uppercase bg-emerald-950/10">
              MINING ENGINE READY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111115] border border-[#1a1a22] p-4 rounded-sm space-y-2">
              <span className="text-[10px] text-[#71717a] uppercase">TikTok Crawler</span>
              <div className="flex justify-between text-xs font-bold text-[#e3e3e6]">
                <span>Status:</span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
              <p className="text-[9px] text-[#71717a] font-sans">Varre hashtags e tópicos em ascensão contínua sobre IA e Dropshipping.</p>
            </div>
            <div className="bg-[#111115] border border-[#1a1a22] p-4 rounded-sm space-y-2">
              <span className="text-[10px] text-[#71717a] uppercase">Search Console</span>
              <div className="flex justify-between text-xs font-bold text-[#e3e3e6]">
                <span>Status:</span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
              <p className="text-[9px] text-[#71717a] font-sans">Extrai palavras-chave de intenção comercial com alto tráfego e baixa concorrência.</p>
            </div>
            <div className="bg-[#111115] border border-[#1a1a22] p-4 rounded-sm space-y-2">
              <span className="text-[10px] text-[#71717a] uppercase">Polymarket Pools</span>
              <div className="flex justify-between text-xs font-bold text-[#e3e3e6]">
                <span>Status:</span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
              <p className="text-[9px] text-[#71717a] font-sans">Mapeia mercados preditivos em tempo real para encontrar as maiores probabilidades de ganho.</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                const engine = getAgentBehaviorEngine();
                if (engine) {
                  engine.terminalLog.push('ops', '[CRAWLER] F.R.I.D.A.Y. iniciando varredura DaaS...');
                  engine.terminalLog.push('ops', '[CRAWLER] Obtendo dados de TikTok, Polymarket e Google...');
                }
                alert("Varredura DaaS executada! Veja o log no rodapé ou baixe o JSON gerado abaixo.");
              }}
              className="w-full py-3 border border-[#a855f7]/40 bg-[#a855f7]/10 hover:bg-[#a855f7]/20 text-[#a855f7] text-xs font-mono uppercase tracking-widest transition-colors rounded-sm cursor-pointer"
            >
              [ Executar Varredura F.R.I.D.A.Y. ]
            </button>

            <div className="bg-[#050507] border border-[#1a1a22] p-4 rounded-sm space-y-2">
              <div className="flex justify-between items-center border-b border-[#1a1a22]/50 pb-2">
                <span className="text-[10px] text-[#71717a]">OUTPUT DE ALTA PROBABILIDADE (JSON)</span>
                <button
                  onClick={() => {
                    const data = {
                      timestamp: new Date().toISOString(),
                      status: "SUCCESS",
                      assets: [
                        { source: "TikTok Trends", topic: "Nous Hermes controlando PC", probability: 0.95, trend: "UP" },
                        { source: "Polymarket", pool: "DeepSeek v5 Release 2026", probability: 0.89, trend: "STABLE" },
                        { source: "Google Search Console", keyword: "free auto ai agents download", volume: 15400, difficulty: "LOW" }
                      ]
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `friday_daas_insight_${Date.now()}.json`;
                    a.click();
                  }}
                  className="text-[9px] font-mono border border-emerald-500/30 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 px-2 py-0.5 uppercase transition-all duration-300 rounded-sm cursor-pointer"
                >
                  [ DOWNLOAD JSON ]
                </button>
              </div>
              <pre className="text-[10px] text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed select-text p-2 bg-black/40">
{`{
  "timestamp": "${new Date().toISOString()}",
  "status": "COMPLETED",
  "assets": [
    {
      "source": "TikTok Trends",
      "topic": "Nous Hermes controlando PC",
      "probability_score": 0.95,
      "actionable_insight": "Criar criativos focados no Nous Hermes controlando o desktop."
    },
    {
      "source": "Polymarket",
      "pool": "Will DeepSeek release v5 in 2026?",
      "probability_score": 0.89,
      "actionable_insight": "Produzir conteúdo técnico comparativo de IAs locais."
    },
    {
      "source": "Google Search Console",
      "keyword": "free auto ai agents download",
      "monthly_volume": 15400,
      "organic_difficulty": "LOW"
    }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'terminal' && (
        <div className="bg-[#050507] border border-[#1a1a22] rounded-sm overflow-hidden flex flex-col h-[350px]">
          <div className="bg-[#111115] px-4 py-2 border-b border-[#1a1a22] flex items-center justify-between">
            <span className="text-[10px] text-[#71717a]">VAULT INTERACTIVE PACKAGE MANAGER (CLI)</span>
            <div className="flex space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto text-xs text-[#a855f7] space-y-1 font-mono">
            {terminalLogs.map((log, i) => (
              <div key={i} className="min-h-[1.2rem] whitespace-pre-wrap">
                {log}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
          <div className="bg-[#0b0b0d] border-t border-[#1a1a22] px-4 py-2 flex items-center">
            <span className="text-xs text-[#a855f7] mr-2">dust@omniscience:~$</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') executeCommand(terminalInput);
              }}
              className="flex-1 bg-transparent border-none outline-none text-xs text-[#e3e3e6] font-mono"
              placeholder="Digite um comando..."
            />
          </div>
        </div>
      )}
    </div>
  );
}
