'use client'
import { useState } from 'react'
import AppShell from '@/components/AppShell'
import { useCameras } from '@/lib/store'
import { ALERT_RULES, getCamStats } from '@/lib/data'

export default function AlertesPage() {
  const [cameras] = useCameras()
  const [rules, setRules] = useState(ALERT_RULES)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ cond: '', action: '', delai: '' })
  const stats = getCamStats(cameras)

  function addRule() {
    if (!form.cond || !form.action) return
    setRules([...rules, { id: Date.now(), ...form }])
    setShowModal(false); setForm({ cond: '', action: '', delai: '' })
  }
  function deleteRule(id) { setRules(rules.filter(r => r.id !== id)) }

  const hsCnt = stats.hs + stats.instable

  return (
    <AppShell hsCnt={hsCnt}>
      <div className="content">
        {/* Règles actives */}
        <div className="sec-card" style={{ marginBottom: 14 }}>
          <div className="sec-head">
            <div className="sec-title">🔔 Règles d'alerte</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Règle</button>
          </div>
          <div className="alert-body-sec">
            {rules.map(r => (
              <div className="ch-item" key={r.id}>
                <div className="ch-ico">🛡️</div>
                <div style={{ flex: 1 }}>
                  <div className="ch-nm">{r.cond}</div>
                  <div className="ch-sub">{r.action}</div>
                </div>
                <span className="ch-st ready" style={{ marginRight: 8 }}>{r.delai}</span>
                <div className="icon-btn danger" style={{ width: 24, height: 24, fontSize: 11 }} onClick={() => deleteRule(r.id)}>✕</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes actives en temps réel */}
        <div className="sec-card" style={{ marginBottom: 14 }}>
          <div className="sec-head"><div className="sec-title">⚡ Alertes actives</div></div>
          <div className="alert-body-sec">
            {hsCnt === 0 && (
              <div className="empty-state" style={{ padding: '30px 20px' }}>
                <div className="es-ico">✅</div>
                <p>Aucune alerte active — système nominal</p>
              </div>
            )}
            {cameras.filter(c => c.statut === 'HS').map(cam => (
              <div className="ch-item" key={cam.id}>
                <div className="ch-ico">❌</div>
                <div>
                  <div className="ch-nm" style={{ color: 'var(--red)' }}>{cam.nom} — Hors service</div>
                  <div className="ch-sub">{cam.ip} · {cam.derniere_verif}</div>
                </div>
                <span className="ch-st" style={{ background: 'rgba(232,25,44,.12)', color: 'var(--red)' }}>CRITIQUE</span>
              </div>
            ))}
            {cameras.filter(c => c.statut === 'Instable').map(cam => (
              <div className="ch-item" key={cam.id}>
                <div className="ch-ico">⚠️</div>
                <div>
                  <div className="ch-nm" style={{ color: 'var(--orange)' }}>{cam.nom} — Instable</div>
                  <div className="ch-sub">{cam.ip} · {cam.derniere_verif}</div>
                </div>
                <span className="ch-st" style={{ background: 'rgba(245,166,35,.12)', color: 'var(--orange)' }}>WARNING</span>
              </div>
            ))}
          </div>
        </div>

        {/* Résumé statut */}
        <div className="sec-card">
          <div className="sec-head"><div className="sec-title">📊 Résumé système</div></div>
          <div className="alert-body-sec">
            {[
              { label: 'Caméras actives',    val: stats.actif,    ico: '✅', color: 'var(--green)' },
              { label: 'Hors service',        val: stats.hs,       ico: '❌', color: 'var(--red)' },
              { label: 'Instables',           val: stats.instable, ico: '⚠️', color: 'var(--orange)' },
              { label: 'En maintenance',      val: stats.maint,    ico: '🔧', color: 'var(--purple)' },
              { label: 'Uptime global',       val: `${stats.uptime}%`, ico: '📈', color: 'var(--blue)' },
            ].map(item => (
              <div className="ch-item" key={item.label}>
                <div className="ch-ico">{item.ico}</div>
                <div className="ch-nm">{item.label}</div>
                <span className="ch-st ready" style={{ marginLeft: 'auto', color: item.color }}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="mo-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="mo-head"><div className="mo-title">+ Nouvelle règle</div><button className="mo-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="mo-body">
              <div className="fg"><label>Condition</label><input className="fc" placeholder="ex: Caméra = HS" value={form.cond} onChange={e => setForm(f => ({ ...f, cond: e.target.value }))} /></div>
              <div className="fg"><label>Action</label><input className="fc" placeholder="ex: Email + SMS" value={form.action} onChange={e => setForm(f => ({ ...f, action: e.target.value }))} /></div>
              <div className="fg"><label>Délai</label><input className="fc" placeholder="ex: Immédiat" value={form.delai} onChange={e => setForm(f => ({ ...f, delai: e.target.value }))} /></div>
            </div>
            <div className="mo-foot"><button className="btn" onClick={() => setShowModal(false)}>Annuler</button><button className="btn btn-primary" onClick={addRule}>Ajouter</button></div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
