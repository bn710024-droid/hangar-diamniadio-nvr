export default function StatusBadge({ statut, type }) {
  if (type === 'NVR') return <span className="badge nvr">NVR</span>
  const cls = statut === 'Actif' ? 'actif' : statut === 'HS' ? 'hs' : statut === 'Instable' ? 'instable' : 'maintenance'
  return <span className={`badge ${cls}`}>{statut}</span>
}
