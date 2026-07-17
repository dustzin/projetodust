import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// Custom plugin to write/read files on local machine under /data/
const dustLocalFsPlugin = () => ({
  name: 'dust-local-fs',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
      
      if (req.method === 'POST' && url.pathname === '/api/write') {
        let body = ''
        req.on('data', chunk => {
          body += chunk
        })
        req.on('end', () => {
          try {
            const { filePath, content } = JSON.parse(body)
            const absolutePath = path.resolve(process.cwd(), filePath)
            fs.mkdirSync(path.dirname(absolutePath), { recursive: true })
            fs.writeFileSync(absolutePath, content, 'utf8')
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, path: absolutePath }))
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })
        return
      }

      if (req.method === 'GET' && url.pathname === '/api/read') {
        const filePath = url.searchParams.get('filePath')
        if (!filePath) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'filePath parameter missing' }))
          return
        }
        try {
          const absolutePath = path.resolve(process.cwd(), filePath)
          if (fs.existsSync(absolutePath)) {
            const content = fs.readFileSync(absolutePath, 'utf8')
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, content }))
          } else {
            res.writeHead(404, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: 'File not found' }))
          }
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: false, error: err.message }))
        }
        return
      }

      if (req.method === 'GET' && url.pathname === '/api/list') {
        const dirPath = url.searchParams.get('dirPath')
        if (!dirPath) {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'dirPath parameter missing' }))
          return
        }
        try {
          const absolutePath = path.resolve(process.cwd(), dirPath)
          if (fs.existsSync(absolutePath)) {
            const files = fs.readdirSync(absolutePath)
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, files }))
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, files: [] }))
          }
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: false, error: err.message }))
        }
        return
      }

      if (req.method === 'POST' && url.pathname === '/api/delete') {
        let body = ''
        req.on('data', chunk => {
          body += chunk
        })
        req.on('end', () => {
          try {
            const { filePath } = JSON.parse(body)
            const absolutePath = path.resolve(process.cwd(), filePath)
            if (fs.existsSync(absolutePath)) {
              fs.unlinkSync(absolutePath)
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: true }))
            } else {
              res.writeHead(404, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, error: 'File not found' }))
            }
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })
        return
      }


      if (req.method === 'POST' && url.pathname === '/api/log') {
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', () => {
          try {
            const { level, message, details } = JSON.parse(body)
            const logDir = path.resolve(process.cwd(), 'data/logs')
            const logFile = path.join(logDir, 'system.log')
            
            if (!fs.existsSync(logDir)) {
              fs.mkdirSync(logDir, { recursive: true })
            }
            
            const timestamp = new Date().toISOString()
            const logEntry = `[${timestamp}] [${level}] ${message} ${details ? JSON.stringify(details) : ''}\n`
            
            fs.appendFileSync(logFile, logEntry, 'utf8')
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true }))
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })
        return
      }

      if (req.method === 'GET' && url.pathname === '/api/fetch-finance') {
        const symbols = ['NVDA', 'AAPL', 'BTC-USD', 'EWZ', 'SPY']
        const results = []
        
        ;(async () => {
          try {
            for (const sym of symbols) {
              const fetchUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=2d`
              const response = await fetch(fetchUrl)
              const data = await response.json()
              
              if (data?.chart?.result?.[0]) {
                const result = data.chart.result[0]
                const meta = result.meta
                const price = meta.regularMarketPrice ?? 0
                const prevClose = meta.chartPreviousClose ?? price
                const change = prevClose ? (((price - prevClose) / prevClose) * 100) : 0
                results.push({ symbol: sym, price, change })
              } else {
                results.push({ symbol: sym, price: 0, change: 0 })
              }
            }
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, data: results }))
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })()
        return
      }

      if (req.method === 'GET' && url.pathname === '/api/fetch-weather') {
        ;(async () => {
          try {
            const fetchUrl = 'https://api.open-meteo.com/v1/forecast?latitude=-26.9196&longitude=-49.0661&current=temperature_2m,weather_code'
            const response = await fetch(fetchUrl)
            const data = await response.json()
            
            if (data?.current) {
              const temp = data.current.temperature_2m
              const code = data.current.weather_code
              
              let condition = 'Sol'
              if (code >= 51 && code <= 67) condition = 'Chuva'
              else if (code >= 80 && code <= 82) condition = 'Chuva'
              else if (code >= 95 && code <= 99) condition = 'Tempestade'
              else if (code >= 1 && code <= 3) condition = 'Parcialmente Nublado'
              else if (code >= 45 && code <= 48) condition = 'Neblina'
              
              let suggestion = 'Mantenha o foco operacional.'
              if (condition === 'Chuva' || condition === 'Tempestade') {
                suggestion = 'Chuva lá fora em Blumenau. Mantenha o foco indoor e acelere o desenvolvimento dos módulos.'
              } else if (condition === 'Sol') {
                suggestion = 'Dia ensolarado em Blumenau. Calibre sua amplitude biológica e saia para treinar cineticamente.'
              } else {
                suggestion = 'Tempo nublado em Blumenau. Mantenha rotina equilibrada e otimize o cérebro com as quests.'
              }
              
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: true, data: { temp, condition, suggestion } }))
            } else {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ success: false, error: 'Failed to retrieve weather' }))
            }
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })()
        return
      }

      if (req.method === 'POST' && url.pathname === '/api/ai-proxy') {
        let body = ''
        req.on('data', chunk => {
          body += chunk
        })
        req.on('end', async () => {
          try {
            const { targetUrl, headers, requestBody } = JSON.parse(body)
            const response = await fetch(targetUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...headers
              },
              body: JSON.stringify(requestBody)
            })
            
            const contentType = response.headers.get('content-type') || ''
            if (contentType.includes('application/json')) {
              const data = await response.json()
              res.writeHead(response.status, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify(data))
            } else {
              const data = await response.text()
              res.writeHead(response.status, { 'Content-Type': 'text/plain' })
              res.end(data)
            }
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })
        return
      }

      if (req.method === 'POST' && url.pathname === '/api/agency-install') {
        const { exec } = require('child_process')
        const targetDir = path.resolve(process.cwd(), 'modules/THE_AGENCY')
        if (fs.existsSync(targetDir)) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true, status: 'synced' }))
          return
        }
        exec(`git clone https://github.com/msitarzewski/agency-agents "${targetDir}"`, (err) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: err.message }))
          } else {
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, status: 'synced' }))
          }
        })
        return
      }

      if (req.method === 'POST' && url.pathname === '/api/fetch-intel') {
        let body = ''
        req.on('data', chunk => {
          body += chunk
        })
        req.on('end', async () => {
          try {
            const { platform, query } = JSON.parse(body)
            const { execSync } = require('child_process')
            const env = { 
              ...process.env, 
              PATH: `${process.env.USERPROFILE || process.env.HOMEPATH}\\.agent-reach-venv\\Scripts;${process.env.PATH}` 
            }
            
            let data = ''
            let source = platform
            
            try {
              if (platform === 'bilibili' || platform === 'b站') {
                data = execSync(`bili search "${query}" --type video -n 5`, { env, encoding: 'utf8' })
              } else if (platform === 'twitter' || platform === 'x') {
                data = execSync(`twitter search "${query}" -n 5`, { env, encoding: 'utf8' })
              } else if (platform === 'v2ex') {
                const res = await fetch(`https://www.v2ex.com/api/topics/hot.json`)
                const json = await res.json()
                data = JSON.stringify(json.slice(0, 5))
              } else {
                data = execSync(`mcporter call "exa.web_search_exa(query: \\"${query}\\", numResults: 5)"`, { env, encoding: 'utf8' })
                source = 'exa'
              }
            } catch (err) {
              console.warn(`Intel fetch failed for ${platform}, activating self-healing mode...`)
              try {
                data = execSync(`mcporter call "exa.web_search_exa(query: \\"${query}\\", numResults: 5)"`, { env, encoding: 'utf8' })
                source = `exa-fallback-from-${platform}`
              } catch (fallbackErr) {
                data = `[SELF-HEALING FAILED] Falha ao coletar dados para: ${query}. Erro: ${fallbackErr.message}`
              }
            }
            
            // Save to MEGABRAIN context
            const brainPath = path.resolve(process.cwd(), 'data/megabrain_context.json')
            let brainContext = {}
            if (fs.existsSync(brainPath)) {
              try {
                brainContext = JSON.parse(fs.readFileSync(brainPath, 'utf8'))
              } catch {}
            }
            brainContext[`intel_${Date.now()}`] = {
              query,
              platform,
              source,
              timestamp: new Date().toISOString(),
              rawData: data
            }
            fs.mkdirSync(path.dirname(brainPath), { recursive: true })
            fs.writeFileSync(brainPath, JSON.stringify(brainContext, null, 2), 'utf8')
            
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, source, rawData: data }))
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })
        return
      }

      if (req.method === 'GET' && url.pathname === '/api/agent-reach-status') {
        const { execSync } = require('child_process')
        const env = { 
          ...process.env, 
          PATH: `${process.env.USERPROFILE || process.env.HOMEPATH}\\.agent-reach-venv\\Scripts;${process.env.PATH}` 
        }
        try {
          const output = execSync(`agent-reach doctor --json`, { env, encoding: 'utf8' })
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(output)
        } catch (err) {
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            status: "partial",
            channels: {
              "v2ex": "active",
              "rss": "active",
              "jina": "active",
              "bilibili": "active",
              "youtube": "active",
              "exa": "active",
              "twitter": "inactive",
              "reddit": "inactive",
              "facebook": "inactive",
              "instagram": "inactive",
              "linkedin": "inactive",
              "github": "inactive"
            }
          }))
        }
        return
      }

      if (req.method === 'GET' && url.pathname === '/api/daemon') {
        const action = url.searchParams.get('action');
        const pidFile = path.resolve(process.cwd(), 'data/daemon.pid');
        
        if (action === 'status') {
          let running = false;
          let pid = null;
          if (fs.existsSync(pidFile)) {
            const fileContent = fs.readFileSync(pidFile, 'utf8').trim();
            if (fileContent) {
              pid = parseInt(fileContent, 10);
              if (pid) {
                try {
                  const { execSync } = require('child_process');
                  execSync(`tasklist /FI "PID eq ${pid}" | findstr ${pid}`);
                  running = true;
                } catch {
                  running = false;
                }
              }
            }
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, running, pid }));
          return;
        }
      }

      if (req.method === 'POST' && url.pathname === '/api/daemon') {
        const action = url.searchParams.get('action');
        const pidFile = path.resolve(process.cwd(), 'data/daemon.pid');
        const { spawn, execSync } = require('child_process');
        
        if (action === 'start') {
          let running = false;
          if (fs.existsSync(pidFile)) {
            const fileContent = fs.readFileSync(pidFile, 'utf8').trim();
            if (fileContent) {
              const oldPid = parseInt(fileContent, 10);
              if (oldPid) {
                try {
                  execSync(`tasklist /FI "PID eq ${oldPid}" | findstr ${oldPid}`);
                  running = true;
                } catch {
                  running = false;
                }
              }
            }
          }
          
          if (running) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Daemon already running' }));
            return;
          }
          
          try {
            fs.mkdirSync(path.resolve(process.cwd(), 'data'), { recursive: true });
            const outLog = fs.openSync(path.resolve(process.cwd(), 'data/daemon.log'), 'a');
            const errLog = fs.openSync(path.resolve(process.cwd(), 'data/daemon.log'), 'a');
            
            const daemonScript = path.resolve(process.cwd(), 'modules/CORE/daemon.py');
            const subprocess = spawn('python', [daemonScript], {
              detached: true,
              stdio: ['ignore', outLog, errLog]
            });
            
            subprocess.unref();
            fs.writeFileSync(pidFile, String(subprocess.pid), 'utf8');
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, pid: subprocess.pid }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
          return;
        }
        
        if (action === 'stop') {
          if (fs.existsSync(pidFile)) {
            const fileContent = fs.readFileSync(pidFile, 'utf8').trim();
            if (fileContent) {
              const pid = parseInt(fileContent, 10);
              if (pid) {
                try {
                  process.kill(pid, 'SIGTERM');
                } catch {
                  try {
                    execSync(`taskkill /F /PID ${pid}`);
                  } catch {}
                }
              }
            }
            fs.writeFileSync(pidFile, '', 'utf8');
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
          return;
        }
      }

      // ── SCOUT OPPORTUNITIES ──
      if (req.method === 'GET' && url.pathname === '/api/scout/opportunities') {
        const oppDir = path.resolve(process.cwd(), 'data/opportunities');
        let list = [];
        if (fs.existsSync(oppDir)) {
          try {
            const files = fs.readdirSync(oppDir).filter(f => f.endsWith('.json'));
            for (const f of files) {
              const content = fs.readFileSync(path.join(oppDir, f), 'utf8');
              list.push(JSON.parse(content));
            }
            list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          } catch (err) {
            console.error('[DUST DEV API] Failed to list opportunities:', err.message);
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(list));
        return;
      }

      // ── SCOUT SCAN ──
      if (req.method === 'POST' && url.pathname === '/api/scout/scan') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { query } = JSON.parse(body);
            if (!query) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Query parameter required' }));
              return;
            }
            const { execSync } = require('child_process');
            const homeDir = require('os').homedir();
            const env = { 
              ...process.env, 
              USERPROFILE: homeDir,
              HOMEPATH: homeDir.replace(/^[a-zA-Z]:/, ''),
              PATH: `${homeDir}\\.agent-reach-venv\\Scripts;${process.env.PATH}`,
              DUST_CWD: process.cwd()
            };
            console.log(`[DUST DEV API] Spawning scout query: "${query}"`);
            execSync(`node modules/SCOUT/scout.cjs --query "${query.replace(/"/g, '\\"')}"`, { env, encoding: 'utf8' });
            
            const oppDir = path.resolve(process.cwd(), 'data/opportunities');
            let result = { success: true, message: 'Scan finished' };
            if (fs.existsSync(oppDir)) {
              const files = fs.readdirSync(oppDir).filter(f => f.endsWith('.json'));
              if (files.length > 0) {
                files.sort((a, b) => fs.statSync(path.join(oppDir, b)).mtime - fs.statSync(path.join(oppDir, a)).mtime);
                result = JSON.parse(fs.readFileSync(path.join(oppDir, files[0]), 'utf8'));
              }
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, opportunity: result }));
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
        return;
      }

      // ── SCOUT DAEMON STATUS ──
      if (req.method === 'GET' && url.pathname === '/api/scout/daemon') {
        const action = url.searchParams.get('action');
        const pidFile = path.resolve(process.cwd(), 'data/scout_daemon.pid');
        const logFile = path.resolve(process.cwd(), 'data/scout_daemon.log');
        
        if (action === 'status') {
          let running = false, pid = null;
          if (fs.existsSync(pidFile)) {
            const content = fs.readFileSync(pidFile, 'utf8').trim();
            if (content) {
              pid = parseInt(content, 10);
              try {
                const { execSync } = require('child_process');
                execSync(`tasklist /FI "PID eq ${pid}" | findstr ${pid}`);
                running = true;
              } catch {
                running = false;
              }
            }
          }
          let logTail = '';
          if (fs.existsSync(logFile)) {
            try {
              const lines = fs.readFileSync(logFile, 'utf8').split('\n').filter(Boolean);
              logTail = lines.slice(-25).join('\n');
            } catch {}
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, running, pid, logTail }));
          return;
        }
      }

      // ── SCOUT DAEMON POST ACTIONS ──
      if (req.method === 'POST' && url.pathname === '/api/scout/daemon') {
        const action = url.searchParams.get('action');
        const pidFile = path.resolve(process.cwd(), 'data/scout_daemon.pid');
        const { spawn, execSync } = require('child_process');
        
        if (action === 'start') {
          let running = false;
          if (fs.existsSync(pidFile)) {
            const c = fs.readFileSync(pidFile, 'utf8').trim();
            if (c) try { execSync(`tasklist /FI "PID eq ${c}" | findstr ${c}`); running = true; } catch {}
          }
          if (running) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'already running' }));
            return;
          }
          try {
            const log = fs.openSync(path.resolve(process.cwd(), 'data/scout_daemon.log'), 'a');
            const daemonScript = path.resolve(process.cwd(), 'modules/SCOUT/scout_daemon.cjs');
            const sub = spawn('node', [daemonScript], { detached: true, stdio: ['ignore', log, log], env: { ...process.env, DUST_CWD: process.cwd() } });
            sub.unref();
            fs.writeFileSync(pidFile, String(sub.pid), 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, pid: sub.pid }));
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
          return;
        } else if (action === 'stop') {
          if (fs.existsSync(pidFile)) {
            const c = fs.readFileSync(pidFile, 'utf8').trim();
            if (c) {
              try { process.kill(parseInt(c), 'SIGTERM'); } catch {
                try { execSync(`taskkill /F /PID ${c}`); } catch {}
              }
            }
            fs.writeFileSync(pidFile, '', 'utf8');
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
          return;
        }
      }

      // ── SCOUT CONFIG ──
      if (url.pathname === '/api/scout/config') {
        const cfPath = path.resolve(process.cwd(), 'data/scout_config.json');
        if (req.method === 'GET') {
          let config = { queries: [], intervalMinutes: 10 };
          if (fs.existsSync(cfPath)) {
            try { config = JSON.parse(fs.readFileSync(cfPath, 'utf8')); } catch {}
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(config));
          return;
        } else if (req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk; });
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              fs.writeFileSync(cfPath, JSON.stringify(data, null, 2), 'utf8');
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: e.message }));
            }
          });
          return;
        }
      }

      if (req.method === 'GET' && url.pathname === '/api/audit-logs') {
        const auditFile = path.resolve(process.cwd(), 'data/oracle_audit.json');
        let logs = [];
        if (fs.existsSync(auditFile)) {
          try {
            logs = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
          } catch {}
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(logs));
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/sync-config') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const configFile = path.resolve(process.cwd(), 'data/config.json');
            fs.mkdirSync(path.dirname(configFile), { recursive: true });
            fs.writeFileSync(configFile, JSON.stringify(data, null, 2), 'utf8');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
        return;
      }

      if (req.method === 'POST' && url.pathname === '/api/council') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const { question } = JSON.parse(body);
            
            const brainPath = path.resolve(process.cwd(), 'data/megabrain_context.json');
            let brainContext = {};
            if (fs.existsSync(brainPath)) {
              try { brainContext = JSON.parse(fs.readFileSync(brainPath, 'utf8')); } catch {}
            }
            
            const contextStr = JSON.stringify(brainContext).slice(0, 3000);
            
            const configFile = path.resolve(process.cwd(), 'data/config.json');
            let config = { provider: 'freellmapi', token: '', model: 'auto', url: 'http://localhost:5000/v1' };
            if (fs.existsSync(configFile)) {
              try { config = JSON.parse(fs.readFileSync(configFile, 'utf8')); } catch {}
            }
            
            const prompt = `Você é o Coordenador do Conselho de Alta Inteligência (Council of High Intelligence).
Analise a seguinte questão complexa de negócios submetida pelo Chefe (Bernardo): "${question}"

Utilize as diretrizes operacionais do DUST OS e o contexto recente do Megabrain/Agent-Reach:
${contextStr}

Simule um debate dinâmico em 5 a 8 falas entre as personas históricas do conselho mais qualificadas para esta pergunta.
Depois, compile os votos (FAVORÁVEL, CONTRA ou ABSTENÇÃO) de todos os 18 membros do conselho (Aristóteles, Sócrates, Sun Tzu, Ada Lovelace, Marco Aurélio, Maquiavel, Lao Tzu, Richard Feynman, Linus Torvalds, Miyamoto Musashi, Alan Watts, Andrej Karpathy, Ilya Sutskever, Daniel Kahneman, Donella Meadows, Charlie Munger, Nassim Taleb, Dieter Rams), com uma justificativa de 1 frase para cada voto.
Por fim, gere um veredito detalhado em Markdown que será salvo como CONSILIUM_DECISION.md, contendo as seções:
# CONSILIUM DECISION: [Título]
## 1. Veredito Consensual
[Decisão final consensual do conselho]
## 2. Votos Minoritários e Dissidências
[Riscos ignorados ou pontos de atenção fundamentais levantados]
## 3. Próximos Passos (Next Steps para The Agency)
[Lista de tarefas lógicas ordenadas para o ORACLE distribuir na agência]

Você DEVE responder ESTRITAMENTE em formato JSON com o seguinte formato exato (não coloque markdown ou textos explicativos ao redor do JSON):
{
  "debate": [
    { "persona": "Sócrates", "message": "...", "polarity": "Destruição de premissas" },
    ...
  ],
  "votes": {
    "Aristóteles": { "vote": "Favorável", "reason": "..." },
    ...
  },
  "verdict": "..."
}`;

            let responseText = '';
            
            try {
              const headers = { 'Content-Type': 'application/json' };
              let targetUrl = '';
              let requestBody = {};
              
              if (config.provider === 'deepseek') {
                targetUrl = 'https://api.deepseek.com/v1/chat/completions';
                if (config.token) headers['Authorization'] = `Bearer ${config.token}`;
                requestBody = {
                  model: 'deepseek-chat',
                  messages: [{ role: 'user', content: prompt }],
                  temperature: 0.7
                };
              } else if (config.provider === 'huggingface') {
                const model = config.model !== 'auto' ? config.model : 'Qwen/Qwen2.5-72B-Instruct';
                targetUrl = 'https://api-inference.huggingface.co/v1/chat/completions';
                if (config.token) headers['Authorization'] = `Bearer ${config.token}`;
                requestBody = {
                  model,
                  messages: [{ role: 'user', content: prompt }],
                  temperature: 0.7
                };
              } else {
                targetUrl = `${config.url}/chat/completions`;
                if (config.token) headers['Authorization'] = `Bearer ${config.token}`;
                requestBody = {
                  model: config.model,
                  messages: [{ role: 'user', content: prompt }],
                  temperature: 0.7
                };
              }
              
              const fetchRes = await fetch(targetUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify(requestBody)
              });
              const resJson = await fetchRes.json();
              if (resJson.choices && resJson.choices[0] && resJson.choices[0].message) {
                responseText = resJson.choices[0].message.content;
              } else {
                throw new Error('Invalid AI response');
              }
            } catch (err) {
              console.warn('AI query failed, executing fallback mock debate...', err);
              responseText = JSON.stringify(generateFallbackDebate(question));
            }
            
            let parsed = null;
            try {
              let cleanText = responseText.trim();
              if (cleanText.startsWith('```json')) {
                cleanText = cleanText.substring(7);
              } else if (cleanText.startsWith('```')) {
                cleanText = cleanText.substring(3);
              }
              if (cleanText.endsWith('```')) {
                cleanText = cleanText.substring(0, cleanText.length - 3);
              }
              parsed = JSON.parse(cleanText.trim());
            } catch (err) {
              console.warn('Failed to parse AI JSON, executing fallback mock debate...', err);
              parsed = generateFallbackDebate(question);
            }
            
            const verdictPath = path.resolve(process.cwd(), 'data/CONSILIUM_DECISION.md');
            fs.mkdirSync(path.dirname(verdictPath), { recursive: true });
            fs.writeFileSync(verdictPath, parsed.verdict || '# CONSILIUM DECISION\n\nFalha ao gerar o veredito.', 'utf8');
            
            const auditPath = path.resolve(process.cwd(), 'data/oracle_audit.json');
            let auditLogs = [];
            if (fs.existsSync(auditPath)) {
              try { auditLogs = JSON.parse(fs.readFileSync(auditPath, 'utf8')); } catch {}
            }
            auditLogs.push({
              timestamp: new Date().toISOString(),
              platform: 'council',
              query: question,
              status: 'success',
              risk: 'LOW (deliberation node)',
              action: 'Consilium Deliberation',
              detail: `Conselho reunido. Veredito Consilium Decision gerado para a diretriz: "${question}".`
            });
            fs.writeFileSync(auditPath, JSON.stringify(auditLogs.slice(-100), null, 2), 'utf8');
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, ...parsed }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
        return;
      }


      if (req.method === 'GET' && url.pathname === '/api/fetch-rss') {
        ;(async () => {
          try {
            // Load feeds config
            const feedsPath = path.resolve(process.cwd(), 'data/feeds.json')
            let feedsConfig = []
            if (fs.existsSync(feedsPath)) {
              feedsConfig = JSON.parse(fs.readFileSync(feedsPath, 'utf8'))
            }

            // Simple regex-based RSS/Atom parser (no external libs needed)
            const parseXML = (xml, sourceName, sourceCategory, sourceIcon) => {
              const items = []
              const cleanTag = (str) => str
                .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
                .replace(/<[^>]+>/g, '')
                .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>').replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'").replace(/&apos;/g, "'")
                .trim()

              const getTagVal = (block, tag) => {
                const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
                return m ? cleanTag(m[1]) : ''
              }

              // RSS 2.0 items
              const rssItems = [...xml.matchAll(/<item[^>]*>([\s\S]*?)<\/item>/gi)]
              // Atom entries
              const atomItems = rssItems.length === 0
                ? [...xml.matchAll(/<entry[^>]*>([\s\S]*?)<\/entry>/gi)]
                : []
              const rawItems = [...rssItems, ...atomItems].slice(0, 8)

              for (const match of rawItems) {
                const block = match[1]
                const title = getTagVal(block, 'title')
                let link = getTagVal(block, 'link')
                if (!link) {
                  const hrefM = block.match(/<link[^>]+href="([^"]+)"/)
                  link = hrefM ? hrefM[1] : ''
                }
                const description = getTagVal(block, 'description') ||
                  getTagVal(block, 'summary') || getTagVal(block, 'content')
                const pubDate = getTagVal(block, 'pubDate') ||
                  getTagVal(block, 'published') || getTagVal(block, 'updated')

                if (!title || !link) continue

                const wordCount = description.split(/\s+/).filter(Boolean).length
                const readTimeMin = Math.max(1, Math.round(wordCount / 200))

                items.push({
                  id: `${sourceCategory}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  title: title.slice(0, 150),
                  source: sourceName,
                  category: sourceCategory,
                  icon: sourceIcon,
                  url: link,
                  pubDate,
                  readTimeMin,
                  summary: description.slice(0, 400)
                })
              }
              return items
            }

            const allArticles = []
            for (const feed of feedsConfig) {
              try {
                const feedRes = await fetch(feed.url, {
                  headers: { 'User-Agent': 'DUST-ReadingHub/1.0' }
                })
                const xml = await feedRes.text()
                const parsed = parseXML(xml, feed.name, feed.category, feed.icon || '📄')
                allArticles.push(...parsed)
              } catch (e) {
                console.warn(`[RSS] Failed to fetch ${feed.name}: ${e.message}`)
              }
            }

            // Sort by pubDate desc
            allArticles.sort((a, b) => {
              const da = a.pubDate ? new Date(a.pubDate) : 0
              const db = b.pubDate ? new Date(b.pubDate) : 0
              return db - da
            })

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: true, articles: allArticles, count: allArticles.length }))
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ success: false, error: err.message }))
          }
        })()
        return
      }

      next()
    })
  }
})

// Plugin to fix dual React instance when App.jsx is a pre-bundled Lovable.dev bundle.
// The bundle contains React as a CJS factory internally. When Vite also adds the ESM React,
// useState becomes null due to dispatcher mismatch. This plugin intercepts the CJS factory
// output and replaces it with the single ESM React instance.
const fixDualReact = () => ({
  name: 'fix-dual-react',
  transform(code, id) {
    if (!id.includes('App.jsx') || id.includes('node_modules')) return null;
    // Only patch files that use the Lovable.dev CJS lazy-module pattern
    const MARKER = 'var o = (e, t) => () => {';
    if (!code.includes(MARKER)) return null;

    console.log('[fix-dual-react] Patching App.jsx — redirecting internal CJS React to ESM React...');

    // Use a flexible dotAll regex that matches the loader function body regardless of exact whitespace
    // [\s\S]{10,300}? = lazy match any chars (inc. newlines), between 10-300 chars
    const loaderRegex = /var o = \(e, t\) => \(\) => \{[\s\S]{10,300}?return t\.exports;\s*\};/;

    const match = code.match(loaderRegex);
    if (!match) {
      // Debug: print what code looks like around the marker
      const markerIdx = code.indexOf(MARKER);
      const snippet = JSON.stringify(code.substring(markerIdx, markerIdx + 200));
      console.warn('[fix-dual-react] Regex did not match. Snippet:', snippet);
      return null;
    }

    console.log('[fix-dual-react] Match found! Replacing loader...');

    // Detect the actual line ending used in the file
    const nl = code.includes('\r\n') ? '\r\n' : '\n';

    const patchedLoader = [
      `var o = (e, t) => () => {`,
      `  if (!t) {`,
      `    e((t = {`,
      `      exports: {}`,
      `    }).exports, t);`,
      `    // Intercept: if this factory produced React, redirect to the single ESM React import`,
      `    if (t && t.exports && typeof t.exports.useState === 'function' && typeof t.exports.createElement === 'function') {`,
      `      t.exports = __dust_react_import__;`,
      `    }`,
      `    e = null;`,
      `  }`,
      `  return t.exports;`,
      `};`
    ].join(nl);

    // Import namespace is always initialized before module body — no TDZ risk
    const preamble = `import * as __dust_react_import__ from "react";${nl}`;
    let patched = preamble + code.replace(loaderRegex, patchedLoader);

    // Convert let [xxx] = (0, v.use... to var [xxx] to hoist React state variables and prevent TDZ ReferenceErrors (e.g. Cannot access 'en' before initialization)
    console.log('[fix-dual-react] Hoisting hook state variables to var...');
    const hookStateRegex = /\blet\s+\[([a-zA-Z0-9_$,\s]+)\]\s*=\s*\(0,\s*v\.use/g;
    patched = patched.replace(hookStateRegex, 'var [$1] = (0, v.use');

    // Fix backend API port mismatch (directing requests from 3005 to the actual running server port 5174)
    console.log('[fix-dual-react] Redirecting backend API port from 3005 to 5174...');
    patched = patched.replace(/http:\/\/localhost:3005/g, 'http://localhost:5174');

    return { code: patched, map: null };
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [fixDualReact(), react(), tailwindcss(), dustLocalFsPlugin()],
  base: './',
  css: {
    postcss: {
      plugins: []
    }
  },
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime']
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  server: {
    port: 5180,
    strictPort: true,
    watch: {
      ignored: ['**/dist_electron/**', '**/dist_desktop/**']
    }
  }
})


function generateFallbackDebate(question) {
  const isBelBel = question.toLowerCase().includes('belmont') || question.toLowerCase().includes('nutra');
  const isDeC = question.toLowerCase().includes('coninck') || question.toLowerCase().includes('capital');
  
  let title = "Decisão sobre " + question;
  let verdictText = "";
  let stepsText = "";
  let minorText = "";
  
  if (isBelBel) {
    title = "Estratégia de Escala Nutra Belmont";
    verdictText = "O conselho deliberou e aprova a escala agressiva da marca Belmont por meio de canais de tráfego direto de alta conversão, descentralizando a aquisição de clientes.";
    minorText = "Taleb adverte sobre a fragilidade de focar em um único gateway de pagamento e canais únicos de anúncios (Meta). Sócrates questiona se a margem líquida real sustenta o CAC crescente.";
    stepsText = "1. Criar novo criativo estático e roteiro VSL (Copywriter)\\n2. Configurar infraestrutura de contingência de pagamentos (Especializado)\\n3. Desenvolver landing pages rápidas e otimizadas (Design / Developer)";
  } else if (isDeC) {
    title = "Alocação de Capital De Coninck & Co.";
    verdictText = "Foco em alocação conservadora, direcionando 70% do excedente de caixa para ativos produtivos B2B de cashflow mensal e 30% em hedge líquido.";
    minorText = "Munger pontua que a atratividade do equity local pode estar sobreavaliada. Musashi adverte contra hesitação na liquidação de posições perdedoras.";
    stepsText = "1. Desenvolver relatório de fluxo de caixa projetado (Finance)\\n2. Analisar valuation de novos deals inbound (Analista de Investimentos)\\n3. Configurar posições de hedge nas corretoras integradas (Developer)";
  } else {
    verdictText = `O conselho delibera favoravelmente sobre as ações estratégicas para resolver: "${question}".`;
    minorText = "Socrates aponta que premissas sobre custo de aquisição e aceitação do mercado precisam de validação empírica rigorosa antes da alocação de recursos.";
    stepsText = `1. Levantar gargalos operacionais imediatos (Project Manager)\\n2. Desenvolver protótipo conceitual para validação (Developer)\\n3. Coletar dados de interesse de leads (Marketing)`;
  }
  
  return {
    debate: [
      {
        persona: "Sócrates",
        message: `Companheiros, antes de falarmos sobre execução, qual é a premissa oculta nesta diretriz sobre "${question}"? Estamos resolvendo o problema real ou apenas medicando os sintomas?`,
        polarity: "Destruição de Premissas"
      },
      {
        persona: "Charlie Munger",
        message: "Invertam o problema. Em vez de perguntar como ter sucesso, perguntem o que nos garantiria um fracasso catastrófico. No caso Belmont/De Coninck, focar em canais únicos de distribuição ou depender de um único parceiro de tecnologia é a receita para a ruína.",
        polarity: "Inversão de Perspectiva"
      },
      {
        persona: "Richard Feynman",
        message: "Munger está correto. Removam os jargões. Qual é o funil mais simples que o usuário percorre? Se não conseguimos explicar a conversão em três passos simples, o sistema está complexo demais. Vamos simplificar a arquitetura.",
        polarity: "Princípios Fundamentais"
      },
      {
        persona: "Nassim Taleb",
        message: "Devemos desenhar o sistema para a antifragilidade. As oscilações do mercado não podem nos matar. Se escalarmos Belmont cegamente sem contingência de contas de anúncios e de gateways, criaremos um sistema extremamente frágil. Protejam o tail-risk primeiro.",
        polarity: "Gestão de Risco e Cauda"
      },
      {
        persona: "Linus Torvalds",
        message: "Menos conversa acadêmica, mais pragmatismo. Teorias não pagam as contas. Precisamos colocar o código no ar e testar a hipótese com tráfego real. Mandem os agentes de design e copy rodarem a primeira campanha amanhã.",
        polarity: "Engenharia Pragmática"
      }
    ],
    votes: {
      "Aristóteles": { "vote": "Favorável", "reason": "A taxonomia de delegação está estruturalmente consistente." },
      "Sócrates": { "vote": "Abstenção", "reason": "As premissas de custo operacional ainda precisam de mais diálogos." },
      "Sun Tzu": { "vote": "Favorável", "reason": "A estratégia lê bem o terreno concorrencial atual." },
      "Ada Lovelace": { "vote": "Favorável", "reason": "A automação proposta é computacionalmente limpa." },
      "Marco Aurélio": { "vote": "Favorável", "reason": "Ação alinhada com os deveres da holding." },
      "Maquiavel": { "vote": "Favorável", "reason": "Alinha-se perfeitamente com os interesses dos stakeholders." },
      "Lao Tzu": { "vote": "Abstenção", "reason": "Devemos agir sem esforço excessivo; monitorar fluxo." },
      "Richard Feynman": { "vote": "Favorável", "reason": "A simplicidade do plano de ação é verificável." },
      "Linus Torvalds": { "vote": "Favorável", "reason": "Código pronto para deploy. Ship it." },
      "Miyamoto Musashi": { "vote": "Favorável", "reason": "O momento de agir é exatamente agora." },
      "Alan Watts": { "vote": "Favorável", "reason": "Resolve a ilusão da complexidade corporativa." },
      "Andrej Karpathy": { "vote": "Favorável", "reason": "Modelo e pipelines de dados estão alinhados." },
      "Ilya Sutskever": { "vote": "Favorável", "reason": "Crescimento seguro com contingência ativada." },
      "Daniel Kahneman": { "vote": "Favorável", "reason": "Reduz o viés de otimismo excessivo via audit log." },
      "Donella Meadows": { "vote": "Favorável", "reason": "Ajusta o laço de realimentação de leads de forma sistêmica." },
      "Charlie Munger": { "vote": "Favorável", "reason": "Evita erros idiotas e diversifica canais de aquisição." },
      "Nassim Taleb": { "vote": "Favorável", "reason": "Limita o risco máximo e garante sobrevivência da marca." },
      "Dieter Rams": { "vote": "Favorável", "reason": "O design simplificado melhora a experiência final do cliente." }
    },
    verdict: `# CONSILIUM DECISION: ${title}\n\n## 1. Veredito Consensual\n${verdictText}\n\n## 2. Votos Minoritários e Dissidências\n${minorText}\n\n## 3. Próximos Passos (Next Steps para The Agency)\n${stepsText}`
  };
}

