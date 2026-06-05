'use client'
import { useState, useEffect, useRef } from 'react'
import AppShell from '@/components/AppShell'
import { useCameras } from '@/lib/store'
import { getCamStats } from '@/lib/data'

export default function NvrPage() {
  const [cameras] = useCameras()
  const [nvrStatus, setNvrStatus] = useState('connecting')
  const [nvrDetail, setNvrDetail] = useState('')
  const [lastChk, setLastChk] = useState('—')
  const [logs, setLogs] = useState([])
  const [checking, setChecking] = useState(false)
  const retryRef = useRef(null)
  const stats = getCamStats(cameras)

  function addLog(type, msg) {
    const ts = new Date().toLocaleTimeString('fr-FR')
    const colors = { ok: '#16c75a', err: '#e8192c', warn: '#f5a623', info: '#3b82f6', try: '#9b5de5' }
    const icons  = { ok: '✔', err: '✘', warn: '⚠', info: 'ℹ', try: '→' }
    setLogs(prev => [{ ts, type, msg, color: colors[type] || '#6b7280', icon: icons[type] || '•' }, ...prev].slice(0, 40))
    setLastChk(ts)
  }

  async function checkNVR() {
    if (retryRef.current) clearTimeout(retryRef.current)
    setChecking(true); setNvrStatus('connecting')
    addLog('try', 'Connexion au proxy NVR...')
    try {
      const r = await fetch('/api/nvr?path=/ISAPI/System/status')
      addLog('info', `HTTP ${r.status}`)
      if (r.status === 200) {
        setNvrStatus('connected'); setNvrDetail('')
        addLog('ok', '✅ NVR connecté via proxy Digest Auth')
      } else if (r.status === 401) {
        setNvrStatus('auth-error'); setNvrDetail('401')
        addLog('err', '401 — identifiants incorrects')
      } else if (r.status === 403) {
        setNvrStatus('auth-error'); setNvrDetail('403')
        addLog('err', '403 — compte verrouillé ?')
      } else if (r.status === 502 || r.status === 504) {
        setNvrStatus('unreachable'); setNvrDetail('502/504')
        addLog('warn', 'NVR inaccessible — vérifier port forwarding')
      } else {
        setNvrStatus('unreachable'); setNvrDetail(`HTTP ${r.status}`)
        addLog('warn', `Réponse inattendue : HTTP ${r.status}`)
      }
    } catch (e) {
      setNvrStatus('unreachable'); setNvrDetail('network')
      addLog('err', e.message?.substring(0, 60) || 'Erreur réseau')
    }
    setChecking(false)
    retryRef.current = setTimeout(checkNVR, 30000)
  }

  useEffect(() => {
    const t = setTimeout(checkNVR, 600)
    return () => { clearTimeout(t); if (retryRef.current) clearTimeout(retryRef.current) }
  }, [])

  const statusCfg = {
    connecting:   { bg: 'var(--orange)', label: '⏳ Connexion en cours...', cls: 'warn' },
    connected:    { bg: 'var(--green)',  label: '✅ NVR connecté',           cls: 'ok'   },
    'auth-error': { bg: 'var(--orange)', label: '⚠️ Erreur d\'authentification', cls: 'warn' },
    unreachable:  { bg: 'var(--red)',    label: '❌ NVR inaccessible',       cls: 'err'  },
  }
  const sc = statusCfg[nvrStatus] || statusCfg.unreachable

  return (
    <AppShell hsCnt={stats.hs + stats.instable}>
      <div className="content">
        {/* Statut connexion */}
        <div className="sec-card" style={{ marginBottom: 14 }}>
          <div className="sec-head">
            <div className="sec-title">🖥️ État de connexion NVR</div>
            <button className="btn btn-primary btn-sm" onClick={checkNVR} disabled={checking}>
              {checking ? '⏳ Test...' : '🔄 Tester'}
            </button>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <div className={`nvr-conn ${sc.cls}`} style={{ marginBottom: 16 }}>
              <div className="nvr-dot" style={{
                background: sc.bg,
                animation: nvrStatus === 'connected' || nvrStatus === 'connecting' ? 'pl 1.4s infinite' : 'none'
              }}></div>
              <span className="nvr-status-txt">{sc.label}{nvrDetail ? ` (${nvrDetail})` : ''}</span>
              <span className="nvr-lastchk">{lastChk}</span>
            </div>
          </div>
        </div>

        {/* Infos NVR */}
        <div className="sec-card" style={{ marginBottom: 14 }}>
          <div className="sec-head"><div className="sec-title">📋 Informations NVR</div></div>
          <div className="alert-body-sec">
            {[
              { ico: '🖥️', nm: 'Modèle',         sub: 'Hikvision DS-7632NXI-K2/16P(D)', st: 'HIK' },
              { ico: '🌐', nm: 'IP locale',        sub: '192.168.0.162 (LAN)', st: null },
              { ico: '🔌', nm: 'Port ISAPI',       sub: '80 (HTTP)', st: null },
              { ico: '🔐', nm: 'Auth',             sub: 'Digest Auth MD5', st: null },
              { ico: '📡', nm: 'ISAPI path',       sub: '/ISAPI/System/status', st: null },
              { ico: '🔄', nm: 'Polling interval', sub: 'toutes les 30 secondes', st: null },
            ].map(item => (
              <div className="ch-item" key={item.nm}>
                <div className="ch-ico">{item.ico}</div>
                <div><div className="ch-nm">{item.nm}</div><div className="ch-sub">{item.sub}</div></div>
                {item.st && <span className="ch-st ready">{item.st}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* NVR-01 et NVR-02 */}
        <div className="sec-card" style={{ marginBottom: 14 }}>
          <div className="sec-head"><div className="sec-title">🗄️ NVR enregistreurs</div></div>
          <div className="alert-body-sec">
            {cameras.filter(c => c.type === 'NVR').map(nvr => (
              <div className="ch-item" key={nvr.id}>
                <div className="ch-ico">🖥️</div>
                <div>
                  <div className="ch-nm">{nvr.nom}</div>
                  <div className="ch-sub" style={{ fontFamily: 'var(--fm)' }}>{nvr.ip}</div>
                </div>
                <span className={`ch-st ${nvrStatus === 'connected' ? 'ready' : ''}`}>
                  {nvrStatus === 'connected' ? '✅ EN LIGNE' : nvrStatus === 'connecting' ? '⏳' : '❌'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Logs debug */}
        <div className="sec-card">
          <div className="sec-head">
            <div className="sec-title">📋 Logs debug</div>
            <button className="btn btn-sm" onClick={() => setLogs([])}>Effacer</button>
          </div>
          <div className="log-panel">
            {logs.length === 0 && <div style={{ color: 'var(--muted)', fontFamily: 'var(--fm)', fontSize: 11 }}>En attente de logs...</div>}
            {logs.map((log, i) => (
              <div key={i} className="log-entry" style={{ color: log.color }}>
                {log.ts}  {log.icon}  {log.msg}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
