/**
 * DUST Agent Behavior Engine
 * Finite State Machine + Task Queue + Event Triggers
 *
 * FSM States per agent:
 *   IDLE       → sitting at home desk, idle animation
 *   WALK_WORK  → walking toward work node
 *   WORKING    → at work node, typing animation (active task)
 *   WALK_HOME  → walking back to home desk
 *
 * Triggers (simulated):
 *   FINANCEIRO → random market variation event every ~20s
 *   OPERAÇÕES  → simulated system error every ~30s
 *   VIBPHYS    → simulated file change in thesis_manifesto.md every ~45s
 */

// ─── FSM States ────────────────────────────────────────────────────────────────
export const AgentFSM = {
  IDLE:      'IDLE',
  WALK_WORK: 'WALK_WORK',
  WORKING:   'WORKING',
  THINKING:  'THINKING',
  WALK_HOME: 'WALK_HOME',
  CRITICAL_PIPELINE_ERROR: 'CRITICAL_PIPELINE_ERROR',
}

// ─── Agent config ─────────────────────────────────────────────────────────────
// Layout reference:
//   PC_FRONT_OFF:    col 3/row 12 (FINANCEIRO),  col 7/row 12 (OPERAÇÕES)
//   CUSHIONED_BENCH: col 3/row 14 (work chair),  col 7/row 14 (work chair)
//   WOODEN_CHAIR:    col 3/row 16 (conf. table),  col 7/row 16 (conf. table)
//   SOFA_FRONT:      col 14/row 13  |  SOFA_SIDE: col 13/row 14  (VIBPHYS area)
export const AGENT_NODES = {
  finance: {
    homeNode: { col: 3,  row: 16, dir: 3 },  // Dir.UP=3 — conference table chair
    workNode: { col: 3,  row: 14, dir: 3 },  // Dir.UP=3 — cushioned bench in front of PC
  },
  ops: {
    homeNode: { col: 7,  row: 16, dir: 3 },
    workNode: { col: 7,  row: 14, dir: 3 },
  },
  vibphys: {
    homeNode: { col: 14, row: 10, dir: 3 },  // Dir.UP=3 — standing looking at painting
    workNode: { col: 13, row: 14, dir: 2 },  // Dir.RIGHT=2  — sitting on left sofa typing on mac
  },
}

// ─── Task Queue ─────────────────────────────────────────────────────────────────
class TaskQueue {
  constructor() {
    this._queue = []
    this._listeners = []
  }

  enqueue(task) {
    this._queue.push(task)
    this._listeners.forEach(fn => fn(task))
  }

  dequeue(agentKey) {
    const idx = this._queue.findIndex(t => t.agentKey === agentKey)
    if (idx === -1) return null
    return this._queue.splice(idx, 1)[0]
  }

  hasPending(agentKey) {
    return this._queue.some(t => t.agentKey === agentKey)
  }

  onEnqueue(fn) {
    this._listeners.push(fn)
    return () => { this._listeners = this._listeners.filter(l => l !== fn) }
  }
}

// ─── Terminal Log ───────────────────────────────────────────────────────────────
const MAX_LOG_LINES = 50

class TerminalLog {
  constructor() {
    this._lines = []
    this._listeners = []
  }

  push(agentKey, message) {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    const entry = { time: `${hh}:${mm}:${ss}`, agentKey, message, id: Date.now() + Math.random() }
    this._lines.unshift(entry)
    if (this._lines.length > MAX_LOG_LINES) this._lines.pop()
    this._listeners.forEach(fn => fn([...this._lines]))
  }

  onUpdate(fn) {
    this._listeners.push(fn)
    return () => { this._listeners = this._listeners.filter(l => l !== fn) }
  }

  getLines() {
    return [...this._lines]
  }
}

// ─── Agent Behavior Engine ──────────────────────────────────────────────────────
export class AgentBehaviorEngine {
  constructor() {
    this.taskQueue = new TaskQueue()
    this.terminalLog = new TerminalLog()

    // FSM state per agent
    this.states = {
      finance:  AgentFSM.IDLE,
      ops:      AgentFSM.IDLE,
      vibphys:  AgentFSM.IDLE,
    }

    this.metrics = {
      marketPrice: 100.0,
      webTraffic: 1000,
      physicalResonance: 1.0,
    }

    // Working duration timers (how long they stay WORKING before going home)
    this._workTimers = {}

    // Listeners for FSM state changes
    this._stateListeners = []
    
    // State Hysteresis: prevent erratic transitions
    this._lastTransition = {}

    // Start simulated triggers
    this._setupTriggers()

    // Log initial state
    setTimeout(() => {
      this.terminalLog.push('system', 'DUST Loop Engine iniciado. Modo Act-Observe-Learn-Repeat ativo.')
    }, 1500)
  }

