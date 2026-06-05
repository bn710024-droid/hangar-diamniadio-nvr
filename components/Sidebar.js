'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navPrincipal = [
  { href: '/dashboard',    label: 'Dashboard',   ico: <DashIco /> },
  { href: '/cameras',      label: 'Caméras',     ico: <CamIco />,  badge: true },
  { href: '/incidents',    label: 'Incidents',   ico: <IncIco /> },
  { href: '/maintenance',  label: 'Maintenance', ico: <MaintIco /> },
]
const navSystem = [
  { href: '/alertes',   label: 'Alertes',  ico: <AlertIco /> },
  { href: '/nvr',       label: 'NVR',      ico: <NvrIco /> },
  { href: '/rapports',  label: 'Rapports', ico: <RapIco /> },
]

export default function Sidebar({ hsCnt = 0, sideOpen, closeSide }) {
  const path = usePathname()
  return (
    <>
      <div className={`sb-overlay${sideOpen ? ' visible' : ''}`} onClick={closeSide} />
      <aside className={`sidebar${sideOpen ? ' open' : ''}`}>
        <div className="sb-brand">
          <div className="sb-logo">📹</div>
          <div>
            <div className="sb-title">NVR <span>HANGAR</span></div>
            <div className="sb-sub">DIAMNIADIO</div>
          </div>
        </div>
        <nav className="sb-nav">
          <div className="nav-grp">Principal</div>
          {navPrincipal.map(item => (
            <Link key={item.href} href={item.href} className={`nav-item${path === item.href ? ' active' : ''}`} onClick={closeSide}>
              <span className="nav-ico">{item.ico}</span>
              {item.label}
              {item.badge && hsCnt > 0 && <span className="nav-badge">{hsCnt}</span>}
            </Link>
          ))}
          <div className="nav-grp">Système</div>
          {navSystem.map(item => (
            <Link key={item.href} href={item.href} className={`nav-item${path === item.href ? ' active' : ''}`} onClick={closeSide}>
              <span className="nav-ico">{item.ico}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sb-foot">
          <div className="sb-user">
            <div className="sb-av">DA</div>
            <div>
              <div className="sb-nm">Dabakh</div>
              <div className="sb-rl">Admin</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function DashIco()  { return <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><rect x="1" y="1" width="6" height="6"/><rect x="9" y="1" width="6" height="6"/><rect x="1" y="9" width="6" height="6"/><rect x="9" y="9" width="6" height="6"/></svg> }
function CamIco()   { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="1" y="4" width="14" height="10" rx="1"/><circle cx="8" cy="9" r="2.5"/><path d="M5.5 4l1.5-2h3l1.5 2"/></svg> }
function IncIco()   { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><polygon points="8,2 15,13 1,13"/><line x1="8" y1="7" x2="8" y2="10"/></svg> }
function MaintIco() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M10.5 2a4 4 0 010 7L4 15l-2-2 6.5-6.5A4 4 0 0110.5 2z"/></svg> }
function AlertIco() { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><path d="M8 1a5 5 0 015 5v3l1.5 2.5h-13L3 9V6a5 5 0 015-5z"/><path d="M6.5 13.5a1.5 1.5 0 003 0"/></svg> }
function NvrIco()   { return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="16" height="16"><rect x="1" y="2" width="14" height="9" rx="1"/><path d="M5 13h6M8 11v2"/></svg> }
function RapIco()   { return <svg viewBox="0 0 16 16" fill="currentColor" width="16" height="16"><rect x="1" y="10" width="3" height="5"/><rect x="6" y="6" width="3" height="9"/><rect x="11" y="2" width="3" height="13"/></svg> }
