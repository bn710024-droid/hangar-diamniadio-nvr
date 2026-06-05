import './globals.css'

export const metadata = {
  title: 'NVR Hangar Diamniadio — Dabakh',
  description: 'Dashboard de surveillance CCTV — Hangar Diamniadio',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
