'use client'
import { useState } from 'react'
import AppShell from '@/components/AppShell'
import { useMaints, useCameras } from '@/lib/store'
import { getCamStats } from '@/lib/data'

export default function MaintenancePage() {
  const [cameras, setCameras] = useCameras()
  const [maints, setMaints] = useMaints()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ camId: '', tech: '', comment: '', date: '' })
  const stats = getCamStats(cameras)

  function save() {
    const cam = cameras.find(c => c.id === parseInt(form.camId))
    if (!cam) return
    setMaints([...maints, {
      id: Date.now(),
      camName: cam.nom,
      date: form.date || new Date().toLocaleDateString('fr-FR'),
      technicien: form.tech,
      commentaire: form.comment,
    }])
    setCameras(cameras.map(c => c.id === cam.id ? { ...c, statut: 'Maintenance' } : c))
    setShowModal(false)
    setForm({ camId: '', tech: '', comment: '', date: '' })
  }

  function terminer(id) {
    const m = maints.find(x => x.id === id)
    if (m) setCameras(cameras.map(c => c.nom === m.camName ? { ...c, statut: 'Actif', derniere_verif: new Date().toLocaleDateString('fr-FR') } : c))
    setMaints(maints.filter(x => x.id !== id))
  }

  return (
    <AppShell hsCnt={stats.hs + stats.instable}>
      <div className="content">
        <div className="sec-card">
          <div className="sec-head">
            <div className="sec-title">🔧 Interventions de maintenance</div>
            <button className="btn btn-purple btn-sm" onClick={() => setShowModal(true)}>+ Intervention</button>
          </div>

          <div className="inc-list">
            {maints.length === 0 && (
              <div className="empty-state"><div className="es-ico">🔧</div><p>Aucune intervention planifiée</p></div>
            )}
            {maints.map(m => (
              <div className="inc-item" key={m.id}>
                <div className="inc-ico">🔧</div>
                <div className="inc-body">
                  <div className="inc-nm">{m.camName}</div>
                  <div className="inc-desc">{m.commentaire || '—'}</div>
                  <div className="inc-meta">Technicien : {m.technicien || '—'} · {m.date}</div>
                </div>
                <div>
                  <button className="btn btn-sm" style={{ background: 'rgba(22,199,90,.12)', borderColor: 'rgba(22,199,90,.2)', color: 'var(--green)' }} onClick={() => terminer(m.id)}>
                    ✅ Terminé
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Caméras en maintenance */}
        {cameras.filter(c => c.statut === 'Maintenance').length > 0 && (
          <div className="sec-card" style={{ marginTop: 14 }}>
            <div className="sec-head"><div className="sec-title">📋 Caméras actuellement en maintenance</div></div>
            <div className="inc-list">
              {cameras.filter(c => c.statut === 'Maintenance').map(cam => (
                <div className="inc-item" key={cam.id}>
                  <div className="inc-ico">📸</div>
                  <div className="inc-body">
                    <div className="inc-nm">{cam.nom}</div>
                    <div className="inc-desc" style={{ fontFamily: 'var(--fm)', fontSize: 11 }}>{cam.ip}</div>
                  </div>
                  <button className="btn btn-sm" onClick={() => setCameras(cameras.map(c => c.id === cam.id ? { ...c, statut: 'Actif' } : c))}>
                    Remettre actif
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="mo-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="mo-head"><div className="mo-title">🔧 Nouvelle intervention</div><button className="mo-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="mo-body">
              <div className="fg">
                <label>Caméra</label>
                <select className="fc" value={form.camId} onChange={e => setForm(f => ({ ...f, camId: e.target.value }))}>
                  <option value="">— Sélectionner —</option>
                  {cameras.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>
              <div className="fg"><label>Technicien</label><input className="fc" placeholder="Nom du technicien" value={form.tech} onChange={e => setForm(f => ({ ...f, tech: e.target.value }))} /></div>
              <div className="fg"><label>Commentaire</label><textarea className="fc" placeholder="Description de l'intervention..." value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} /></div>
              <div className="fg"><label>Date planifiée</label><input className="fc" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></div>
            </div>
            <div className="mo-foot"><button className="btn" onClick={() => setShowModal(false)}>Annuler</button><button className="btn btn-purple" onClick={save}>Planifier</button></div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
