'use client'
import { useState, useEffect, useRef } from 'react'
import { Doughnut, Bar, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler
} from 'chart.js'
import AppShell from '@/components/AppShell'
import { useCameras } from '@/lib/store'
import { getCamStats } from '@/lib/data'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler)

export default function DashboardPage() {
  const [cameras, setCameras] = useCameras()
  const [nvrStatus, setNvrStatus] = useState('connecting')
  const [nvrDetail, setNvrDetail] = useState('')
  const [nvrLogs, setNvrLogs] = useState([])
  const [refreshing, setRefreshing] = useState(false)
  const [alertDismissed, setAlertDismissed] = useState(false)
  const retryRef = useRef(null)

  const cams = cameras.filter(c => c.type !== 'NVR')
  const stats = getCamStats(cameras)
  const hsCnt = stats.hs + stats.instable

  function addLog(type, msg) {
    const ts = new Date().toLocaleTimeString('fr-FR')
    const colors = { ok: '#16c75a', err: '#e8192c', warn: '#f5a623', info: '#3b82f6', try: '#9b5de5' }
    const icons  = { ok: '✔', err: '✘', warn: '⚠', info: 'ℹ', try: '→' }
    setNvrLogs(prev => [{
      ts, type, msg, color: colors[type] || '#6b7280', icon: icons[type] || '•'
    }, ...prev].slice(0, 30))
  }

  async function checkNVR() {
    if (retryRef.current) clearTimeout(retryRef.current)
    setNvrStatus('connecting')
    addLog('try', 'Vérification NVR via proxy...')
    try {
      const r = await fetch('/api/nvr?path=/ISAPI/System/status')
      addLog('info', `HTTP ${r.status} (proxy)`)
      if (r.status === 200) {
        setNvrStatus('connected'); setNvrDetail('')
        addLog('ok', '✅ NVR connecté via proxy')
        setCameras(cameras.map(c => c.ip === '192.168.0.162'
          ? { ...c, statut: 'Actif', derniere_verif: new Date().toLocaleTimeString('fr-FR') }
          : c))
      } else if (r.status === 401 || r.status === 403) {
        setNvrStatus('auth-error'); setNvrDetail(`${r.status}`)
        addLog('err', `${r.status} — auth incorrecte`)
      } else if (r.status === 502 || r.status === 504) {
        setNvrStatus('unreachable'); setNvrDetail('502/504')
        addLog('warn', 'NVR inaccessible (port forwarding ?)')
      } else {
        setNvrStatus('unreachable'); setNvrDetail(`HTTP ${r.status}`)
        addLog('warn', `HTTP ${r.status}`)
      }
    } catch (e) {
      setNvrStatus('unreachable'); setNvrDetail('network')
      addLog('err', e.message?.substring(0, 60) || 'Erreur réseau')
    }
    retryRef.current = setTimeout(checkNVR, 30000)
  }

  useEffect(() => {
    const t = setTimeout(checkNVR, 900)
    return () => { clearTimeout(t); if (retryRef.current) clearTimeout(retryRef.current) }
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await checkNVR()
    setTimeout(() => setRefreshing(false), 600)
  }

  const statusCfg = {
    connecting:  { bg: 'var(--orange)', label: '⏳ Connexion...', cls: 'warn' },
    connected:   { bg: 'var(--green)',  label: '✅ Connecté',     cls: 'ok'   },
    'auth-error':{ bg: 'var(--orange)', label: '⚠️ Auth incorrecte', cls: 'warn' },
    unreachable: { bg: 'var(--red)',    label: '❌ Inaccessible',  cls: 'err'  },
    cors:        { bg: 'var(--orange)', label: '🔒 CORS',          cls: 'warn' },
  }
  const sc = statusCfg[nvrStatus] || statusCfg.unreachable

  // Chart data
  const donutData = {
    labels: ['Actives', 'HS', 'Instables', 'Maint.'],
    datasets: [{ data: [stats.actif, stats.hs, stats.instable, stats.maint], backgroundColor: ['#16c75a','#e8192c','#f5a623','#9b5de5'], borderWidth: 0, hoverOffset: 5 }]
  }
  const days = ['L','M','M','J','V','S','D','L','Auj']
  const ud = [94,96,91,88,95,97,93,89, stats.uptime]
  const barData = {
    labels: days,
    datasets: [{ data: ud, backgroundColor: ud.map((v,i) => i===8 ? '#f97316' : '#3b82f6'), borderRadius: 4, borderSkipped: false }]
  }
  const lineData = {
    labels: ['J-6','J-5','J-4','J-3','J-2','J-1','Auj'],
    datasets: [{ data: [91,94,88,96,93,95, stats.uptime], borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,.08)', fill: true, tension: 0.4, pointBackgroundColor: '#f97316', pointRadius: 4 }]
  }
  const typeData = {
    labels: ['Fixe', 'Mobile'],
    datasets: [{ data: [stats.fixe, stats.mobile], backgroundColor: ['#3b82f6','#9b5de5'], borderWidth: 0, hoverOffset: 5 }]
  }
  const chartOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#6b7280', font: { size: 11 } } }, y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#6b7280', font: { size: 11 } }, min: 70, max: 100 } } }
  const barOpts = { ...chartOpts, scales: { ...chartOpts.scales, y: { ...chartOpts.scales.y, min: 70, max: 100 } } }
  const donutOpts = { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } }, cutout: '74%', animation: { animateRotate: true, duration: 1000 } }

  const KPIs = [
    { lbl: 'Total caméras', val: stats.n,       color: 'c-red',    ico: '📹', d: `${stats.n} cam`,                       dt: 'flat', bar: 100 },
    { lbl: 'Actives',       val: stats.actif,   color: 'c-green',  ico: '✅', d: `${Math.round(stats.actif/stats.n*100)}%`, dt: 'up',   bar: Math.round(stats.actif/stats.n*100) },
    { lbl: 'Hors service',  val: stats.hs,      color: 'c-red',    ico: '❌', d: stats.hs > 0 ? 'Alerte' : 'OK',         dt: stats.hs > 0 ? 'down' : 'flat', bar: Math.round(stats.hs/stats.n*100) },
    { lbl: 'Instables',     val: stats.instable,color: 'c-orange', ico: '⚠️', d: stats.instable > 0 ? 'Vérif' : 'OK',  dt: stats.instable > 0 ? 'down' : 'flat', bar: Math.round(stats.instable/stats.n*100) },
  ]

  return (
    <AppShell hsCnt={hsCnt} onRefresh={handleRefresh} refreshing={refreshing}>
      {hsCnt > 0 && !alertDismissed && (
        <div className="alert-banner">
          <div className="al-ico">⚠️</div>
          <div className="al-body">
            <strong>Alerte critique</strong>
            <p>{hsCnt} caméra(s) nécessitent attention.</p>
          </div>
          <button className="al-close" onClick={() => setAlertDismissed(true)}>✕ Fermer</button>
        </div>
      )}
      <div className="content">
        <div className="sec-hd">
          <div className="sec-ttl">Surveillance Overview</div>
          <span style={{ fontSize: 11, fontFamily: 'var(--fm)', color: 'var(--muted)' }}>
            Hikvision DS-7632NXI-K2/16P
          </span>
        </div>

        {/* KPI */}
        <div className="kpi-row">
          {KPIs.map((k, i) => (
            <div className={`kpi ${k.color}`} key={i} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="kpi-top">
                <div className="kpi-ico">{k.ico}</div>
                <div className={`kpi-delta ${k.dt}`}>{k.dt === 'up' ? '▲' : k.dt === 'down' ? '▼' : '—'} {k.d}</div>
              </div>
              <div className="kpi-val">{k.val}</div>
              <div className="kpi-lbl">{k.lbl}</div>
              <div className="kpi-bar"><div className="kpi-fill" style={{ width: `${k.bar}%` }}></div></div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="charts-row" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="card-hd"><div className="card-ttl">Répartition statut</div><span className="card-pill">{stats.n} cam.</span></div>
            <div className="donut-wrap">
              <div style={{ width: 140, height: 140 }}><Doughnut data={donutData} options={donutOpts} /></div>
              <div className="donut-center"><div className="donut-pct">{stats.n}</div><div className="donut-sub">total</div></div>
            </div>
            <div className="legend">
              {[{l:'Actives',v:stats.actif,c:'#16c75a'},{l:'Hors service',v:stats.hs,c:'#e8192c'},{l:'Instables',v:stats.instable,c:'#f5a623'},{l:'Maintenance',v:stats.maint,c:'#9b5de5'}].map(x=>(
                <div className="l-row" key={x.l}><div className="l-dot" style={{background:x.c}}></div><span className="l-lbl">{x.l}</span><span className="l-val" style={{color:x.c}}>{x.v}</span></div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-hd">
              <div className="card-ttl">Uptime — 9 derniers jours</div>
              <span className="card-pill green">{Math.round(ud.reduce((a,b)=>a+b,0)/ud.length)}%</span>
            </div>
            <div style={{ height: 160, position: 'relative' }}>
              <Bar data={barData} options={barOpts} />
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="charts-row2" style={{ marginTop: 14 }}>
          <div className="card">
            <div className="card-hd"><div className="card-ttl">Tendance uptime</div><span className="card-pill">7 jours</span></div>
            <div style={{ height: 130, position: 'relative' }}><Line data={lineData} options={chartOpts} /></div>
          </div>
          <div className="card">
            <div className="card-hd"><div className="card-ttl">Type de caméra</div></div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
              <div style={{ width: 120, height: 120 }}><Doughnut data={typeData} options={donutOpts} /></div>
            </div>
            <div className="legend">
              {[{l:'Fixe',v:stats.fixe,c:'#3b82f6'},{l:'Mobile',v:stats.mobile,c:'#9b5de5'}].map(x=>(
                <div className="l-row" key={x.l}><div className="l-dot" style={{background:x.c}}></div><span className="l-lbl">{x.l}</span><span className="l-val" style={{color:x.c}}>{x.v}</span></div>
              ))}
            </div>
          </div>
        </div>

        {/* NVR Status */}
        <div className="sec-card" style={{ marginTop: 14 }}>
          <div className="sec-head"><div className="sec-title">🖥️ Connexion NVR</div></div>
          <div style={{ padding: '14px 20px' }}>
            <div className={`nvr-conn ${sc.cls}`}>
              <div className="nvr-dot" style={{ background: sc.bg, animation: nvrStatus === 'connected' || nvrStatus === 'connecting' ? 'pl 1.4s infinite' : 'none' }}></div>
              <span className="nvr-status-txt">{sc.label}{nvrDetail ? ` (${nvrDetail})` : ''}</span>
              <span className="nvr-lastchk">{new Date().toLocaleTimeString('fr-FR')}</span>
            </div>
            <div className="log-panel">
              {nvrLogs.length === 0 && <div style={{ color: 'var(--muted)', fontFamily: 'var(--fm)', fontSize: 11 }}>En attente...</div>}
              {nvrLogs.map((log, i) => (
                <div key={i} className="log-entry" style={{ color: log.color }}>
                  {log.ts}  {log.icon}  {log.msg}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
