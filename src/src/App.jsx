/**
 * DUST OS v2.5 — CORE MINIMALIST
 * Financial Command Center
 * 
 * Architecture: Vite + React 19 + Electron
 * Scope: Finance · Investments · Holdings · High-Margin SaaS/Data
 * Active Modules: SCOUT · DATA · OPERATIONS · READINGS · INCUBATOR
 */

import { useState } from 'react'
import TopBar from './components/layout/TopBar.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import DQuestsModule   from './components/modules/DQuestsModule.jsx'
import ReadingsModule  from './components/modules/ReadingsModule.jsx'
import HobbiesModule   from './components/modules/HobbiesModule.jsx'
import ConfigModule    from './components/modules/ConfigModule.jsx'

// Module registry
const MODULES = {
  dquests:    DQuestsModule,
  readings:   ReadingsModule,
  hobbies:    HobbiesModule,
  config:     ConfigModule,
}

export default function App() {
  const [activeModule, setActiveModule] = useState('dquests')

  const ActiveComponent = MODULES[activeModule] || DQuestsModule

  return (
    <div className="dust-shell">
      {/* Top bar with market tickers */}
      <TopBar activeModule={activeModule} />

      <div className="dust-body">
        {/* Left navigation sidebar */}
        <Sidebar active={activeModule} onChange={setActiveModule} />

        {/* Main content area */}
        <main className="dust-main" key={activeModule}>
          <ActiveComponent />
        </main>
      </div>
    </div>
  )
}
