// lib/data.js — Source de données centrale

export const CAMERAS = [
  { id: 1,  nom: "PORTE 4 EXT",                   ip: "192.168.254.2",  type: "Fixe",   statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 2,  nom: "PORTE 4 INT",                   ip: "192.168.254.7",  type: "Fixe",   statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 3,  nom: "PORTE 3 INT",                   ip: "192.168.254.6",  type: "Fixe",   statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 4,  nom: "PORTE 3 EXT",                   ip: "192.168.254.5",  type: "Fixe",   statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 5,  nom: "PORTE 1 INT",                   ip: "192.168.0.12",   type: "Fixe",   statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 6,  nom: "PTZ ROTATION PORTE ARRIERE",    ip: "192.168.0.14",   type: "Mobile", statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 7,  nom: "FIXE PTZ PORTE ARRIERE",        ip: "192.168.0.14",   type: "Mobile", statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 8,  nom: "PTZ ROTATION POSTE DE GARDE",   ip: "192.168.0.13",   type: "Mobile", statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 9,  nom: "PTZ FIXE POSTE DE GARDE",       ip: "192.168.0.13",   type: "Mobile", statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 10, nom: "PORTE 2 EXT",                   ip: "192.168.0.10",   type: "Fixe",   statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 11, nom: "PORTE 6 INT",                   ip: "192.168.0.9",    type: "Fixe",   statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 12, nom: "PORTE 1 EXT",                   ip: "192.168.0.11",   type: "Fixe",   statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 13, nom: "PTZ ROTATION INTERIEUR HANGAR", ip: "192.168.0.8",    type: "Mobile", statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 14, nom: "PTZ FIXE INTERIEUR HANGAR",     ip: "192.168.0.8",    type: "Mobile", statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 15, nom: "PORTE 5 INT",                   ip: "192.168.0.7",    type: "Fixe",   statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 16, nom: "PORTE 2 INT",                   ip: "192.168.0.5",    type: "Fixe",   statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 17, nom: "PORTE 5 EXT",                   ip: "192.168.0.4",    type: "Fixe",   statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 18, nom: "PORTE 6 EXT",                   ip: "192.168.0.3",    type: "Fixe",   statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 19, nom: "PTZ ROTATION DERRIERE HANGAR",  ip: "192.168.0.2",    type: "Mobile", statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 20, nom: "PTZ FIXE DERRIERE HANGAR",      ip: "192.168.0.2",    type: "Mobile", statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 21, nom: "CAM COUR ARRIERE",              ip: "192.168.0.15",   type: "Fixe",   statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 22, nom: "NVR-01",                        ip: "192.168.0.162",  type: "NVR",    statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
  { id: 23, nom: "NVR-02",                        ip: "192.168.0.199",  type: "NVR",    statut: "Actif",       derniere_verif: "28/04/2026", probleme: null },
]

export const ALERT_RULES = [
  { id: 1, cond: "Caméra = HS",        action: "Alerte critique Email + SMS", delai: "Immédiat" },
  { id: 2, cond: "Instable > 30min",   action: "Alerte warning Email",        delai: "30 min"   },
  { id: 3, cond: "Uptime < 80%",       action: "Rapport hebdo Email",         delai: "Hebdo"    },
  { id: 4, cond: "Perte NVR",          action: "SMS superviseur",             delai: "Immédiat" },
]

export const NVR_CFG = {
  host: process.env.NVR_PUBLIC_IP || "192.168.0.162",
  port: parseInt(process.env.NVR_PUBLIC_PORT || "80"),
  user: process.env.NVR_USER || "admin",
  pass: process.env.NVR_PASS || "Mbao@2024",
  path: "/ISAPI/System/status",
  timeout: 8000,
  retry: 30000,
}

export function getCamStats(cameras) {
  const cams = cameras.filter(c => c.type !== "NVR")
  const n = cams.length
  const actif = cams.filter(c => c.statut === "Actif").length
  const hs = cams.filter(c => c.statut === "HS").length
  const instable = cams.filter(c => c.statut === "Instable").length
  const maint = cams.filter(c => c.statut === "Maintenance").length
  const fixe = cams.filter(c => c.type === "Fixe").length
  const mobile = cams.filter(c => c.type === "Mobile").length
  const uptime = n > 0 ? Math.round(((actif + instable * 0.5) / n) * 100) : 0
  return { n, actif, hs, instable, maint, fixe, mobile, uptime }
}
