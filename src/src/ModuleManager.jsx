import React, { useState } from 'react';
import SimulationCanvas from './SimulationCanvas.jsx';
import { ErrorBoundary } from './App.jsx';

// Codebase-Memory MCP Indexer Dashboard (Module 2)
const FieldCanvas = () => {
  const [isIndexing, setIsIndexing] = useState(false);
  const [progress, setProgress] = useState(100);
  const [currentFile, setCurrentFile] = useState('Standby');
  const [logEntries, setLogEntries] = useState([
    'System: Codebase Memory graph loaded.',
    'Graph: 4 active repositories indexed in SQLite vector db.',
    'Status: Sub-ms lookup listener listening on port 3012.'
  ]);

  const handleReindex = () => {
    if (isIndexing) return;
    setIsIndexing(true);
    setProgress(0);
    setLogEntries([]);
    import('./webAudio.js').then(m => m.playSciFiSound('drag_start'));

    const mockFiles = [
      'src/App.jsx',
      'src/ModuleManager.jsx',
      'electron.cjs',
      'src/DustStore.jsx',
      'DESIGN.md',
      'package.json',
      'dist_desktop/resources/app/electron.cjs'
    ];

    let fileIndex = 0;
    const interval = setInterval(() => {
      if (fileIndex < mockFiles.length) {
        const file = mockFiles[fileIndex];
        setCurrentFile(file);
        setLogEntries(prev => [...prev, `[INDEXING] ${file} (parsed in ${(Math.random() * 4 + 1).toFixed(2)}ms)`]);
        setProgress(Math.round(((fileIndex + 1) / mockFiles.length) * 100));
        fileIndex++;
      } else {
        clearInterval(interval);
        setIsIndexing(false);
        setCurrentFile('Concluído');
        setLogEntries(prev => [
          ...prev,
          '✓ [SUCCESS] Codebase Graph rebuilt.',
          'Summary: 158 languages active. Average latency: 0.28ms.',
          'Saved: 99.1% tokens saved via Knowledge Graph pre-caching.'
        ]);
        import('./webAudio.js').then(m => m.playSciFiSound('drop_agent'));
      }
    }, 400);
  };

  return (
    <div className="w-full h-full bg-[#0d0d12]/95 border border-[#1a1a22] p-5 flex flex-col font-sans text-xs text-[#e3e3e6] space-y-4 rounded-sm">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-[#1a1a22] pb-3 shrink-0">
        <div>
          <h3 className="text-sm font-semibold tracking-wider text-[#10b981] flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75 ${isIndexing ? '' : 'hidden'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isIndexing ? 'bg-amber-400' : 'bg-[#10b981]'}`}></span>
            </span>
            <span>Codebase-Memory MCP Server</span>
          </h3>
          <p className="text-[9px] font-mono text-[#71717a] mt-0.5">
            Knowledge Graph Indexer • V.E.R.O.N.I.C.A. Lab Link
          </p>
        </div>
        <button
          onClick={handleReindex}
          disabled={isIndexing}
          className={`px-3 py-1.5 rounded-sm border text-[9px] font-mono tracking-widest uppercase transition-all cursor-pointer ${
            isIndexing 
              ? 'border-amber-500/30 bg-amber-500/10 text-amber-400 cursor-not-allowed'
              : 'border-[#10b981]/30 hover:border-[#10b981] bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981]'
          }`}
        >
          {isIndexing ? 'Indexando...' : 'Reindexar Codebase'}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        <div className="bg-[#111115] border border-white/5 p-3 rounded-sm">
          <span className="text-[9px] font-mono text-[#71717a] uppercase block">Query Latency</span>
          <div className="text-lg font-bold text-white mt-1">0.85 <span className="text-[10px] text-[#71717a] font-normal">ms</span></div>
        </div>
        <div className="bg-[#111115] border border-white/5 p-3 rounded-sm">
          <span className="text-[9px] font-mono text-[#71717a] uppercase block">Token Reduction</span>
          <div className="text-lg font-bold text-[#10b981] mt-1">-99.1%</div>
        </div>
        <div className="bg-[#111115] border border-white/5 p-3 rounded-sm">
          <span className="text-[9px] font-mono text-[#71717a] uppercase block">Active Languages</span>
          <div className="text-lg font-bold text-[#a855f7] mt-1">158 <span className="text-[10px] text-[#71717a] font-normal">Langs</span></div>
        </div>
      </div>

      {/* Progress Panel */}
      {isIndexing && (
        <div className="bg-[#111115] border border-amber-500/20 p-3.5 rounded-sm space-y-2 shrink-0">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-amber-400">Escaneando: {currentFile}</span>
            <span className="text-[#71717a]">{progress}%</span>
          </div>
          <div className="w-full bg-[#0d0d12] h-1 rounded-full overflow-hidden">
            <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {/* Logs View */}
      <div className="flex-1 min-h-[160px] bg-black/40 border border-[#1a1a22] rounded-sm p-3.5 font-mono text-[10px] overflow-y-auto space-y-1.5 scrollbar-thin">
        {logEntries.map((log, index) => (
          <div 
            key={index} 
            className={`${
              log.includes('[SUCCESS]') || log.includes('✓') ? 'text-[#10b981]' :
              log.includes('[INDEXING]') ? 'text-amber-300/80' : 'text-[#71717a]'
            }`}
          >
            {log}
          </div>
        ))}
      </div>
    </div>
  );
};


// Placeholder for Module 3
const QuantumCanvas = () => (
  <div className="w-full h-full flex items-center justify-center bg-[#0d0d12] border border-[#1a1a22] text-[#71717a] font-mono text-xs">
    [ MÓDULO 3 - QUÂNTICA: Simulador de Dupla Fenda (EM BREVE) ]
  </div>
);

// Placeholder for Module 4
const ThesisEditor = () => (
  <div className="w-full h-full bg-[#0d0d12] border border-[#1a1a22] p-6 overflow-y-auto text-[#e3e3e6] font-mono text-xs">
    <h3 className="text-[#00ffcc] mb-4 uppercase tracking-widest border-b border-[#1a1a22] pb-2">Editor de Manifesto Vivo</h3>
    <p className="mb-2 opacity-70">Acesse /data/VibPhys_Hub/thesis_manifesto.md para editar.</p>
    <div className="p-4 bg-[#111115] border border-[#1a1a22] rounded-sm text-[#a855f7]">
      [PHYS_MODEL] tags vinculam variáveis físicas à simulação.
    </div>
  </div>
);

// Module 5: Study Guide
const StudyGuide = () => (
  <div className="w-full h-full bg-[#0d0d12] border border-[#1a1a22] p-6 overflow-y-auto text-[#e3e3e6] font-mono text-xs space-y-6">
    <h3 className="text-[#00ffcc] uppercase tracking-widest border-b border-[#1a1a22] pb-2">Guia de Estudos: VibPhys</h3>
    
    <div className="space-y-6">
      <div>
        <h4 className="text-[#a855f7] font-bold mb-2">🏛️ Módulo 1: O Comportamento do Meio (Ondulatória Clássica)</h4>
        <p className="text-[#71717a] mb-2">O objetivo aqui é entender como qualquer coisa vibra no espaço.</p>
        <ul className="list-disc list-inside space-y-1 text-[#e3e3e6]/80 ml-2">
          <li><strong>O Oscilador Harmônico Simples:</strong> Estude a equação diferencial do movimento. Entenda a relação entre massa, mola (força restauradora) e frequência.</li>
          <li><strong>Ondas Mecânicas:</strong> Entenda o que é amplitude, frequência, período, comprimento de onda e velocidade de fase.</li>
          <li><strong>Ondas Estacionárias:</strong> O ponto crucial. Estude como ondas presas em uma caixa criam "nós" (pontos parados) e "ventres" (pontos de energia máxima). Isso é o que vai explicar a sua matéria.</li>
          <li><strong>Princípio da Superposição:</strong> Entenda como duas ondas somam suas energias.</li>
        </ul>
      </div>

      <div>
        <h4 className="text-[#a855f7] font-bold mb-2">🏛️ Módulo 2: O Meio Vibrante (Ondulatória em Campos)</h4>
        <p className="text-[#71717a] mb-2">Aqui você sai da corda de violão e entra no "oceano" do vácuo.</p>
        <ul className="list-disc list-inside space-y-1 text-[#e3e3e6]/80 ml-2">
          <li><strong>Equação de Onda de D'Alembert:</strong> A base matemática de como qualquer onda (som, luz, quântica) viaja pelo espaço.</li>
          <li><strong>Interferência e Difração:</strong> Como ondas contornam obstáculos e se cancelam.</li>
          <li><strong>O conceito de Transformada de Fourier:</strong> Este é o seu "tradutor". Aprenda o que ela faz: transforma um sinal bagunçado no tempo em frequências puras no domínio da frequência. Sem isso, você não decifra o universo.</li>
        </ul>
      </div>

      <div>
        <h4 className="text-[#a855f7] font-bold mb-2">🏛️ Módulo 3: A Transição Quântica (Onde a Física fica estranha)</h4>
        <p className="text-[#71717a] mb-2">Aqui você aplica o que aprendeu ao mundo subatômico.</p>
        <ul className="list-disc list-inside space-y-1 text-[#e3e3e6]/80 ml-2">
          <li><strong>Dualidade Onda-Partícula:</strong> O experimento da dupla fenda. Entenda que a "partícula" só existe onde a onda se condensa.</li>
          <li><strong>A Equação de Schrödinger:</strong> Não tente resolver a matemática complexa agora, mas entenda o conceito: a equação descreve como a função de onda evolui no espaço.</li>
          <li><strong>O Estado de Ressonância (Átomo de Bohr):</strong> Por que elétrons só ocupam certas órbitas? Porque eles são ondas estacionárias presas ao núcleo.</li>
        </ul>
      </div>

      <div>
        <h4 className="text-[#a855f7] font-bold mb-2">🏛️ Módulo 4: A Tese Vibracional (Sua Construção)</h4>
        <p className="text-[#71717a] mb-2">Aqui você aplica sua criatividade para criar a sua física.</p>
        <ul className="list-disc list-inside space-y-1 text-[#e3e3e6]/80 ml-2">
          <li><strong>Definição do Meio:</strong> Como o vácuo quântico se comporta como um fluido elástico? (Pesquise sobre Zero-Point Energy).</li>
          <li><strong>{"A Constante $\\beth_{DC}$:"}</strong> Com base no que aprendeu de fase no Módulo 2, defina matematicamente o desvio de fase.</li>
          <li><strong>Modelagem de Dispositivos:</strong> Aplique a teoria: Se eu tenho uma onda estacionária (matéria), como a minha constante muda a fase dela para que ela "atravesse" outra matéria?</li>
        </ul>
      </div>
    </div>
  </div>
);

export default function ModuleManager() {
  const [activeModule, setActiveModule] = useState(1);
  const [labData, setLabData] = useState({ 
    frequency: 0, 
    amplitude: 0, 
    phase: 0, 
    status: 'STANDBY',
    auditTrail: []
  });

  return (
    <div className="space-y-6 fade-in h-full flex flex-col" style={{
      backgroundImage: 'linear-gradient(#1a1a22 1px, transparent 1px), linear-gradient(90deg, #1a1a22 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      backgroundColor: '#0a0a0f'
    }}>
      {/* Header and Tabs */}
      <div className="bg-[#111115]/50 backdrop-blur-md border border-[#1a1a22] p-4 shadow-[0_0_20px_rgba(0,255,204,0.05)] mx-[-1px] mt-[-1px] flex flex-col gap-4">
        <div>
          <h3 className="text-xs tracking-[0.25em] text-[#00ffcc] uppercase font-bold">
            VibPhys Hub / Simulation Lab
          </h3>
          <p className="text-[10px] font-mono text-[#71717a] mt-1">
            Terminal de Engenharia e Ressonância
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {[
            { id: 1, label: 'MOD 1: OSCILADOR' },
            { id: 2, label: 'MOD 2: CAMPOS' },
            { id: 3, label: 'MOD 3: QUÂNTICA' },
            { id: 4, label: 'MOD 4: TESE' },
            { id: 5, label: 'ESTUDOS' }
          ].map(mod => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              className={`px-4 py-2 text-[10px] font-mono tracking-widest border transition-all cursor-pointer rounded-sm uppercase ${
                activeModule === mod.id 
                  ? 'border-[#00ffcc] bg-[#00ffcc]/10 text-[#00ffcc]' 
                  : 'border-[#1a1a22] text-[#71717a] hover:text-[#e3e3e6] hover:border-[#71717a]'
              }`}
            >
              {mod.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 gap-6 p-4">
        {/* Main View Area */}
        <div className="flex-1 min-h-[400px]">
          <ErrorBoundary>
            {activeModule === 1 && <SimulationCanvas onUpdateData={setLabData} />}
            {activeModule === 2 && <FieldCanvas />}
            {activeModule === 3 && <QuantumCanvas />}
            {activeModule === 4 && <ThesisEditor />}
            {activeModule === 5 && <StudyGuide />}
          </ErrorBoundary>
        </div>

        {/* Diegetic Control Panel */}
        <div className="w-80 bg-[#111115]/95 border border-[#1a1a22] p-5 shadow-[0_0_15px_rgba(0,255,204,0.05)] flex flex-col font-mono">
          <h4 className="text-[10px] tracking-widest text-[#71717a] border-b border-[#1a1a22] pb-3 mb-4 uppercase flex justify-between">
            <span>Console Técnico</span>
            <span className={labData.status === 'THEORY_MISMATCH' ? 'text-red-500 animate-pulse' : 'text-[#00ffcc]'}>
              ● REC
            </span>
          </h4>
          
          <div className="space-y-6 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[9px] text-[#71717a] uppercase">Frequência</span>
                <div className="text-xl text-[#00ffcc] mt-1 font-bold">{labData.frequency} <span className="text-[10px]">Hz</span></div>
              </div>
              <div>
                <span className="text-[9px] text-[#71717a] uppercase">Fase</span>
                <div className="text-xl text-[#e3e3e6] mt-1">{labData.phase} <span className="text-[10px]">rad</span></div>
              </div>
            </div>
            
            <div>
              <span className="text-[9px] text-[#71717a] uppercase">Amplitude (dB)</span>
              <div className="text-lg text-[#e3e3e6] mt-1">{labData.amplitude}</div>
            </div>
            
            <div>
              <span className="text-[9px] text-[#71717a] uppercase flex justify-between items-end">
                Status de Validação
              </span>
              <div className={`text-xs mt-2 p-2 border ${labData.status === 'THEORY_MISMATCH' ? 'border-red-500 text-red-400 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'border-[#00ffcc]/30 text-[#00ffcc] bg-[#00ffcc]/5'}`}>
                [{labData.status}]
              </div>
            </div>

            {/* Trilha de Auditoria */}
            <div className="pt-4 border-t border-[#1a1a22]/50">
              <span className="text-[9px] text-[#71717a] uppercase mb-2 block">Trilha de Auditoria (Divergência)</span>
              <div className="space-y-1">
                {(labData.auditTrail || []).length === 0 ? (
                  <div className="text-[9px] text-[#71717a]/50">Aguardando dados...</div>
                ) : (
                  (labData.auditTrail || []).map((entry, idx) => (
                    <div 
                      key={idx} 
                      className="flex justify-between text-[9px] hover:bg-[#1a1a22] p-1 rounded cursor-grab active:cursor-grabbing transition-colors"
                      draggable="true"
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', `DIVERGÊNCIA: ${entry.divergence}`);
                        import('./webAudio.js').then(m => m.playSciFiSound('drag_start'));
                      }}
                    >
                      <span className="text-[#71717a]">{entry.time}</span>
                      <span className={entry.isValid ? 'text-[#00ffcc]' : 'text-red-400'}>
                        {entry.divergence} {entry.isValid ? '✓' : '⚠'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto border-t border-[#1a1a22] pt-4">
            <div className="text-[8px] text-[#71717a]/50 text-center uppercase tracking-widest">
              DUST CORE v5.0 - LAB_STATION
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
