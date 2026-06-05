'use client'
import { useState } from 'react'
import AppShell from '@/components/AppShell'
import { useIncidents, useCameras } from '@/lib/store'
import { getCamStats } from '@/lib/data'

const STATUTS = ['Ouvert', 'En cours', 'Résolu']

export default function IncidentsPage() {
  const [cameras] = useCameras()
  const [incidents, setIncidents] = useIncidents()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ camName: '', description: '', statut: 'Ouvert' })
  const [filter, setFilter] = useState('all')
  const stats = getCamStats(cameras)

  const filtered = filter === 'all' ? incidents : incidents.filter(i => i.statut.toLowerCase() === filter)

  function addIncident() {
    if (!form.camName || !form.description) return
    setIncidents([...incidents, {
      id: Date.now(),
      camName: form.camName,
      date: new Date().toLocaleString('fr-FR'),
      description: form.description,
      statut: form.statut,
    }])
    setShowModal(false)
    setForm({ camName: '', description: '', statut: 'Ouvert' })
  }

  function updateStatut(id, statut) {
    setIncidents(incidents.map(i => i.id === id ? { ...i, statut } : i))
  }

  function deleteInc(id) {
    setIncidents(incidents.filter(i => i.id !== id))
  }

  const statico = s => s === 'Ouvert' ? '🔴' : s === 'En cours' ? '🟡' : '🟢'

  return (
    <AppShell hsCnt={stats.hs + stats.instable}>
      <div className="content">
        <div className="sec-card">
          <div className="sec-head">
            <div className="sec-title">🚨 Journal des incidents</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="filter-sel" value={filter} onChange={e => setFilter(e.target.value)}>
                <option value="all">Tous ({incidents.length})</option>
                <option value="ouvert">Ouvert</option>
                <option value="en cours">En cours</option>
                <option value="résolu">Résolu</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Incident</button>
            </div>
          </div>

          <div className="inc-list">
            {filtered.length === 0 && (
              <div className="empty-state"><div className="es-ico">✅</div><p>Aucun incident enregistré</p></div>
            )}
            {filtered.map(inc => (
              <div className="inc-item" key={inc.id}>
                <div className="inc-ico">{statico(inc.statut)}</div>
                <div className="inc-body">
                  <div className="inc-nm">{inc.camName}</div>
                  <div className="inc-desc">{inc.description}</div>
                  <div className="inc-meta">{inc.date}</div>
                </div>
                <div className="inc-st" style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
                  <select
                    className="filter-sel"
                    style={{ fontSize: 10, padding: '3px 6px' }}
                    value={inc.statut}
                    onChange={e => updateStatut(inc.id, e.target.value)}
                  >
                    {STATUTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <div className="icon-btn danger" style={{ width: 22, height: 22, fontSize: 11 }} onClick={() => deleteInc(inc.id)}>✕</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="mo-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="mo-head"><div className="mo-title">🚨 Nouvel incident</div><button className="mo-close" onClick={() => setShowModal(false)}>✕</button></div>
            <div className="mo-body">
              <div className="fg">
                <label>Caméra</label>
                <select className="fc" value={form.camName} onChange={e => setForm(f => ({ ...f, camName: e.target.value }))}>
                  <option value="">— Sélectionner —</option>
                  {cameras.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
                </select>
              </div>
              <div className="fg"><label>Description</label><textarea className="fc" placeholder="Décrire l'incident..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
              <div className="fg">
                <label>Statut initial</label>
                <select className="fc" value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}>
                  {STATUTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mo-foot"><button className="btn" onClick={() => setShowModal(false)}>Annuler</button><button className="btn btn-primary" onClick={addIncident}>Enregistrer</button></div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
