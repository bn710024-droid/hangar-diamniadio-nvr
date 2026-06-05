'use client'
import { useState } from 'react'
import AppShell from '@/components/AppShell'
import StatusBadge from '@/components/StatusBadge'
import { useCameras, useIncidents } from '@/lib/store'
import { getCamStats } from '@/lib/data'

export default function CamerasPage() {
  const [cameras, setCameras] = useCameras()
  const [incidents, setIncidents] = useIncidents()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [sortField, setSortField] = useState(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [viewMode, setViewMode] = useState('table')
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [deleteId, setDeleteId] = useState(null)
  const [maintId, setMaintId] = useState(null)
  const [maintForm, setMaintForm] = useState({ tech: '', comment: '', date: '' })

  const stats = getCamStats(cameras)
  const hsCnt = stats.hs + stats.instable

  let filtered = cameras.filter(c => {
    const q = search.toLowerCase()
    if (q && !c.nom.toLowerCase().includes(q) && !c.ip.includes(q) && !c.statut.toLowerCase().includes(q)) return false
    if (filter === 'actif' && c.statut !== 'Actif') return false
    if (filter === 'hs' && c.statut !== 'HS') return false
    if (filter === 'instable' && c.statut !== 'Instable') return false
    if (filter === 'maintenance' && c.statut !== 'Maintenance') return false
    if (filter === 'fixe' && c.type !== 'Fixe') return false
    if (filter === 'mobile' && c.type !== 'Mobile') return false
    if (filter === 'nvr' && c.type !== 'NVR') return false
    return true
  })
  if (sortField) {
    filtered = [...filtered].sort((a, b) => {
      const va = a[sortField]?.toLowerCase?.() ?? a[sortField]
      const vb = b[sortField]?.toLowerCase?.() ?? b[sortField]
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
    })
  }

  function toggleSort(field) {
    if (sortField === field) setSortAsc(v => !v)
    else { setSortField(field); setSortAsc(true) }
  }

  function openEdit(cam) { setEditId(cam.id); setEditForm({ nom: cam.nom, ip: cam.ip, statut: cam.statut }) }
  function saveEdit() {
    setCameras(cameras.map(c => c.id === editId ? { ...c, ...editForm } : c))
    setEditId(null)
  }
  function confirmDel() {
    const cam = cameras.find(c => c.id === deleteId)
    setIncidents(prev => [...prev, {
      id: Date.now(), camName: cam?.nom || '—', date: new Date().toLocaleString('fr-FR'),
      description: 'Caméra supprimée du système', statut: 'Résolu'
    }])
    setCameras(cameras.filter(c => c.id !== deleteId))
    setDeleteId(null)
  }
  function saveMaint() {
    const cam = cameras.find(c => c.id === maintId)
    setCameras(cameras.map(c => c.id === maintId ? { ...c, statut: 'Maintenance' } : c))
    import('@/lib/store').then(m => {
      const stored = JSON.parse(localStorage.getItem('dabakh_maints') || '[]')
      stored.push({ id: Date.now(), camName: cam?.nom || '—', date: maintForm.date || new Date().toLocaleDateString('fr-FR'), technicien: maintForm.tech, commentaire: maintForm.comment })
      localStorage.setItem('dabakh_maints', JSON.stringify(stored))
      window.dispatchEvent(new Event('dabakh_maints_changed'))
    })
    setMaintId(null); setMaintForm({ tech: '', comment: '', date: '' })
  }

  const camIco = (type) => type === 'NVR' ? '🖥️' : type === 'Mobile' ? '🔄' : '📸'

  return (
    <AppShell hsCnt={hsCnt}>
      <div className="content">
        {/* Toolbar */}
        <div className="sec-card">
          <div className="toolbar">
            <div className="search-box" style={{ flex: 1 }}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" width="14" height="14" style={{ color: 'var(--muted)', flexShrink: 0 }}><circle cx="7" cy="7" r="4.5"/><line x1="11" y1="11" x2="15" y2="15"/></svg>
              <input placeholder="Rechercher nom, IP, statut..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="filter-sel" value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="all">Tous ({cameras.length})</option>
              <option value="actif">Actif ({stats.actif})</option>
              <option value="hs">HS ({stats.hs})</option>
              <option value="instable">Instable ({stats.instable})</option>
              <option value="maintenance">Maintenance ({stats.maint})</option>
              <option value="fixe">Fixe ({stats.fixe})</option>
              <option value="mobile">Mobile ({stats.mobile})</option>
              <option value="nvr">NVR</option>
            </select>
            <div className="view-toggle">
              <div className={`vt-btn${viewMode === 'table' ? ' active' : ''}`} onClick={() => setViewMode('table')} title="Tableau">
                <svg viewBox="0 0 14 14" fill="currentColor" width="13" height="13"><rect x="0" y="0" width="4" height="4"/><rect x="5" y="0" width="9" height="4"/><rect x="0" y="5" width="4" height="4"/><rect x="5" y="5" width="9" height="4"/><rect x="0" y="10" width="4" height="4"/><rect x="5" y="10" width="9" height="4"/></svg>
              </div>
              <div className={`vt-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')} title="Grille">
                <svg viewBox="0 0 14 14" fill="currentColor" width="13" height="13"><rect x="0" y="0" width="6" height="6"/><rect x="8" y="0" width="6" height="6"/><rect x="0" y="8" width="6" height="6"/><rect x="8" y="8" width="6" height="6"/></svg>
              </div>
            </div>
          </div>

          {/* TABLE */}
          {viewMode === 'table' && (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th onClick={() => toggleSort('nom')}>Nom {sortField==='nom' ? (sortAsc?'▲':'▼') : ''}</th>
                    <th onClick={() => toggleSort('ip')}>IP</th>
                    <th onClick={() => toggleSort('type')}>Type</th>
                    <th onClick={() => toggleSort('statut')}>Statut</th>
                    <th>Dernière vérif.</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(cam => (
                    <tr key={cam.id}>
                      <td className="col-nom">{camIco(cam.type)} {cam.nom}</td>
                      <td className="col-ip">{cam.ip}</td>
                      <td><span style={{ fontSize: 11, color: 'var(--muted2)' }}>{cam.type}</span></td>
                      <td><StatusBadge statut={cam.statut} type={cam.type} /></td>
                      <td style={{ fontFamily: 'var(--fm)', fontSize: 11, color: 'var(--muted)' }}>{cam.derniere_verif}</td>
                      <td>
                        <div className="col-act">
                          <div className="icon-btn" title="Modifier" onClick={() => openEdit(cam)}>✏️</div>
                          <div className="icon-btn purple" title="Maintenance" onClick={() => { setMaintId(cam.id); setMaintForm({ tech: '', comment: '', date: '' }) }}>🔧</div>
                          <div className="icon-btn danger" title="Supprimer" onClick={() => setDeleteId(cam.id)}>🗑️</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="empty-state"><div className="es-ico">🔍</div><p>Aucun résultat</p></div>
              )}
            </div>
          )}

          {/* GRID */}
          {viewMode === 'grid' && (
            <div className="cam-grid">
              {filtered.map(cam => (
                <div key={cam.id} className={`cam-card ${cam.statut === 'HS' ? 'hs' : cam.statut === 'Instable' ? 'instable' : ''}`}>
                  <div className="cc-top">
                    <div style={{ fontSize: 22 }}>{camIco(cam.type)}</div>
                    <StatusBadge statut={cam.statut} type={cam.type} />
                  </div>
                  <div className="cc-nom">{cam.nom}</div>
                  <div className="cc-ip">{cam.ip}</div>
                  <div className="cc-foot">
                    <span className="cc-type">{cam.type}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <div className="icon-btn" style={{ width: 24, height: 24, fontSize: 11 }} onClick={() => openEdit(cam)}>✏️</div>
                      <div className="icon-btn purple" style={{ width: 24, height: 24, fontSize: 11 }} onClick={() => { setMaintId(cam.id); setMaintForm({ tech: '', comment: '', date: '' }) }}>🔧</div>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}><div className="es-ico">🔍</div><p>Aucun résultat</p></div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL EDIT */}
      {editId !== null && (
        <div className="mo-overlay" onClick={e => e.target === e.currentTarget && setEditId(null)}>
          <div className="modal">
            <div className="mo-head"><div className="mo-title">✏️ Modifier caméra</div><button className="mo-close" onClick={() => setEditId(null)}>✕</button></div>
            <div className="mo-body">
              <div className="fg"><label>Nom</label><input className="fc" value={editForm.nom} onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} /></div>
              <div className="fg"><label>IP</label><input className="fc" value={editForm.ip} style={{ fontFamily: 'var(--fm)' }} onChange={e => setEditForm(f => ({ ...f, ip: e.target.value }))} /></div>
              <div className="fg"><label>Statut</label>
                <select className="fc" value={editForm.statut} onChange={e => setEditForm(f => ({ ...f, statut: e.target.value }))}>
                  <option>Actif</option><option>HS</option><option>Instable</option><option>Maintenance</option>
                </select>
              </div>
            </div>
            <div className="mo-foot"><button className="btn" onClick={() => setEditId(null)}>Annuler</button><button className="btn btn-primary" onClick={saveEdit}>Enregistrer</button></div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {deleteId !== null && (
        <div className="mo-overlay" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal">
            <div className="mo-head"><div className="mo-title">🗑️ Supprimer</div><button className="mo-close" onClick={() => setDeleteId(null)}>✕</button></div>
            <div className="mo-body">
              <p style={{ color: 'var(--muted2)' }}>Supprimer <strong style={{ color: 'var(--text)' }}>{cameras.find(c => c.id === deleteId)?.nom}</strong> ?</p>
              <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 8 }}>⚠️ Action irréversible.</p>
            </div>
            <div className="mo-foot"><button className="btn" onClick={() => setDeleteId(null)}>Annuler</button><button className="btn btn-danger" onClick={confirmDel}>Supprimer</button></div>
          </div>
        </div>
      )}

      {/* MODAL MAINTENANCE */}
      {maintId !== null && (
        <div className="mo-overlay" onClick={e => e.target === e.currentTarget && setMaintId(null)}>
          <div className="modal">
            <div className="mo-head"><div className="mo-title">🔧 Maintenance</div><button className="mo-close" onClick={() => setMaintId(null)}>✕</button></div>
            <div className="mo-body">
              <div className="fg"><label>Caméra</label><input className="fc" value={cameras.find(c => c.id === maintId)?.nom || ''} readOnly /></div>
              <div className="fg"><label>Technicien</label><input className="fc" placeholder="Nom du technicien" value={maintForm.tech} onChange={e => setMaintForm(f => ({ ...f, tech: e.target.value }))} /></div>
              <div className="fg"><label>Commentaire</label><textarea className="fc" placeholder="Décrire l'intervention..." value={maintForm.comment} onChange={e => setMaintForm(f => ({ ...f, comment: e.target.value }))} /></div>
              <div className="fg"><label>Date</label><input className="fc" type="date" value={maintForm.date} onChange={e => setMaintForm(f => ({ ...f, date: e.target.value }))} /></div>
            </div>
            <div className="mo-foot"><button className="btn" onClick={() => setMaintId(null)}>Annuler</button><button className="btn btn-purple" onClick={saveMaint}>Activer maintenance</button></div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
