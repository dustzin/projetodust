import React, { useEffect, useRef, useCallback, useState } from 'react'
import layoutData from './default-layout-1.json'
import {
  TILE_SIZE, FRAME_W, FRAME_H,
  Dir, State,
  createCharacter, updateCharacter, findPath,
  loadImage, buildCharacterFrames, getCharacterFrame,
  loadFloorTiles, loadFurnitureSprites,
} from './officeEngine.js'
import {
  AgentFSM, AGENT_NODES, getAgentBehaviorEngine,
} from './agentBehavior.js'

// ─── Tile map builder ─────────────────────────────────────────────────────────
function buildTileMap(tiles, cols, rows) {
  const map = []
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < cols; c++) row.push(tiles[r * cols + c])
    map.push(row)
  }
  return map
}

// ─── Find the actual content bounds (skip VOID rows) ─────────────────────────
function getContentBounds(tileMap, cols, rows) {
  let minR = rows, maxR = 0, minC = cols, maxC = 0
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (tileMap[r][c] !== 255) {
        if (r < minR) minR = r; if (r > maxR) maxR = r
        if (c < minC) minC = c; if (c > maxC) maxC = c
      }
  return { minR, maxR, minC, maxC }
}

// ─── Agent definitions ────────────────────────────────────────────────────────
const AGENTS = [
  { id: 0, key: 'finance',  label: 'J.A.R.V.I.S.', sheet: 'assets/characters/char_0.png', glowColor: '#06b6d435', color: '#06b6d4', pivot: { x: 0, y: 0 } },
  { id: 1, key: 'ops',      label: 'F.R.I.D.A.Y.',  sheet: 'assets/characters/char_1.png', glowColor: '#a855f735', color: '#a855f7', pivot: { x: 0, y: 0 } },
  { id: 2, key: 'vibphys',  label: 'V.E.R.O.N.I.C.A.',    sheet: 'assets/characters/char_2.png', glowColor: '#10b98135', color: '#10b981', pivot: { x: 4, y: 0 } },
]

// ─── HSL helpers ──────────────────────────────────────────────────────────────
function hslToRgb(h, s, l) {
  s /= 100; l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [Math.round(f(0)*255), Math.round(f(8)*255), Math.round(f(4)*255)]
}

// ─── Terminal Log Entry ───────────────────────────────────────────────────────
const AGENT_COLORS = { finance: '#06b6d4', ops: '#a855f7', vibphys: '#10b981', system: '#6b7280' }
const AGENT_NAMES  = { finance: 'J.A.R.V.I.S.', ops: 'F.R.I.D.A.Y.', vibphys: 'V.E.R.O.N.I.C.A.', system: 'SISTEMA' }

function TerminalPanel({ domRef }) {
  return (
    <div className="w-full rounded-xl border border-[#1e2235] bg-[#0b0d14] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e2235] bg-[#0d0f1a]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]"/>
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"/>
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]"/>
        </div>
        <span className="text-[10px] font-mono text-gray-500 ml-2">DUST — terminal de eventos</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
          <span className="text-[10px] font-mono text-emerald-500">LIVE</span>
        </div>
      </div>
      <div ref={domRef} className="h-[84px] overflow-y-auto px-4 py-2 flex flex-col gap-0.5 scrollbar-thin" />
    </div>
  )
}

function appendLogLine(container, agentKey, message) {
  if (!container) return
  const now = new Date()
  const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
  const color = AGENT_COLORS[agentKey] ?? '#6b7280'
  const name  = AGENT_NAMES[agentKey]  ?? agentKey

  const line = document.createElement('div')
  line.className = 'flex gap-2 items-baseline font-mono text-[10px] leading-relaxed shrink-0 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'
  line.innerHTML = `<span class="text-[#00ffcc]/60 shrink-0">[${t}]</span><span class="shrink-0 font-bold" style="color:${color}; text-shadow: 0 0 5px ${color}80">${name}:</span><span class="text-[#e3e3e6]">${message}</span>`
  container.appendChild(line)
  while (container.children.length > 40) container.removeChild(container.firstChild)
  container.scrollTop = container.scrollHeight
}

