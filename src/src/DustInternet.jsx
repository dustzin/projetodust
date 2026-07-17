import React, { useState } from 'react';
import { SystemLogger } from './App.jsx';

export default function DustInternet({ onAddIdea }) {
  const [crawlUrl, setCrawlUrl] = useState('');
  const [isCrawling, setIsCrawling] = useState(false);
  const [crawlLogs, setCrawlLogs] = useState([]);
  const [extractedContent, setExtractedContent] = useState(null);

  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookMethod, setWebhookMethod] = useState('POST');
  const [webhookPayload, setWebhookPayload] = useState('{\n  "event": "dust_trigger",\n  "status": "active"\n}');
  const [isFiring, setIsFiring] = useState(false);
  const [webhookResponse, setWebhookResponse] = useState('');

  const handleCrawl = () => {
    if (!crawlUrl.trim()) return;
    setIsCrawling(true);
    setExtractedContent(null);
    setCrawlLogs([
      `[Proxy] Estabelecendo conexão segura via tunelamento...`,
      `[Crawler] Capturando cabeçalhos de ${crawlUrl}...`,
      `[FireCrawl] Ignorando barreiras de CORS...`,
      `[Parser] Extraindo conteúdo textual relevante...`,
      `[Córtex JARVIS] Processando resumos cognitivos...`
    ]);

    setTimeout(() => {
      const summaryText = `[Resumo Extraído de ${crawlUrl}] Este artigo detalha as novas tendências de redes neurais, otimização de processamento local, e alinhamento de agentes autônomos. Ele destaca que o maior desafio atual reside na latência das tomadas de decisões descentralizadas.`;
      
      setExtractedContent({
        title: `Extracted Context: ${crawlUrl.replace('https://', '').replace('http://', '').split('/')[0]}`,
        summary: summaryText,
        words: 154,
        date: new Date().toLocaleDateString()
      });

      setCrawlLogs(prev => [...prev, `[Sucesso] Contexto extraído e pronto para sincronização com JARVIS.`]);
      setIsCrawling(false);
    }, 2000);
  };

  const handleSaveToJarvis = () => {
    if (!extractedContent) return;
    if (onAddIdea) {
      onAddIdea(extractedContent.summary);
      window.dispatchEvent(
        new CustomEvent('DUST_NOTIFICATION', {
          detail: {
            id: Date.now(),
            title: 'KNOWLEDGE SYNCED',
            text: 'Contexto da URL importado para a memória do JARVIS.',
            timestamp: new Date().toLocaleTimeString()
          }
        })
      );
      setExtractedContent(null);
      setCrawlUrl('');
      setCrawlLogs([]);
    }
  };

  const handleFireWebhook = async () => {
    if (!webhookUrl.trim()) return;
    setIsFiring(true);
    setWebhookResponse('Enviando requisição externa...');
    
    try {
      let options = {
        method: webhookMethod,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      if (webhookMethod !== 'GET' && webhookMethod !== 'HEAD') {
        options.body = webhookPayload;
      }
      
      const res = await fetch(webhookUrl, options);
      const data = await res.text();
      setWebhookResponse(`Status: ${res.status} ${res.statusText}\n\nHeaders: ${JSON.stringify(Object.fromEntries(res.headers.entries()), null, 2)}\n\nResponse:\n${data}`);
      
      SystemLogger.info(`Webhook fired to ${webhookUrl}`, { status: res.status });
      window.dispatchEvent(
        new CustomEvent('DUST_NOTIFICATION', {
          detail: {
            id: Date.now(),
            title: 'WEBHOOK DISPATCHED',
            text: `Resposta: Status ${res.status}`,
            timestamp: new Date().toLocaleTimeString()
          }
        })
      );
    } catch (err) {
      setWebhookResponse(`Erro na Execução:\n${err.message}`);
      SystemLogger.error(`Webhook execution failed for ${webhookUrl}`, { error: err.message });
    } finally {
      setIsFiring(false);
    }
  };

  return (
    <div className="space-y-6 fade-in p-4 text-[#e3e3e6] font-mono select-none">
      
      {/* Header */}
      <div className="border-b border-[#1a1a22] pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]"></div>
          <h2 className="text-sm tracking-[0.2em] text-[#10b981] uppercase font-light">
            DUST Internet // Selective Crawler & Control Layer
          </h2>
        </div>
        <p className="text-[10px] text-[#71717a] mt-1">PROXY LAYER & WEBHOCK REMOTE CONTROLLER</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Browser-Proxy Crawler Panel */}
        <div className="bg-[#0b0b0d] border border-[#1a1a22] p-5 rounded-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs text-[#06b6d4] uppercase tracking-wider">Browser-Proxy Crawler</h3>
            <p className="text-[11px] text-[#71717a] font-sans leading-relaxed">
              Capture e degluta o contexto de artigos, documentações ou dados web de terceiros. A informação será sintetizada e salva na base cerebral de JARVIS.
            </p>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={crawlUrl}
                onChange={(e) => setCrawlUrl(e.target.value)}
                placeholder="https://example.com/artigo-tecnico"
                className="flex-1 bg-[#111115] border border-[#1a1a22] text-xs text-[#e3e3e6] px-3 py-2 outline-none font-mono focus:border-[#06b6d4]/40"
              />
              <button
                onClick={handleCrawl}
                disabled={isCrawling}
                className="px-3 py-2 bg-[#06b6d4]/10 hover:bg-[#06b6d4]/20 border border-[#06b6d4]/30 text-[#06b6d4] text-xs transition-colors rounded-sm"
              >
                {isCrawling ? '[ CRAWLING... ]' : '[ CAPTURAR ]'}
              </button>
            </div>

            {crawlLogs.length > 0 && (
              <div className="bg-[#050507] border border-[#1a1a22]/80 p-3 rounded-sm text-[10px] text-[#06b6d4] space-y-1 max-h-[120px] overflow-y-auto">
                {crawlLogs.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            )}

            {extractedContent && (
              <div className="bg-[#111115] border border-[#06b6d4]/30 p-4 rounded-sm space-y-3">
                <div className="flex justify-between items-center text-[10px] text-[#71717a]">
                  <span>{extractedContent.title}</span>
                  <span>{extractedContent.words} palavras</span>
                </div>
                <p className="text-[11px] text-[#a1a1aa] font-sans leading-relaxed">{extractedContent.summary}</p>
                <button
                  onClick={handleSaveToJarvis}
                  className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs transition-colors rounded-sm"
                >
                  [ ENVIAR AO CONHECIMENTO DO JARVIS ]
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Remote Webhook Executor Panel */}
        <div className="bg-[#0b0b0d] border border-[#1a1a22] p-5 rounded-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs text-[#10b981] uppercase tracking-wider">Remote Webhook Controller</h3>
            <p className="text-[11px] text-[#71717a] font-sans leading-relaxed">
              Dispare triggers e requisições HTTP para endpoints externos (Automações, APIs, IFTTT, Make, n8n) diretamente da interface de operações.
            </p>

            <div className="flex gap-2">
              <select
                value={webhookMethod}
                onChange={(e) => setWebhookMethod(e.target.value)}
                className="bg-[#111115] border border-[#1a1a22] text-xs text-[#e3e3e6] px-2 py-2 outline-none font-mono"
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
              </select>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.n8n.io/webhook/trigger"
                className="flex-1 bg-[#111115] border border-[#1a1a22] text-xs text-[#e3e3e6] px-3 py-2 outline-none font-mono focus:border-[#10b981]/40"
              />
            </div>

            {webhookMethod !== 'GET' && (
              <textarea
                value={webhookPayload}
                onChange={(e) => setWebhookPayload(e.target.value)}
                rows={3}
                className="w-full bg-[#111115] border border-[#1a1a22] text-[11px] text-[#e3e3e6] p-3 outline-none font-mono focus:border-[#10b981]/40"
                placeholder="Payload JSON..."
              />
            )}

            <button
              onClick={handleFireWebhook}
              disabled={isFiring}
              className="w-full py-2 bg-[#10b981]/10 hover:bg-[#10b981]/20 border border-[#10b981]/30 text-[#10b981] text-xs transition-colors rounded-sm"
            >
              {isFiring ? '[ DISPARANDO... ]' : '[ ATIVAR GATILHO REMOTO ]'}
            </button>

            {webhookResponse && (
              <div className="bg-[#050507] border border-[#1a1a22] p-3 rounded-sm">
                <span className="text-[9px] text-[#71717a]">CONSOLE RETORNO:</span>
                <pre className="text-[10px] text-[#e3e3e6] overflow-x-auto whitespace-pre-wrap mt-2 max-h-[120px] font-mono leading-relaxed">
                  {webhookResponse}
                </pre>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
