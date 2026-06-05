'use client'
import AppShell from '@/components/AppShell'
import { useCameras, useIncidents, useMaints, resetCameras } from '@/lib/store'
import { getCamStats } from '@/lib/data'

export default function RapportsPage() {
  const [cameras] = useCameras()
  const [incidents] = useIncidents()
  const [maints] = useMaints()
  const stats = getCamStats(cameras)

  function exportStatut() {
    const rows = cameras.map(c => `${c.nom}\t${c.ip}\t${c.statut}\t${c.type}\t${c.derniere_verif}`).join('\n')
    const txt = `RAPPORT STATUT — HANGAR DIAMNIADIO\n${new Date().toLocaleString('fr-FR')}\n\n${rows}`
    dl(txt, `cams_statut_${Date.now()}.txt`)
  }

  function exportIncidents() {
    const rows = incidents.map(i => `${i.camName}\t${i.date}\t${i.description}\t${i.statut}`).join('\n')
    const txt = `INCIDENTS — HANGAR DIAMNIADIO\n${new Date().toLocaleString('fr-FR')}\n\n${rows || 'Aucun incident'}`
    dl(txt, `incidents_${Date.now()}.txt`)
  }

  function exportMaint() {
    const rows = maints.map(m => `${m.camName}\t${m.date}\t${m.technicien}\t${m.commentaire}`).join('\n')
    const txt = `MAINTENANCE — HANGAR DIAMNIADIO\n${new Date().toLocaleString('fr-FR')}\n\n${rows || 'Aucune intervention'}`
    dl(txt, `maintenance_${Date.now()}.txt`)
  }

  function exportCSV() {
    const headers = 'ID,Nom,IP,Type,Statut,Dernière vérif,Problème'
    const rows = cameras.map(c => `${c.id},"${c.nom}",${c.ip},${c.type},${c.statut},${c.derniere_verif},"${c.probleme || ''}"`)
    dl([headers, ...rows].join('\n'), `cameras_${Date.now()}.csv`)
  }

  function dl(content, filename) {
    const a = document.createElement('a')
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
    a.download = filename
    a.click()
  }

  const now = new Date()
  const summary = [
    `📅 Date : ${now.toLocaleDateString('fr-FR')} ${now.toLocaleTimeString('fr-FR')}`,
    `📹 Total caméras : ${stats.n}`,
    `✅ Actives : ${stats.actif} (${Math.round(stats.actif/stats.n*100)}%)`,
    `❌ Hors service : ${stats.hs}`,
    `⚠️ Instables : ${stats.instable}`,
    `🔧 En maintenance : ${stats.maint}`,
    `📈 Uptime global estimé : ${stats.uptime}%`,
    `🚨 Incidents enregistrés : ${incidents.length}`,
    `🔧 Interventions : ${maints.length}`,
  ]

  return (
    <AppShell hsCnt={stats.hs + stats.instable}>
      <div className="content">
        <div className="sec-card" style={{ marginBottom: 14 }}>
          <div className="sec-head"><div className="sec-title">📊 Exports</div></div>
          <div className="alert-body-sec">
            <div className="ch-item">
              <div className="ch-ico">📋</div>
              <div><div className="ch-nm">Rapport statut caméras</div><div className="ch-sub">État actuel de toutes les caméras ({cameras.length})</div></div>
              <button className="btn btn-primary btn-sm" onClick={exportStatut}>Export .txt</button>
            </div>
            <div className="ch-item">
              <div className="ch-ico">📊</div>
              <div><div className="ch-nm">Export CSV caméras</div><div className="ch-sub">Format tableur — Excel / Google Sheets</div></div>
              <button className="btn btn-primary btn-sm" onClick={exportCSV}>Export .csv</button>
            </div>
            <div className="ch-item">
              <div className="ch-ico">🚨</div>
              <div><div className="ch-nm">Rapport incidents</div><div className="ch-sub">{incidents.length} incident(s) enregistré(s)</div></div>
              <button className="btn btn-sm" onClick={exportIncidents}>Export .txt</button>
            </div>
            <div className="ch-item">
              <div className="ch-ico">🔧</div>
              <div><div className="ch-nm">Rapport maintenance</div><div className="ch-sub">{maints.length} intervention(s)</div></div>
              <button className="btn btn-sm" onClick={exportMaint}>Export .txt</button>
            </div>
            <div className="ch-item">
              <div className="ch-ico">🖨️</div>
              <div><div className="ch-nm">Impression PDF</div><div className="ch-sub">Imprimer cette page via le navigateur</div></div>
              <button className="btn btn-sm" onClick={() => window.print()}>Imprimer</button>
            </div>
          </div>
        </div>

        <div className="sec-card" style={{ marginBottom: 14 }}>
          <div className="sec-head"><div className="sec-title">📅 Résumé du jour</div></div>
          <div className="rapport-summary">
            {summary.map((line, i) => <div key={i}>{line}</div>)}
          </div>
        </div>

        <div className="sec-card">
          <div className="sec-head"><div className="sec-title">⚙️ Outils système</div></div>
          <div className="alert-body-sec">
            <div className="ch-item">
              <div className="ch-ico">🔄</div>
              <div><div className="ch-nm">Réinitialiser les données caméras</div><div className="ch-sub">Revenir aux données initiales (toutes actives)</div></div>
              <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Réinitialiser les données ?')) resetCameras() }}>Reset</button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
