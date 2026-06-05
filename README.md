# 📹 NVR Hangar Diamniadio — Dashboard Next.js

Dashboard de surveillance CCTV professionnel pour le Hangar de Diamniadio, connecté au NVR Hikvision DS-7632NXI-K2/16P via ISAPI Digest Auth.

## Pages

| Route | Description |
|---|---|
| `/dashboard` | Vue d'ensemble — KPIs, charts uptime, statut NVR |
| `/cameras` | Liste des 21 caméras — table/grille, filtres, CRUD |
| `/incidents` | Journal des incidents — création, suivi, statut |
| `/maintenance` | Interventions planifiées — technicien, dates |
| `/alertes` | Règles d'alerte + alertes actives temps réel |
| `/nvr` | Debug NVR — connexion Digest Auth, logs live |
| `/rapports` | Exports .txt / .csv, résumé, reset données |

## Installation

```bash
npm install
cp .env.example .env.local
# Éditer .env.local avec ton IP publique + credentials NVR
npm run dev
```

## Variables d'environnement

```
NVR_PUBLIC_IP=TON_IP_PUBLIQUE
NVR_PUBLIC_PORT=8080
NVR_USER=admin
NVR_PASS=Mbao@2024
```

## Architecture

- **Next.js 14** App Router — 100% Server + Client Components
- **Chart.js / react-chartjs-2** — graphiques uptime, donut, line
- **localStorage** — persistance des caméras, incidents, maintenances
- **API Route `/api/nvr`** — proxy Digest Auth MD5 côté serveur
- **CSS Variables** — thème dark industriel Dabakh

## Proxy NVR (Vercel)

L'API `/api/nvr` effectue :
1. GET `/ISAPI/System/status` → reçoit défi Digest 401
2. Calcule MD5 Digest Auth côté serveur
3. Renvoie la requête authentifiée
4. Retourne `{ok: true}` ou l'erreur

## Caméras configurées (21)

| # | Nom | IP | Type |
|---|---|---|---|
| 1 | PORTE 4 EXT | 192.168.254.2 | Fixe |
| 2 | PORTE 4 INT | 192.168.254.7 | Fixe |
| ... | ... | ... | ... |
| 21 | CAM COUR ARRIERE | 192.168.0.15 | Fixe |
| 22 | NVR-01 | 192.168.0.162 | NVR |
| 23 | NVR-02 | 192.168.0.199 | NVR |