// ─── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ agent, fsmState }) {
  const isWorking = fsmState === AgentFSM.WORKING
  const isMoving  = fsmState === AgentFSM.WALK_WORK || fsmState === AgentFSM.WALK_HOME
  const label     = fsmState === AgentFSM.WORKING ? 'WORKING' : fsmState === AgentFSM.IDLE ? 'IDLE' : 'MOVING'
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-300"
      style={{
        borderColor: isWorking ? agent.color + '55' : '#1e2235',
        backgroundColor: isWorking ? agent.color + '11' : '#0d0f1a',
        boxShadow: isWorking ? `0 0 12px ${agent.glowColor}` : 'none',
      }}
    >
      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
        isWorking ? 'animate-pulse' : isMoving ? 'animate-ping' : ''
      }`} style={{ backgroundColor: isWorking ? agent.color : isMoving ? '#fbbf24' : '#374151' }}/>
      <span className="font-bold" style={{ color: agent.color }}>{agent.label}</span>
      <span className="text-gray-500">{label}</span>
    </div>
  )
}

// ─── OfficeManager ────────────────────────────────────────────────────────────
export default function OfficeManager({ activeAgent, agentStates, isMini = false, insertedChips = ['jarvis', 'friday', 'veronica'], isLiteMode = false }) {
  const canvasRef    = useRef(null)
  const terminalRef  = useRef(null)  // Direct DOM ref — no React re-renders
  const stateRef     = useRef({
    loaded: false,
    floorTiles: null, furnitureImgs: null, charFrames: [], characters: [],
    tileMap: null, blockedSet: null, bounds: null, lastTime: null, animId: null,
    fsmStates: { finance: AgentFSM.IDLE, ops: AgentFSM.IDLE, vibphys: AgentFSM.IDLE },
    glowTimers: { finance: 0, ops: 0, vibphys: 0 },
  })
  const [fsmStates, setFsmStates] = useState({ finance: AgentFSM.IDLE, ops: AgentFSM.IDLE, vibphys: AgentFSM.IDLE })
  const behaviorRef = useRef(null)

  // ── Load assets & init behavior engine ──────────────────────────────────────
  useEffect(() => {
    const eng = stateRef.current
    const { cols, rows, tiles, furniture } = layoutData

    eng.tileMap = buildTileMap(tiles, cols, rows)
    eng.bounds  = getContentBounds(eng.tileMap, cols, rows)

    const blockedSet = new Set()
    for (const f of furniture) blockedSet.add(`${f.col},${f.row}`)
    eng.blockedSet = blockedSet

    const furnitureUnique = [...new Set(furniture.map(f => f.type))].map(type => ({ type }))

    // Init behavior engine
    const behavior = getAgentBehaviorEngine()
    behaviorRef.current = behavior

    // Terminal: use direct DOM writes (no React state)
    const unsubLog = behavior.terminalLog.onUpdate((lines) => {
      // lines[0] is newest — just append the latest one to DOM
      const newest = lines[0]
      if (newest) appendLogLine(terminalRef.current, newest.agentKey, newest.message)
    })

    // FSM state changes
    const unsubFSM = behavior.onStateChange((agentKey, newState) => {
      const eng = stateRef.current
      eng.fsmStates[agentKey] = newState
      setFsmStates({ ...eng.fsmStates })

      if (newState === AgentFSM.WORKING) {
        eng.glowTimers[agentKey] = 1.0
      }

      const ch = eng.characters.find(c => AGENTS[c.id].key === agentKey)
      if (!ch) return

      const nodes = AGENT_NODES[agentKey]
      let target = null

      if (newState === AgentFSM.WALK_WORK) {
        target = nodes.workNode
      } else if (newState === AgentFSM.WALK_HOME) {
        target = nodes.homeNode
      }

      if (target) {
        const path = findPath(eng.tileMap, eng.blockedSet, ch.tileCol, ch.tileRow, target.col, target.row)
        if (path.length > 0) {
          ch.path = path
          ch.moveProgress = 0
          ch.state = State.WALK
          ch.frame = 0; ch.frameTimer = 0
          ch.seatCol = target.col
          ch.seatRow = target.row
          ch.facingDir = target.dir
        } else {
          ch.state = (agentKey === 'vibphys') ? State.READ : State.TYPE
          ch.dir = target.dir
          if (newState === AgentFSM.WALK_WORK)  behavior.onArrivedAtWork(agentKey)
          if (newState === AgentFSM.WALK_HOME)  behavior.onArrivedAtHome(agentKey)
        }
      } else if (newState === AgentFSM.WORKING || newState === AgentFSM.IDLE) {
        ch.state = (agentKey === 'vibphys' && newState === AgentFSM.WORKING) ? State.READ : State.TYPE
      }
    })

    // Load graphics
    Promise.all([
      loadFloorTiles('assets/office_assets'),
      loadFurnitureSprites(furnitureUnique, 'assets/office_assets/furniture_flat'),
      ...AGENTS.map(a => loadImage(a.sheet)),
    ]).then(([floorTiles, furnitureImgs, ...sheets]) => {
      eng.floorTiles = floorTiles
      eng.furnitureImgs = furnitureImgs
      eng.charFrames = sheets.map((sheet, i) => {
        if (!sheet) { console.warn(`[DUST] sheet ${i} failed`); return null }
        return buildCharacterFrames(sheet)
      })
      // Init characters at homeNodes
      eng.characters = AGENTS.map((def, i) => {
        const nodes = AGENT_NODES[def.key]
        const home = nodes.homeNode
        return createCharacter(def.id, home.col, home.row, home.dir)
      })
      eng.loaded = true
    })

    return () => {
      unsubLog(); unsubFSM()
      if (eng.animId) {
        cancelAnimationFrame(eng.animId)
        clearTimeout(eng.animId)
      }
    }
  }, [])

  // ── Game Loop ─────────────────────────────────────────────────────────────
  const loop = useCallback((now) => {
    const eng    = stateRef.current
    const canvas = canvasRef.current
    const behavior = behaviorRef.current

    if (isMini) {
      // Background Simulation Mode: Skip canvas drawing entirely
      // Update character coordinates in low frequency (3000ms in Lite Mode, 1000ms standard)
      const dt = eng.lastTime ? Math.min((now - eng.lastTime) / 1000, 0.1) : 0
      eng.lastTime = now

      if (eng.loaded) {
        const CHIP_MAP = { finance: 'jarvis', ops: 'friday', vibphys: 'veronica' };
        for (const ch of eng.characters) {
          const agentKey = AGENTS[ch.id]?.key
          if (insertedChips && agentKey && CHIP_MAP[agentKey] && !insertedChips.includes(CHIP_MAP[agentKey])) continue;
          updateCharacter(ch, dt, eng.tileMap, eng.blockedSet)
        }
      }
      const delay = isLiteMode ? 3000 : 1000;
      eng.animId = setTimeout(() => loop(performance.now()), delay)
      return
    }

    if (!canvas) { 
      const delay = isLiteMode ? 1000 / 15 : 0;
      if (delay > 0) {
        eng.animId = setTimeout(() => loop(performance.now()), delay);
      } else {
        eng.animId = requestAnimationFrame(loop);
      }
      return 
    }

    const dt = eng.lastTime ? Math.min((now - eng.lastTime) / 1000, 0.1) : 0
    eng.lastTime = now

    if (eng.loaded) {
      const CHIP_MAP = { finance: 'jarvis', ops: 'friday', vibphys: 'veronica' };
      for (const ch of eng.characters) {
        const agentKey = AGENTS[ch.id]?.key
        if (insertedChips && agentKey && CHIP_MAP[agentKey] && !insertedChips.includes(CHIP_MAP[agentKey])) continue;
        const prevTile = { col: ch.tileCol, row: ch.tileRow }
        updateCharacter(ch, dt, eng.tileMap, eng.blockedSet)

        // Detect arrival at destination
        if (!agentKey || !behavior) continue
        const fsmState = eng.fsmStates[agentKey]
        const nodes = AGENT_NODES[agentKey]

        if (fsmState === AgentFSM.WALK_WORK && ch.state !== State.WALK &&
            ch.tileCol === nodes.workNode.col && ch.tileRow === nodes.workNode.row) {
          behavior.onArrivedAtWork(agentKey)
        } else if (fsmState === AgentFSM.WALK_HOME && ch.state !== State.WALK &&
            ch.tileCol === nodes.homeNode.col && ch.tileRow === nodes.homeNode.row) {
          behavior.onArrivedAtHome(agentKey)
        }
      }

      // Fade glow timers
      for (const k in eng.glowTimers) {
        if (eng.fsmStates[k] === AgentFSM.WORKING) {
          eng.glowTimers[k] = 1.0 // keep alive while working
        } else if (eng.glowTimers[k] > 0) {
          eng.glowTimers[k] = Math.max(0, eng.glowTimers[k] - dt * 0.5)
        }
      }
    }

    // ── Render ────────────────────────────────────────────────────────────
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    const CW = canvas.width, CH = canvas.height

    ctx.fillStyle = '#0f1015'
    ctx.fillRect(0, 0, CW, CH)

    if (!eng.loaded) {
      ctx.fillStyle = '#4b5563'; ctx.font = '14px monospace'; ctx.textAlign = 'center'
      ctx.fillText('Carregando escritório...', CW / 2, CH / 2)
      eng.animId = requestAnimationFrame(loop); return
    }

    const { cols, rows, tiles, furniture, tileColors } = layoutData
    const ZOOM = 2.0

    const { minR, maxR, minC, maxC } = eng.bounds
    const contentCols = maxC - minC + 1
    const contentRows = maxR - minR + 1
    const mapW = contentCols * TILE_SIZE * ZOOM
    const mapH = contentRows * TILE_SIZE * ZOOM
    const offsetX = Math.floor((CW - mapW) / 2) - minC * TILE_SIZE * ZOOM
    const offsetY = Math.floor((CH - mapH) / 2) - minR * TILE_SIZE * ZOOM

    // ── Floor & Walls ─────────────────────────────────────────────────────
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const type = eng.tileMap[r][c]
        if (type === 255) continue

        const px = Math.floor(offsetX + c * TILE_SIZE * ZOOM)
        const py = Math.floor(offsetY + r * TILE_SIZE * ZOOM)
        const sz = Math.ceil(TILE_SIZE * ZOOM)
        const cd = tileColors[r * cols + c]

        if (type === 0) {
          if (cd && cd.h !== undefined) {
            const [rr,gg,bb] = hslToRgb(((cd.h%360)+360)%360, Math.max(0,Math.min(100,15+cd.s*0.3)), Math.max(0,Math.min(100,10+(cd.b+100)*0.15)))
            ctx.fillStyle = `rgb(${rr},${gg},${bb})`
          } else { ctx.fillStyle = '#1a1c26' }
          ctx.fillRect(px, py, sz, sz)
        } else {
          const img = eng.floorTiles[type]
          if (img) {
            ctx.drawImage(img, px, py, sz, sz)
            if (cd && cd.h !== undefined) {
              const [rr,gg,bb] = hslToRgb(((cd.h%360)+360)%360, Math.max(0,Math.min(100,50+cd.s*0.5)), Math.max(0,Math.min(100,50+(cd.b+100)*0.25)))
              ctx.save(); ctx.globalAlpha=0.4; ctx.globalCompositeOperation='multiply'
              ctx.fillStyle=`rgb(${rr},${gg},${bb})`; ctx.fillRect(px,py,sz,sz); ctx.restore()
            }
          } else {
            ctx.fillStyle = '#2a2032'; ctx.fillRect(px,py,sz,sz)
          }
        }
      }
    }

    // ── Desk Glow effects (skipped in Lite Mode to save GPU) ──────────────
    if (!isLiteMode) {
      for (let i = 0; i < AGENTS.length; i++) {
        const agentKey = AGENTS[i].key
        const glowAlpha = eng.glowTimers[agentKey]
        if (glowAlpha <= 0) continue

        const node = AGENT_NODES[agentKey].workNode
        const px = Math.floor(offsetX + node.col * TILE_SIZE * ZOOM)
        const py = Math.floor(offsetY + node.row * TILE_SIZE * ZOOM)
        const sz = TILE_SIZE * ZOOM * 2

        // Pulsing glow circle at work node
        const pulse = 0.6 + 0.4 * Math.sin(now * 0.003)
        const gradG = ctx.createRadialGradient(px + sz/2, py + sz/2, 0, px + sz/2, py + sz/2, sz)
        gradG.addColorStop(0, AGENTS[i].glowColor.replace('0.35', String(0.5 * glowAlpha * pulse)))
        gradG.addColorStop(1, 'transparent')
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        ctx.fillStyle = gradG
        ctx.fillRect(px - sz/2, py - sz/2, sz * 2, sz * 2)
        ctx.restore()
      }
    }

    // ── Z-sorted drawables (furniture + characters) ────────────────────────
    const drawables = []

    for (const f of furniture) {
      const baseType = f.type.split(':')[0]
      const isLeft = f.type.includes(':left')
      const img = eng.furnitureImgs[baseType]
      if (!img) continue

      const px = Math.floor(offsetX + f.col * TILE_SIZE * ZOOM)
      const py = Math.floor(offsetY + f.row * TILE_SIZE * ZOOM)
      const sw = Math.ceil(img.naturalWidth * ZOOM)
      const sh = Math.ceil(img.naturalHeight * ZOOM)

      let zY = f.row * TILE_SIZE + img.naturalHeight
      const onDeskTypes = ['PC_FRONT_OFF', 'PC_FRONT_ON_1', 'PC_FRONT_ON_2', 'PC_FRONT_ON_3', 'PC_SIDE', 'COFFEE', 'CACTUS']
      if (onDeskTypes.includes(baseType)) {
        zY += 32 // Boost surface items so they draw over the desk
      }

      const deskAgent = AGENTS.find(a => AGENT_NODES[a.key]?.workNode.col === f.col && AGENT_NODES[a.key]?.workNode.row === f.row)

      drawables.push({
        zY,
        draw: (ctx) => {
          if (isLeft) {
            ctx.save(); ctx.translate(px + sw, py); ctx.scale(-1,1)
            ctx.drawImage(img, 0, 0, sw, sh); ctx.restore()
          } else {
            ctx.drawImage(img, px, py, sw, sh)
          }
        }
      })
    }

    const CHIP_MAP = { finance: 'jarvis', ops: 'friday', vibphys: 'veronica' };
    for (let i = 0; i < eng.characters.length; i++) {
      const agentDef = AGENTS[i]
      if (insertedChips && agentDef && CHIP_MAP[agentDef.key] && !insertedChips.includes(CHIP_MAP[agentDef.key])) continue;
      const ch      = eng.characters[i]
      const frames  = eng.charFrames[i]
      const frame   = getCharacterFrame(ch, frames)
      const fsmState = eng.fsmStates[agentDef.key]
      const isWorking = fsmState === AgentFSM.WORKING

      const sittingOff = (ch.state === State.TYPE || ch.state === State.READ) ? 2 : 0
      // When idle but not at desk, don't apply sitting offset if looking up/down standing
      const isStanding = (ch.state === State.TYPE && fsmState === AgentFSM.IDLE && (ch.dir === Dir.UP || ch.dir === Dir.DOWN))
      const finalSittingOff = isStanding ? 0 : sittingOff
      
      const pxOff = agentDef.pivot?.x || 0
      const pyOff = agentDef.pivot?.y || 0

      const sprW = FRAME_W * ZOOM
      const sprH = FRAME_H * ZOOM
      const drawX = Math.round(offsetX + (ch.x + pxOff) * ZOOM - sprW / 2)
      const drawY = Math.round(offsetY + (ch.y + finalSittingOff + pyOff) * ZOOM - sprH / 2)

      let charZY = ch.y + TILE_SIZE / 2 + 2
      // Boost Z-index if sitting sideways (sofas) so they don't get swallowed by the sofa's tall sprite
      if (ch.state === State.TYPE && (ch.dir === Dir.RIGHT || ch.dir === Dir.LEFT)) {
        charZY += 48
      }

      drawables.push({
        zY: charZY,
        draw: (ctx) => {
          // Character glow halo when working/thinking (skipped in Lite Mode to save GPU)
          if (!isLiteMode && (isWorking || fsmState === AgentFSM.THINKING)) {
            const pulse = 0.7 + 0.3 * Math.sin(now * 0.005)
            const gradH = ctx.createRadialGradient(drawX + sprW/2, drawY + sprH*0.6, 0, drawX + sprW/2, drawY + sprH*0.6, sprW)
            gradH.addColorStop(0, agentDef.glowColor.replace('0.35', String(0.6 * pulse)))
            gradH.addColorStop(1, 'transparent')
            ctx.save(); ctx.globalCompositeOperation = 'screen'
            ctx.fillStyle = gradH; ctx.fillRect(drawX - sprW, drawY - sprH/2, sprW*3, sprH*2)
            ctx.restore()
          }

          // Sprite or colored fallback
          if (frame) {
            ctx.drawImage(frame, drawX, drawY, sprW, sprH)
          } else {
            ctx.fillStyle = agentDef.color
            ctx.fillRect(drawX + sprW*0.2, drawY + sprH*0.1, sprW*0.6, sprH*0.8)
          }

          // Label pill
          const labelX  = drawX + sprW / 2
          const labelY  = drawY - 4
          const label   = agentDef.label
          const fontSize = 9
          ctx.font = `bold ${fontSize}px monospace`
          ctx.textAlign = 'center'
          const tw = ctx.measureText(label).width
          const pad = 4

          ctx.fillStyle = 'rgba(8,8,14,0.88)'
          ctx.beginPath()
          ctx.roundRect(labelX - tw/2 - pad, labelY - fontSize - 2, tw + pad*2, fontSize + 6, 3)
          ctx.fill()
          ctx.fillStyle = (isWorking || fsmState === AgentFSM.THINKING) ? '#4ade80' : agentDef.color
          ctx.fillText(label, labelX, labelY)

          // THINKING Spectral Analysis Icon
          if (fsmState === AgentFSM.THINKING) {
            ctx.fillStyle = '#00ffcc'
            ctx.font = '12px monospace'
            ctx.fillText('≈', labelX, labelY - 14)
          }

          // CRITICAL_PIPELINE_ERROR Red Alarm Light
          if (fsmState === AgentFSM.CRITICAL_PIPELINE_ERROR) {
            const errorPulse = 0.5 + 0.5 * Math.sin(now * 0.015) // Faster blink
            ctx.fillStyle = `rgba(239, 68, 68, ${errorPulse})` // Red-500
            ctx.font = '16px monospace'
            ctx.fillText('⚠', labelX, labelY - 14)

            // Intense red glow (skipped in Lite Mode to save GPU)
            if (!isLiteMode) {
              const gradError = ctx.createRadialGradient(drawX + sprW/2, drawY + sprH/2, 0, drawX + sprW/2, drawY + sprH/2, sprW * 1.5)
              gradError.addColorStop(0, `rgba(239, 68, 68, ${0.4 * errorPulse})`)
              gradError.addColorStop(1, 'transparent')
              ctx.save(); ctx.globalCompositeOperation = 'screen'
              ctx.fillStyle = gradError; ctx.fillRect(drawX - sprW, drawY - sprH, sprW*3, sprH*3)
              ctx.restore()
            }
          }
        }
      })
    }

    drawables.sort((a, b) => a.zY - b.zY)
    for (const d of drawables) d.draw(ctx)

    // Vignette (skipped in Lite Mode to save GPU)
    if (!isLiteMode) {
      const grad = ctx.createRadialGradient(CW/2, CH/2, CW*0.2, CW/2, CH/2, CW*0.75)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(1, 'rgba(0,0,0,0.55)')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, CW, CH)
    }

    const delay = isLiteMode ? 1000 / 15 : 0;
    if (delay > 0) {
      eng.animId = setTimeout(() => loop(performance.now()), delay);
    } else {
      eng.animId = requestAnimationFrame(loop);
    }
  }, [isMini, insertedChips, isLiteMode])

  useEffect(() => {
    const eng = stateRef.current
    if (eng.animId) {
      cancelAnimationFrame(eng.animId)
      clearTimeout(eng.animId)
    }
    if (isMini) {
      const delay = isLiteMode ? 3000 : 1000;
      eng.animId = setTimeout(() => loop(performance.now()), delay)
    } else {
      const delay = isLiteMode ? 1000 / 15 : 0;
      if (delay > 0) {
        eng.animId = setTimeout(() => loop(performance.now()), delay);
      } else {
        eng.animId = requestAnimationFrame(loop);
      }
    }
    return () => {
      if (eng.animId) {
        cancelAnimationFrame(eng.animId)
        clearTimeout(eng.animId)
      }
    }
  }, [loop, isMini, isLiteMode])

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }

  const handleDrop = (e) => {
    e.preventDefault()
    
    const droppedData = e.dataTransfer.getData('text/plain') || 'Item desconhecido'

    // Find closest agent based on drop coordinates
    const rect = canvasRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    const chars = stateRef.current.characters
    let closestAgent = 'finance'
    let minDist = Infinity
    
    if (chars && chars.length > 0) {
      // Very rough approximation: left side is ops, right side is vibphys, etc.
      // But we can just use the X coordinate for now
      if (mouseX < rect.width * 0.3) closestAgent = 'finance'
      else if (mouseX < rect.width * 0.6) closestAgent = 'ops'
      else closestAgent = 'vibphys'
    }

    import('./webAudio.js').then(m => m.playSciFiSound('drop_agent'))
    import('./agentBehavior').then(m => {
      const eng = m.getAgentBehaviorEngine()
      if (eng) {
        eng.flashGlow(closestAgent)
        
        // Emulate task processing completion after 2 seconds
        setTimeout(() => {
          import('./webAudio.js').then(m => m.playSciFiSound('success'))
          window.dispatchEvent(new CustomEvent('DUST_NOTIFICATION', {
            detail: {
              id: Date.now(),
              agent: closestAgent.toUpperCase(),
              message: `Briefing para [${droppedData}] concluído.`,
              read: false
            }
          }))
        }, 2000)
      }
    })
  }

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center bg-[#0a0a0c]"
    >
      <div className="flex flex-col items-center gap-3 w-full px-6 max-w-[900px]">

        {/* Office Canvas */}
        {!isMini && (
          <canvas
            ref={canvasRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            width={820}
            height={540}
            className="rounded-xl border border-[#1e2235] shadow-[0_0_40px_rgba(0,0,0,0.8)] w-full"
            style={{ imageRendering: 'pixelated' }}
          />
        )}

        {/* Status pills */}
        {!isMini && (
          <div className="flex gap-3 w-full justify-center">
            {AGENTS.filter(a => {
              const CHIP_MAP = { finance: 'jarvis', ops: 'friday', vibphys: 'veronica' };
              return !insertedChips || insertedChips.includes(CHIP_MAP[a.key]);
            }).map(a => (
              <StatusPill key={a.key} agent={a} fsmState={fsmStates[a.key]} />
            ))}
          </div>
        )}

        {/* Terminal Log — DOM-managed, zero React re-renders */}
        {!isMini && <TerminalPanel domRef={terminalRef} />}

      </div>
    </div>
  )
}
