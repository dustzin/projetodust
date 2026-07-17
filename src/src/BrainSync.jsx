import React, { useState, useEffect } from 'react';
import { SystemLogger } from './App.jsx';

const HARD_CHALLENGES = [
  {
    type: 'LÓGICA',
    question: 'Em um torneio de xadrez com 10 participantes, cada jogador joga exatamente uma vez contra todos os outros. Se o vencedor obteve 8 pontos e ninguém empatou mais de 2 partidas, qual é o menor número possível de empates no torneio inteiro?',
    options: ['3', '4', '5', '6'],
    correct: '5',
    explanation: 'Como cada jogo dá 1 ponto (ou 0.5 para cada em empate), e analisando a contagem de pontos total e limites de empates por participante, o menor número inteiro de empates consistente com a pontuação do campeão é 5.'
  },
  {
    type: 'FÍSICA',
    question: 'Um oscilador harmônico unidimensional simples possui energia mecânica total E. Se duplicarmos a amplitude de oscilação (2A) e cortarmos a frequência angular pela metade (w/2), qual será a nova energia total do sistema?',
    options: ['E/2', 'E', '2E', '4E'],
    correct: 'E',
    explanation: 'A energia mecânica total de um oscilador harmônico é E = (1/2) * m * w^2 * A^2. Se w -> w/2 e A -> 2A, então w^2 -> w^2/4 e A^2 -> 4A^2, logo a energia permanece inalterada (E).'
  },
  {
    type: 'TRADE',
    question: 'Um ativo X tem volatilidade diária de 2%. Pela regra da raiz do tempo (passeio aleatório), qual é a volatilidade aproximada esperada acumulada para um período de 25 dias úteis de mercado?',
    options: ['10%', '20%', '50%', '5%'],
    correct: '10%',
    explanation: 'Volatilidade acumulada = Volatilidade diária * raiz(T). Logo, 2% * raiz(25) = 2% * 5 = 10%.'
  },
  {
    type: 'GEOPOLÍTICA',
    question: 'Segundo as clássicas teorias de Mackinder e Spykman, quem controla a Eurásia controla o destino global. Mackinder definiu o Heartland como o centro pivô. Qual região rústica é o principal escudo natural do Heartland no Leste?',
    options: ['A cordilheira do Himalaia', 'As estepes da Sibéria', 'O deserto de Gobi', 'O planalto tibetano'],
    correct: 'As estepes da Sibéria',
    explanation: 'As estepes siberianas atuam como um cinturão de isolamento intransponível por terra no leste, mantendo o controle estratégico intacto.'
  }
];

const EASY_CHALLENGES = [
  {
    type: 'LÓGICA',
    question: 'Se um loop roda a cada 10 segundos, quantos ciclos ele completará em um minuto?',
    options: ['3', '6', '10', '12'],
    correct: '6',
    explanation: '60 / 10 = 6.'
  },
  {
    type: 'FÍSICA',
    question: 'Qual a unidade de medida de frequência no Sistema Internacional?',
    options: ['Hertz (Hz)', 'Joule (J)', 'Watt (W)', 'Newton (N)'],
    correct: 'Hertz (Hz)',
    explanation: 'A frequência é medida em Hertz (Hz).'
  },
  {
    type: 'TRADE',
    question: 'Se você comprar uma ação por $100 e ela valorizar 10%, qual será o novo valor?',
    options: ['$90', '$100', '$110', '$120'],
    correct: '$110',
    explanation: '100 * 1.10 = 110.'
  },
  {
    type: 'GEOPOLÍTICA',
    question: 'Qual o maior continente terrestre em área geográfica?',
    options: ['América', 'Ásia', 'África', 'Europa'],
    correct: 'Ásia',
    explanation: 'A Ásia é o maior continente em área terrestre.'
  }
];

