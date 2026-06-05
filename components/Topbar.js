'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const PAGE_INFO = {
  '/dashboard':   { title: 'Dashboard',   crumb: 'Vue d\'ensemble' },
  '/cameras':     { title: 'Caméras',     crumb: 'Liste & statut' },
  '/incidents':   { title: 'Incidents',   crumb: 'Journal des alertes' },
  '/maintenance': { title: 'Maintenance', crumb: 'Interventions' },
  '/alertes':     { title: 'Alertes',     crumb: 'Règles & notifications' },
  '/nvr':         { title: 'NVR',         crumb: 'Configuration réseau' },
  '/rapports':    { title: 'Rapports',    crumb: 'Exports & statistiques' },
}

export default function Topbar({ openSide, onRefresh, refreshing }) {
  const [clock, setClock] = useState('')
  const path = usePathname()
  const info = PAGE_INFO[path] || { title: 'Dashboard', crumb: '' }

  useEffect(() => {
    const update = () => setClock(new Date().toLocaleTimeString('fr-FR'))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="topbar">
      <div className="tb-left">
        <button className="menu-btn" onClick={openSide} aria-label="Menu">
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <line x1="2" y1="4" x2="14" y2="4"/><line x1="2" y1="8" x2="14" y2="8"/><line x1="2" y1="12" x2="14" y2="12"/>
          </svg>
        </button>
        <div>
          <div className="pg-title">{info.title}</div>
          <div className="pg-crumb"><span>NVR Hangar</span> › <span>{info.crumb}</span></div>
        </div>
      </div>
      <div className="tb-right">
        <div className="live-pill"><div className="live-dot"></div><span>LIVE</span></div>
        <div className="clock">{clock}</div>
        <div className={`tb-btn${refreshing ? ' spinning' : ''}`} title="Actualiser" onClick={onRefresh}>
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
            <polyline points="1,4 1,9 6,9"/><path d="M3.5 14A7 7 0 1015 8"/>
          </svg>
        </div>
      </div>
    </header>
  )
}
