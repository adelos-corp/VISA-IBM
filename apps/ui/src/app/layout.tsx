import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'VISA — Web Deployment Platform',
  description: 'Fast, Approved, Auto-Correctible Web Deployment Platform powered by IBM Bob 2.0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{<Navbar />}{children}</body>
    </html>
  )
}
