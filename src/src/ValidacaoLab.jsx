import React, { useState, useEffect } from 'react';
import { API_LAB, heuristicEngine } from './ideas_system';
import { PIPELINES } from './pipeline_chaining';
import { getAgentBehaviorEngine } from './agentBehavior';
import { playSciFiSound } from './webAudio.js';

export default function ValidacaoLab() {
  const [niche, setNiche] = useState('');
  const [suggestedPipeline, setSuggestedPipeline] = useState('Aguardando nicho...');
  
  // Checklist State
  const [checklist, setChecklist] = useState({
    manualProcess: false,
    firstClient: false,
    productization: false,
  });

  const [apiLabState, setApiLabState] = useState(API_LAB);
  const [radialMenu, setRadialMenu] = useState(null);

  const handleNicheChange = (e) => {
    const val = e.target.value;
    setNiche(val);
    setSuggestedPipeline(heuristicEngine(val));
  };

  const handleChecklistChange = (field) => {
    setChecklist(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const triggerError = () => {
    const behavior = getAgentBehaviorEngine();
    if (behavior) {
      const keys = Object.keys(apiLabState);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      
      // Update UI state to FALHOU
      setApiLabState(prev => ({
        ...prev,
        [randomKey]: { ...prev[randomKey], status_validacao: 'FALHOU' }
      }));

      behavior.simulatePipelineFailure(apiLabState[randomKey].pipeline_operacional || 'Genérico');
      
      // Auto recover after 15s to match agent behavior
      setTimeout(() => {
        setApiLabState(prev => ({
          ...prev,
          [randomKey]: { ...prev[randomKey], status_validacao: 'AGUARDANDO_TESTE' }
        }));
      }, 15000);
    }
  };

  return (
    <div className="space-y-6 text-[#e3e3e6] font-mono text-xs pb-20">
      
      {/* Niche & Suggestion Box */}
      <div className="bg-[#111115]/60 backdrop-blur-md border border-[#1a1a22] p-6 shadow-[0_0_15px_rgba(168,85,247,0.05)]">
        <h4 className="text-[10px] tracking-widest text-[#a855f7] border-b border-[#1a1a22] pb-3 mb-4 uppercase">
          Proposição Ativa de Venda
        </h4>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[9px] text-[#71717a] uppercase block mb-2">Definir Nicho-Alvo</label>
            <input 
              type="text" 
              value={niche}
              onChange={handleNicheChange}
              placeholder="Ex: Clínicas, B2B, E-commerce, Criadores..."
              className="w-full bg-[#0b0b0d] border border-[#1a1a22] p-3 text-xs focus:outline-none focus:border-[#a855f7] transition-colors"
            />
          </div>
          <div className="bg-[#0b0b0d] p-4 border border-[#a855f7]/30 text-[#00ffcc]">
            <span className="text-[9px] text-[#71717a] uppercase block mb-1">Pipeline Recomendado:</span>
            <strong>{suggestedPipeline}</strong>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pipelines Mapeados */}
        <div className="bg-[#111115]/60 backdrop-blur-md border border-[#1a1a22] p-6 shadow-[0_0_15px_rgba(0,255,204,0.05)]">
          <h4 className="text-[10px] tracking-widest text-[#71717a] border-b border-[#1a1a22] pb-3 mb-4 uppercase flex justify-between items-center">
            <span>Pipelines Operacionais</span>
            <button onClick={triggerError} className="bg-red-500/10 text-red-400 border border-red-500/30 px-2 py-1 hover:bg-red-500/20 transition-colors cursor-pointer">
              [ Simular Falha ]
            </button>
          </h4>
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
            {Object.values(PIPELINES).map((pipe, idx) => (
              <div key={idx} className="bg-[#0b0b0d] border border-[#1a1a22] p-3">
                <div className="text-[#00ffcc] font-bold mb-2 text-[11px]">{pipe.id}</div>
                <ul className="space-y-1">
                  {pipe.steps.map((step, sIdx) => (
                    <li key={sIdx} className="text-[#71717a] ml-2 flex gap-2">
                      <span className="text-[#a855f7]">↳</span> {step}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Repositório API_LAB & Checklist */}
        <div className="space-y-6">
          <div className="bg-[#111115]/60 backdrop-blur-md border border-[#1a1a22] p-6">
            <h4 className="text-[10px] tracking-widest text-[#71717a] border-b border-[#1a1a22] pb-3 mb-4 uppercase">
              Checklist de Produtização
            </h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={checklist.manualProcess} onChange={() => handleChecklistChange('manualProcess')} className="accent-[#a855f7]" />
                <span className={`transition-colors ${checklist.manualProcess ? 'text-[#a855f7] line-through' : 'text-[#e3e3e6] group-hover:text-[#00ffcc]'}`}>
                  Processo manual rodado e validado
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={checklist.firstClient} onChange={() => handleChecklistChange('firstClient')} className="accent-[#a855f7]" />
                <span className={`transition-colors ${checklist.firstClient ? 'text-[#a855f7] line-through' : 'text-[#e3e3e6] group-hover:text-[#00ffcc]'}`}>
                  Primeiro cliente (MVP) abordado e fechado
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" checked={checklist.productization} onChange={() => handleChecklistChange('productization')} className="accent-[#a855f7]" />
                <span className={`transition-colors ${checklist.productization ? 'text-[#a855f7] line-through' : 'text-[#e3e3e6] group-hover:text-[#00ffcc]'}`}>
                  Produtização estruturada (Pacote de Agência)
                </span>
              </label>
            </div>
          </div>

          <div className="bg-[#111115]/60 backdrop-blur-md border border-[#1a1a22] p-6">
            <h4 className="text-[10px] tracking-widest text-[#71717a] border-b border-[#1a1a22] pb-3 mb-4 uppercase">
              API_LAB (Stack Base)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(apiLabState).map(([key, api]) => (
                <div 
                  key={key} 
                  draggable="true"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', key);
                    playSciFiSound('drag_start');
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    playSciFiSound('radial_open');
                    setRadialMenu({ x: e.clientX, y: e.clientY, apiKey: key });
                  }}
                  className="bg-[#0b0b0d] p-2 border border-[#1a1a22] text-[9px] cursor-grab active:cursor-grabbing hover:border-[#a855f7]/50 transition-colors relative select-none"
                >
                  {api.status_validacao === 'FALHOU' && (
                    <div className="absolute inset-0 bg-red-500/10 pointer-events-none border border-red-500/50 animate-pulse"></div>
                  )}
                  <div className="text-[#e3e3e6] font-bold">{api.nome}</div>
                  <div className="text-[#71717a] mt-1">{api.uso_nicho}</div>
                  <div className={`mt-2 ${api.status_validacao === 'VALIDADA' ? 'text-[#00ffcc]' : api.status_validacao === 'FALHOU' ? 'text-red-500 animate-pulse' : 'text-yellow-500'}`}>
                    [{api.status_validacao}]
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL NEURAL PIPELINE */}
      <div className="mt-8 border-t border-[#1a1a22] pt-6">
        <h4 className="text-[10px] tracking-widest text-[#71717a] uppercase mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse shadow-[0_0_8px_#00ffcc]"></span>
          Neural Pipelines (Live Flow)
        </h4>
        <div className="flex flex-col gap-6">
          {Object.values(PIPELINES).map((pipe) => {
            const hasFailure = Object.values(apiLabState).some(api => 
              api.pipeline_operacional === pipe.id && api.status_validacao === 'FALHOU'
            );
            return (
              <div key={pipe.id} className="relative">
                <div className="text-[9px] text-[#00ffcc] font-mono mb-2 opacity-80">{pipe.id}</div>
                <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
                  {pipe.steps.map((step, idx) => (
                    <React.Fragment key={idx}>
                      <div className={`shrink-0 p-3 border ${hasFailure ? 'border-red-500/80 bg-red-950/40 animate-pulse text-red-200' : 'border-[#00ffcc]/30 bg-[#00ffcc]/5 text-[#e3e3e6]'} text-[9px] rounded-sm min-w-[140px] max-w-[200px] truncate shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all`}>
                        {step}
                      </div>
                      {idx < pipe.steps.length - 1 && (
                        <div className="flex flex-col items-center shrink-0 w-8">
                          <div className={`h-[2px] w-full ${hasFailure ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-[#00ffcc]/60 shadow-[0_0_8px_rgba(0,255,204,0.5)]'}`} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* TACTICAL RADIAL MENU */}
      {radialMenu && (
        <div 
          className="fixed inset-0 z-[200]"
          onContextMenu={(e) => { e.preventDefault(); setRadialMenu(null); }}
          onClick={() => setRadialMenu(null)}
        >
          <div 
            className="absolute rounded-full border border-[#00ffcc]/30 shadow-[0_0_30px_rgba(0,255,204,0.2)] bg-black/80 backdrop-blur-md flex items-center justify-center animate-spin-slow pointer-events-none"
            style={{ left: radialMenu.x - 75, top: radialMenu.y - 75, width: 150, height: 150 }}
          />
          <div 
            className="absolute flex items-center justify-center"
            style={{ left: radialMenu.x, top: radialMenu.y }}
          >
            {[
              { label: 'DELEGAR', deg: -90, color: 'text-purple-400 border-purple-500/50' },
              { label: 'ARQUIVAR', deg: 30, color: 'text-gray-400 border-gray-500/50' },
              { label: 'DESTRUIR', deg: 150, color: 'text-red-400 border-red-500/50' }
            ].map((opt, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  playSciFiSound('radial_select');
                  setRadialMenu(null);
                  if (opt.label === 'DESTRUIR') {
                     // Delete from state
                     const newState = { ...apiLabState };
                     delete newState[radialMenu.apiKey];
                     setApiLabState(newState);
                  }
                }}
                className={`absolute w-16 h-8 -ml-8 -mt-4 bg-[#0a0a0c] border ${opt.color} hover:bg-white/10 text-[8px] font-mono rounded-full transition-all hover:scale-110 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]`}
                style={{ transform: `rotate(${opt.deg}deg) translate(80px) rotate(${-opt.deg}deg)` }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
