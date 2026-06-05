'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav({ hsCnt = 0 }) {
  const path = usePathname()
  const items = [
    { href: '/dashboard',   label: 'Dashboard',  ico: <DashIco /> },
    { href: '/cameras',     label: 'Caméras',    ico: <CamIco />,   badge: hsCnt },
    { href: '/incidents',   label: 'Incidents',  ico: <IncIco /> },
    { href: '/maintenance', label: 'Maint.',     ico: <MaintIco /> },
    { href: '/alertes',     label: 'Alertes',    ico: <AlertIco /> },
  ]
  return (
    <nav className="bottom-nav">
      <div className="bn-items">
        {items.map(item => (
          <Link key={item.href} href={item.href} className={`bn-item${path === item.href ? ' active' : ''}`}>
            <span className="bn-ico">{item.ico}</span>
            <span className="bn-lbl">{item.label}</span>
            {item.badge > 0 && <span className="bn-badge">{item.badge}</span>}
          </Link>
        ))}
      </div>
    </nav>
  )
}

function DashIco()  { return <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20"><rect x="1" y="1" width="8" height="8"/><rect x="11" y="1" width="8" height="8"/><rect x="1" y="11" width="8" height="8"/><rect x="11" y="11" width="8" height="8"/></svg> }
function CamIco()   { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><rect x="1" y="5" width="18" height="13" rx="1.5"/><circle cx="10" cy="12" r="3.5"/><path d="M7 5l2-3h4l2 3"/></svg> }
function IncIco()   { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><polygon points="10,2 19,17 1,17"/><line x1="10" y1="8" x2="10" y2="12"/></svg> }
function MaintIco() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M12.5 2.5a5 5 0 010 8L4 19l-2.5-2.5 8.5-8.5a5 5 0 010-8z"/></svg> }
function AlertIco() { return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M10 2a6 6 0 016 6v4l2 3H2l2-3V8a6 6 0 016-6z"/><path d="M8 17a2 2 0 004 0"/></svg> }
