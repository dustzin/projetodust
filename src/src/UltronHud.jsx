import React from 'react';

export default function UltronHud({ playSound }) {
  const handleFeatureClick = (featureName) => {
    if (playSound) playSound('click');
  };

  return (
    <div className="space-y-6 fade-in text-[#e3e3e6]">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-baseline pb-3 border-b border-[#1a1a22]/50">
        <div>
          <h3 className="text-xs tracking-[0.25em] text-[#a855f7] uppercase font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#a855f7] rounded-sm animate-pulse"></span>
            ULTRON QUANT HUB // CORE ENGINE
          </h3>
          <p className="text-[10px] font-mono text-[#71717a] mt-1">
            MÓDULO QUANTITATIVO DE ALTA PERFORMANCE • ARCHITECTURE AND COGNITIVE SPECIFICATIONS
          </p>
        </div>
        <div className="text-[9px] font-mono text-purple-400 border border-purple-950 bg-purple-950/15 px-2.5 py-1 rounded-sm uppercase">
          SISTEMA AUDITADO // ATIVO
        </div>
      </div>

      {/* TOP ROW: ELITE TELEMETRY HUD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0b0c10]/95 border border-[#1a1a22] p-4 rounded-sm relative overflow-hidden group">
          <span className="text-[8px] font-mono text-[#71717a] uppercase block">FATOR SHARPE</span>
          <span className="text-xl font-bold font-mono text-[#e3e3e6] block mt-1">3.84</span>
          <span className="text-[8px] font-mono text-emerald-400 block mt-1">● RETORNO AJUSTADO AO RISCO</span>
        </div>

        <div className="bg-[#0b0c10]/95 border border-[#1a1a22] p-4 rounded-sm relative overflow-hidden group">
          <span className="text-[8px] font-mono text-[#71717a] uppercase block">TAXA DE SUCESSO</span>
          <span className="text-xl font-bold font-mono text-emerald-400 block mt-1">78.2%</span>
          <span className="text-[8px] font-mono text-[#71717a] block mt-1">WIN RATE HISTÓRICO</span>
        </div>

        <div className="bg-[#0b0c10]/95 border border-[#1a1a22] p-4 rounded-sm relative overflow-hidden group">
          <span className="text-[8px] font-mono text-[#71717a] uppercase block">EXPOSIÇÃO AO RISCO</span>
          <span className="text-xl font-bold font-mono text-red-400 block mt-1">&lt; 5.0%</span>
          <span className="text-[8px] font-mono text-red-500/80 block mt-1">DRAWDOWN LIMITE DIÁRIO</span>
        </div>

        <div className="bg-[#0b0c10]/95 border border-[#1a1a22] p-4 rounded-sm relative overflow-hidden group">
          <span className="text-[8px] font-mono text-[#71717a] uppercase block">RETORNO ANUAL (PnL)</span>
          <span className="text-xl font-bold font-mono text-purple-400 block mt-1">+142.6%</span>
          <span className="text-[8px] font-mono text-[#71717a] block mt-1">AUDITADO // BACKTEST & REAL</span>
        </div>
      </div>

      {/* CORE SPECIFICATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: SENTRY MODE */}
        <div 
          onClick={() => handleFeatureClick('sentry')}
          className="bg-[#111115]/95 border border-[#1a1a22] p-6 rounded-sm space-y-4 hover:border-purple-900/40 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-center border-b border-[#1a1a22] pb-3">
            <h4 className="text-[10px] tracking-widest text-[#a855f7] uppercase font-bold">
              MONITORAMENTO 24/7
            </h4>
            <span className="text-[8px] font-mono text-purple-400 uppercase">[ Sentry Mode ]</span>
          </div>
          <p className="text-xs text-[#a1a1aa] font-mono leading-relaxed">
            Varre simultaneamente mercados de Cripto, Previsões (Polymarket), Ações e Memecoins. 
            Não dorme, não tem emoção e não hesita. Uma execução puramente matemática e constante.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {['CRIPTO', 'POLYMARKET', 'AÇÕES', 'MEMECOINS'].map(market => (
              <div key={market} className="bg-[#0b0b0d] border border-[#1a1a22] px-2 py-1.5 text-center rounded-sm text-[8px] font-mono text-[#71717a] group-hover:text-purple-400 transition-colors">
                {market}
              </div>
            ))}
          </div>
        </div>

        {/* CARD 2: ARBITRAGE SYSTEM */}
        <div 
          onClick={() => handleFeatureClick('arbitrage')}
          className="bg-[#111115]/95 border border-[#1a1a22] p-6 rounded-sm space-y-4 hover:border-cyan-900/40 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-center border-b border-[#1a1a22] pb-3">
            <h4 className="text-[10px] tracking-widest text-[#06b6d4] uppercase font-bold">
              ARBITRAGEM DE INEFICIÊNCIA
            </h4>
            <span className="text-[8px] font-mono text-[#06b6d4] uppercase">[ Engine ]</span>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white block">Lag-Sniping:</span>
              <p className="text-[9px] font-mono text-[#71717a] leading-relaxed">
                Captura posições nos segundos finais de um contrato quando o preço está "atrasado" em relação à realidade externa.
              </p>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white block">Inventory Market-Making:</span>
              <p className="text-[9px] font-mono text-[#71717a] leading-relaxed">
                Ganha diretamente no spread (diferença entre compra e venda), agindo como a própria corretora em vez de apenas um apostador.
              </p>
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-white block">Rotation:</span>
              <p className="text-[9px] font-mono text-[#71717a] leading-relaxed">
                Ajusta a sua exposição dentro de um mesmo mercado conforme o ativo se move, preservando e consolidando o lucro acumulado.
              </p>
            </div>
          </div>
        </div>

        {/* CARD 3: RISK MANAGEMENT & AUDIT */}
        <div 
          onClick={() => handleFeatureClick('risk')}
          className="bg-[#111115]/95 border border-[#1a1a22] p-6 rounded-sm space-y-4 hover:border-red-900/40 transition-colors cursor-pointer"
        >
          <div className="flex justify-between items-center border-b border-[#1a1a22] pb-3">
            <h4 className="text-[10px] tracking-widest text-red-400 uppercase font-bold">
              GESTÃO DE RISCO E AUDITOR
            </h4>
            <span className="text-[8px] font-mono text-red-400 uppercase">[ Escudo ]</span>
          </div>

          <div className="space-y-4 font-mono">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-white block uppercase tracking-wider">Gestão de Risco (Escudo)</span>
              <p className="text-[9px] text-[#71717a] leading-relaxed">
                Programado com um **Kill-Switch** rígido. Se o sistema detecta um drawdown que ultrapassa o seu limite de segurança diário, ele corta todas as conexões, trava as execuções e te alerta instantaneamente no DUST.
              </p>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#1a1a22]">
              <span className="text-[10px] font-bold text-white block uppercase tracking-wider">Self-Correction (Aprendizado)</span>
              <p className="text-[9px] text-[#71717a] leading-relaxed">
                Mantém um banco de dados (**Auditor**) de todos os trades realizados. Auto-analisa as operações para entender o que deu errado e reescrever dinamicamente seus próprios parâmetros para o dia seguinte.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