  // ── Trigger simulations ─────────────────────────────────────────────────────

  _setupTriggers() {
    // Act-Observe-Learn-Repeat continuous loop ticker
    const tick = () => {
      setTimeout(() => {
        // Randomly simulate discrepancies/metrics shifts
        const rand = Math.random();
        
        if (rand < 0.33) {
          // 1. Market Price Crash (Discrepancy)
          this.metrics.marketPrice = 70.0 + Math.random() * 15;
          const val = this.metrics.marketPrice.toFixed(2);
          this.terminalLog.push('system', `[OBSERVE] Preço de mercado caiu para $${val} (Desvio > 15%).`);
          
          if (this.states.finance === AgentFSM.IDLE) {
            this._transition('finance', AgentFSM.THINKING);
            this.terminalLog.push('finance', `[LEARN] J.A.R.V.I.S. detectou anomalia ($${val}). Analisando impacto e portfólio.`);
            setTimeout(() => {
              this.terminalLog.push('finance', `[ACT] Executando rebalanceamento automático de ativos de baixo risco.`);
              this._transition('finance', AgentFSM.WALK_WORK);
              
              // Normalize metrics after action
              setTimeout(() => {
                this.metrics.marketPrice = 100.0;
                this.terminalLog.push('finance', `[REPEAT] Portfólio rebalanceado. Retornando ao loop de observação.`);
                this._finishWork('finance');
              }, 7000);
            }, 2000);
          }
        } else if (rand < 0.66) {
          // 2. Web Traffic Drop (Discrepancy)
          this.metrics.webTraffic = 600 + Math.floor(Math.random() * 100);
          const val = this.metrics.webTraffic;
          this.terminalLog.push('system', `[OBSERVE] Queda repentina de tráfego detectada (${val} reqs/m).`);
          
          if (this.states.ops === AgentFSM.IDLE) {
            this._transition('ops', AgentFSM.THINKING);
            this.terminalLog.push('ops', `[LEARN] F.R.I.D.A.Y. analisando rotas de servidores instáveis devido a queda.`);
            setTimeout(() => {
              this.terminalLog.push('ops', `[ACT] Iniciando crawlers de tráfego e rotinas de failover automáticas.`);
              this._transition('ops', AgentFSM.WALK_WORK);
              
              // Normalize metrics
              setTimeout(() => {
                this.metrics.webTraffic = 1000;
                this.terminalLog.push('ops', `[REPEAT] Servidores restaurados. Retornando ao loop.`);
                this._finishWork('ops');
              }, 7000);
            }, 2000);
          }
        } else {
          // 3. Physical Resonance Drift
          this.metrics.physicalResonance = 0.6 + Math.random() * 0.2;
          const val = this.metrics.physicalResonance.toFixed(2);
          this.terminalLog.push('system', `[OBSERVE] Desvio detectado na ressonância física da tese (${val}).`);
          
          if (this.states.vibphys === AgentFSM.IDLE) {
            this._transition('vibphys', AgentFSM.THINKING);
            this.terminalLog.push('vibphys', `[LEARN] V.E.R.O.N.I.C.A. analisando o drift de ressonância (${val}).`);
            setTimeout(() => {
              this.terminalLog.push('vibphys', `[ACT] Recalculando elasticidade e coeficientes termodinâmicos.`);
              this._transition('vibphys', AgentFSM.WALK_WORK);
              
              // Normalize metrics
              setTimeout(() => {
                this.metrics.physicalResonance = 1.0;
                this.terminalLog.push('vibphys', `[REPEAT] Constantes físicas calibradas. Retornando ao loop.`);
                this._finishWork('vibphys');
              }, 7000);
            }, 2000);
          }
        }
        
        tick();
      }, 12000 + Math.random() * 8000);
    }
    tick();
  }

  flashGlow(agentKey) {
    // We can simulate a quick THINKING state flash or just log it for now
    // In a full implementation, we'd add a visual state. Here we'll quickly toggle.
    const prevState = this.states[agentKey] || AgentFSM.IDLE
    this._transition(agentKey, AgentFSM.THINKING)
    setTimeout(() => {
      if (this.states[agentKey] === AgentFSM.THINKING) {
        this._transition(agentKey, prevState)
      }
    }, 1000)
    this.terminalLog.push(agentKey, `[DRAG_AND_DROP] Tarefa recebida. Processando contexto...`)
  }

  // --- External Control ---─────────────────────────────────────────────────────────

  // ── Trigger an agent ─────────────────────────────────────────────────────────