export default function BrainSync({ onComplete }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [feedback, setFeedback] = useState(null);
  const [stressLevel, setStressLevel] = useState(32);
  const [readiness, setReadiness] = useState(88);
  
  // Cognitive radar scores state (0-100)
  const [cognitiveScores, setCognitiveScores] = useState(() => {
    const saved = localStorage.getItem('dust_cognitive_scores');
    return saved ? JSON.parse(saved) : { LOGICA: 60, FISICA: 50, TRADE: 55, GEOPOLITICA: 45 };
  });

  // Flashcards state
  const [flashcards, setFlashcards] = useState(() => {
    const saved = localStorage.getItem('dust_flashcards');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviewMode, setReviewMode] = useState(false);
  
  const activeChallenges = (stressLevel > 70 || readiness < 50) ? EASY_CHALLENGES : HARD_CHALLENGES;
  const challenge = activeChallenges[currentIdx % activeChallenges.length];

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentIdx]);

  const handleAnswer = (opt) => {
    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);
    const isCorrect = opt === challenge.correct;
    
    // Adjust scores
    setCognitiveScores(prev => {
      const fieldMap = {
        'LÓGICA': 'LOGICA',
        'FÍSICA': 'FISICA',
        'TRADE': 'TRADE',
        'GEOPOLÍTICA': 'GEOPOLITICA'
      };
      const scoreKey = fieldMap[challenge.type];
      const currentVal = prev[scoreKey] || 50;
      const newVal = isCorrect ? Math.min(100, currentVal + 8) : Math.max(10, currentVal - 5);
      const updated = { ...prev, [scoreKey]: newVal };
      localStorage.setItem('dust_cognitive_scores', JSON.stringify(updated));
      return updated;
    });

    if (!isCorrect) {
      // Add to flashcard list
      const newFlashcard = {
        id: `fc-${Date.now()}`,
        type: challenge.type,
        question: challenge.question,
        options: challenge.options,
        correct: challenge.correct,
        explanation: challenge.explanation,
        dateAdded: new Date().toLocaleDateString()
      };
      
      setFlashcards(prev => {
        const updated = [newFlashcard, ...prev];
        localStorage.setItem('dust_flashcards', JSON.stringify(updated));
        return updated;
      });

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent('DUST_NOTIFICATION', {
          detail: {
            id: Date.now(),
            title: 'FLASHCARD CRIADO',
            text: `Erro em ${challenge.type} gerou um card para revisão diária.`,
            timestamp: new Date().toLocaleTimeString()
          }
        })
      );
    }

    if (onComplete) {
      onComplete({
        type: challenge.type,
        time: timeTaken,
        correct: isCorrect
      });
    }

    setFeedback({
      correct: isCorrect,
      time: timeTaken,
      text: isCorrect ? 'Sincronização Perfeita.' : 'Falha na Lógica.'
    });

    setTimeout(() => {
      setFeedback(null);
      setCurrentIdx((prev) => (prev + 1) % HARD_CHALLENGES.length);
    }, 3500);
  };

  const handleReviewAnswer = (fcId, isCorrectReview) => {
    if (isCorrectReview) {
      setFlashcards(prev => {
        const updated = prev.filter(fc => fc.id !== fcId);
        localStorage.setItem('dust_flashcards', JSON.stringify(updated));
        return updated;
      });
      window.dispatchEvent(
        new CustomEvent('DUST_NOTIFICATION', {
          detail: {
            id: Date.now(),
            title: 'CARD RESOLVIDO',
            text: 'Parabéns, flashcard removido da pilha diária.',
            timestamp: new Date().toLocaleTimeString()
          }
        })
      );
    } else {
      // Send card to the back of the queue
      setFlashcards(prev => {
        const target = prev.find(fc => fc.id === fcId);
        const rest = prev.filter(fc => fc.id !== fcId);
        return [...rest, target];
      });
    }
  };

  // SVG Cognitive Radar Chart
  const renderRadarChart = () => {
    const cx = 100;
    const cy = 90;
    const r = 60;
    
    const lVal = cognitiveScores.LOGICA;
    const fVal = cognitiveScores.FISICA;
    const tVal = cognitiveScores.TRADE;
    const gVal = cognitiveScores.GEOPOLITICA;

    // Axis angles
    // 0: Logica (Up) -> 90deg (cx, cy - r * val)
    // 1: Fisica (Right) -> 0deg (cx + r * val, cy)
    // 2: Trade (Down) -> 270deg (cx, cy + r * val)
    // 3: Geopolitica (Left) -> 180deg (cx - r * val, cy)
    const y0 = cy - r * (lVal / 100);
    const x1 = cx + r * (fVal / 100);
    const y2 = cy + r * (tVal / 100);
    const x3 = cx - r * (gVal / 100);

    const points = `${cx},${y0} ${x1},${cy} ${cx},${y2} ${x3},${cy}`;

    return (
      <svg className="w-[200px] h-[180px] mx-auto" viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="radar-blue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Grids */}
        {[0.25, 0.5, 0.75, 1.0].map((scale, i) => {
          const ty = cy - r * scale;
          const rx = cx + r * scale;
          const by = cy + r * scale;
          const lx = cx - r * scale;
          return (
            <polygon 
              key={i} 
              points={`${cx},${ty} ${rx},${cy} ${cx},${by} ${lx},${cy}`} 
              fill="none" 
              stroke="#1a1a22" 
              strokeWidth="0.7"
              strokeDasharray={i < 3 ? "2,2" : "none"}
            />
          );
        })}
        {/* Axis */}
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#1a1a22" strokeWidth="0.7" />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#1a1a22" strokeWidth="0.7" />
        
        {/* Labels */}
        <text x={cx} y={cy - r - 5} textAnchor="middle" fill="#06b6d4" fontSize="8" fontFamily="monospace">LÓGICA</text>
        <text x={cx + r + 5} y={cy + 3} textAnchor="start" fill="#10b981" fontSize="8" fontFamily="monospace">FÍSICA</text>
        <text x={cx} y={cy + r + 11} textAnchor="middle" fill="#a855f7" fontSize="8" fontFamily="monospace">TRADE</text>
        <text x={cx - r - 5} y={cy + 3} textAnchor="end" fill="#f59e0b" fontSize="8" fontFamily="monospace">GEOPOL</text>

        {/* Data polygon */}
        <polygon points={points} fill="url(#radar-blue)" stroke="#06b6d4" strokeWidth="1.5" />
      </svg>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in p-2 text-[#e3e3e6] font-mono">
      
      {/* Quiz Area */}
      <div className="md:col-span-2 space-y-6">
        <div className="flex items-center justify-between border-b border-[#1a1a22] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] animate-pulse shadow-[0_0_8px_#06b6d4]"></div>
            <h2 className="text-sm tracking-[0.2em] font-mono text-[#06b6d4] uppercase font-light">
              Brain-Sync 2.0 // Neural Trainer (Hard Mode)
            </h2>
          </div>
          <button
            onClick={() => setReviewMode(!reviewMode)}
            className="px-2 py-1 border border-[#06b6d4]/40 bg-[#06b6d4]/10 text-[#06b6d4] text-[10px] rounded-sm hover:bg-[#06b6d4]/20 transition-all"
          >
            {reviewMode ? '[ VOLTAR AO TREINO ]' : `[ REVISAR FLASHCARDS (${flashcards.length}) ]`}
          </button>
        </div>

        {reviewMode ? (
          <div className="bg-[#0b0b0d] border border-[#1a1a22] p-6 rounded-sm space-y-4">
            <h3 className="text-xs text-[#10b981]">JARVIS Cognitive Flashcards Review</h3>
            {flashcards.length === 0 ? (
              <p className="text-xs text-[#71717a] py-6 text-center">Nenhum flashcard na fila. JARVIS te parabeniza pelo foco e acertos!</p>
            ) : (
              <div className="space-y-4 border border-[#1a1a22] p-4 rounded-sm">
                <span className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-sm">
                  ERRO DE CORREÇÃO EM: {flashcards[0].type}
                </span>
                <p className="text-xs font-sans mt-2 leading-relaxed text-[#e3e3e6]">{flashcards[0].question}</p>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {flashcards[0].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleReviewAnswer(flashcards[0].id, opt === flashcards[0].correct)}
                      className="p-3 bg-[#111115] border border-[#1a1a22] hover:border-[#10b981]/50 text-left text-xs hover:text-white transition-all font-mono"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <details className="mt-4 text-[10px] text-[#71717a] cursor-pointer">
                  <summary>[Ver Explicação do JARVIS]</summary>
                  <p className="mt-2 font-sans text-emerald-400">{flashcards[0].explanation}</p>
                </details>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#0b0b0d] border border-[#1a1a22] p-6 rounded-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#06b6d4]/50 to-transparent"></div>
            
            <div className="mb-4">
              <span className="text-[10px] bg-[#06b6d4]/10 text-[#06b6d4] px-2 py-1 border border-[#06b6d4]/20 rounded-sm font-mono uppercase tracking-wider">
                [ TIPO: {challenge.type} ]
              </span>
            </div>

            <p className="text-xs font-mono text-[#e3e3e6] mb-8 leading-relaxed">
              {challenge.question}
            </p>

            {feedback ? (
              <div className={`p-4 border ${feedback.correct ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-red-500/50 bg-red-500/10 text-red-400'} font-mono text-xs rounded-sm`}>
                <div className="font-bold mb-2">{feedback.text}</div>
                <div>Tempo de processamento: {feedback.time}s</div>
                {!feedback.correct && (
                  <div className="mt-2 text-[#71717a] font-sans">
                    <strong>Correção JARVIS:</strong> {challenge.explanation}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {challenge.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt)}
                    className="p-3 bg-[#111115] border border-[#1a1a22] hover:border-[#06b6d4]/50 hover:bg-[#06b6d4]/5 transition-colors text-left font-mono text-xs text-[#a1a1aa] hover:text-white"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cognitive Radar Widget */}
      <div className="bg-[#0b0b0d] border border-[#1a1a22] p-5 rounded-sm flex flex-col items-center justify-between">
        <div className="text-center w-full">
          <h3 className="text-xs text-[#06b6d4] tracking-wider uppercase mb-4 border-b border-[#1a1a22] pb-2 font-bold">
            Mapa Cognitivo Stark
          </h3>
          {renderRadarChart()}
        </div>
        
        <div className="text-[10px] text-[#71717a] font-sans space-y-2 mt-4 border-t border-[#1a1a22] pt-4 w-full">
          <div className="flex justify-between">
            <span>Lógica OBMEP:</span>
            <span className="text-[#06b6d4] font-mono">{cognitiveScores.LOGICA}%</span>
          </div>
          <div className="flex justify-between">
            <span>Física Ondulatória:</span>
            <span className="text-[#10b981] font-mono">{cognitiveScores.FISICA}%</span>
          </div>
          <div className="flex justify-between">
            <span>Trading & Volatilidade:</span>
            <span className="text-[#a855f7] font-mono">{cognitiveScores.TRADE}%</span>
          </div>
          <div className="flex justify-between">
            <span>Macro Geopolítica:</span>
            <span className="text-[#f59e0b] font-mono">{cognitiveScores.GEOPOLITICA}%</span>
          </div>
        </div>
      </div>

      {/* OURA RING BIO-FEEDBACK TELEMETRY */}
      <div className="md:col-span-3 bg-[#0b0b0d] border border-[#1a1a22] p-5 rounded-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1 w-full space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-xs text-[#00ff66] font-bold uppercase tracking-wider">Oura Ring Telemetry (Biometria)</h4>
            <span className="text-[9px] font-mono border border-[#00ff66]/30 text-[#00ff66] px-2 py-0.5 uppercase bg-[#00ff66]/5">
              TELEMETRY CONNECTED
            </span>
          </div>
          <p className="text-[10px] text-[#71717a] font-sans">
            Ajusta dinamicamente a complexidade do Brain-Sync com base nos dados de prontidão e estresse do anel biométrico.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full md:w-auto">
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] text-[#71717a] uppercase font-bold">Nível de Estresse: {stressLevel}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={stressLevel}
              onChange={(e) => setStressLevel(Number(e.target.value))}
              className="w-40 accent-[#00ff66]"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[9px] text-[#71717a] uppercase font-bold">Prontidão (Readiness): {readiness}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={readiness}
              onChange={(e) => setReadiness(Number(e.target.value))}
              className="w-40 accent-[#00ff66]"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center border border-white/5 bg-black/30 p-3 rounded-sm min-w-[120px] text-center font-mono">
          <span className="text-[9px] text-[#71717a] uppercase">Dificuldade</span>
          <span className={`text-xs font-bold uppercase mt-1 ${stressLevel > 70 || readiness < 50 ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {stressLevel > 70 || readiness < 50 ? 'ADAPTADO (FÁCIL)' : 'STARK (DIFÍCIL)'}
          </span>
        </div>
      </div>

    </div>
  );
}
