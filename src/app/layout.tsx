import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Maranatha Inventario',
  description: 'Sistema de inventario para Suplidora Maranatha',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Maranatha',
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A63',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