  _triggerAgent(agentKey, logMessage) {
    this.taskQueue.enqueue({ agentKey, message: logMessage, timestamp: Date.now() })
    this.terminalLog.push(agentKey, logMessage)
    this._transition(agentKey, AgentFSM.WALK_WORK)
  }

  // ── FSM Transition ────────────────────────────────────────────────────────────

  _transition(agentKey, newState) {
    if (this.states[agentKey] === newState) return

    // State Hysteresis (debounce erratic changes)
    const now = Date.now()
    if (this._lastTransition[agentKey] && now - this._lastTransition[agentKey] < 800) {
      console.warn(`[Hysteresis] Bloqueando mudança errática para ${newState} do agente ${agentKey}`)
      return
    }
    this._lastTransition[agentKey] = now

    const prev = this.states[agentKey]
    this.states[agentKey] = newState
    this._stateListeners.forEach(fn => fn(agentKey, newState, prev))
  }

  // Called by OfficeManager when character arrives at workNode
  onArrivedAtWork(agentKey) {
    if (this.states[agentKey] !== AgentFSM.WALK_WORK) return
    this.taskQueue.dequeue(agentKey)
    
    if (agentKey === 'vibphys' && this.isLabMode) {
      this._transition(agentKey, AgentFSM.THINKING)
    } else {
      this._transition(agentKey, AgentFSM.WORKING)
    }

    // Work for 8-20s then go home
    const workDuration = 8000 + Math.random() * 12000
    this._workTimers[agentKey] = setTimeout(() => {
      this._finishWork(agentKey)
    }, workDuration)
  }

  // Called by OfficeManager when character arrives at homeNode
  onArrivedAtHome(agentKey) {
    if (this.states[agentKey] !== AgentFSM.WALK_HOME) return
    this._transition(agentKey, AgentFSM.IDLE)
    this.terminalLog.push(agentKey, 'Tarefa concluída. Retornando ao estado IDLE.')
  }

  _finishWork(agentKey) {
    if (this.states[agentKey] !== AgentFSM.WORKING && this.states[agentKey] !== AgentFSM.THINKING) return
    if (agentKey === 'vibphys' && this.isLabMode) return // Stay working/thinking while Lab is open

    this._transition(agentKey, AgentFSM.WALK_HOME)

    // If there's another task queued, re-trigger after returning home
    if (this.taskQueue.hasPending(agentKey)) {
      const unsub = this.onStateChange((key, state) => {
        if (key === agentKey && state === AgentFSM.IDLE) {
          unsub()
          setTimeout(() => {
            const task = this.taskQueue.dequeue(agentKey)
            if (task) {
              this.terminalLog.push(agentKey, `Nova tarefa: ${task.message}`)
              this._transition(agentKey, AgentFSM.WALK_WORK)
            }
          }, 1000)
        }
      })
    }
  }

  // ── Public API ───────────────────────────────────────────────────────────────

  setLabMode(isActive) {
    this.isLabMode = isActive
    if (isActive) {
      this.terminalLog.push('vibphys', 'Sessão de simulação iniciada. Ativando Lab Mode [THINKING].')
      clearTimeout(this._workTimers['vibphys'])
      if (this.states.vibphys === AgentFSM.IDLE || this.states.vibphys === AgentFSM.WALK_HOME) {
        this._transition('vibphys', AgentFSM.WALK_WORK)
      } else if (this.states.vibphys === AgentFSM.WORKING) {
        this._transition('vibphys', AgentFSM.THINKING)
      }
    } else {
      this.terminalLog.push('vibphys', 'Sessão de simulação encerrada.')
      this._finishWork('vibphys')
    }
  }

  simulatePipelineFailure(pipelineName) {
    this.terminalLog.push('ops', `[CRITICAL_PIPELINE_ERROR] Falha de encadeamento detectada na rotina: ${pipelineName}`)
    clearTimeout(this._workTimers['ops'])
    this._transition('ops', AgentFSM.CRITICAL_PIPELINE_ERROR)

    // Automatically recover after 15 seconds
    setTimeout(() => {
      this.terminalLog.push('ops', `Rotina ${pipelineName} restaurada ou fallback acionado. Operação normalizada.`)
      this._transition('ops', AgentFSM.IDLE)
    }, 15000)
  }

  onStateChange(fn) {
    this._stateListeners.push(fn)
    return () => { this._stateListeners = this._stateListeners.filter(l => l !== fn) }
  }

  getState(agentKey) {
    return this.states[agentKey]
  }

  destroy() {
    Object.values(this._workTimers).forEach(t => clearTimeout(t))
  }
}

// ─── Singleton instance ────────────────────────────────────────────────────────
let _instance = null
export function getAgentBehaviorEngine() {
  if (!_instance) _instance = new AgentBehaviorEngine()
  return _instance
}
