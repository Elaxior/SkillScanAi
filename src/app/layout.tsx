import type { Metadata } from 'next'
import './globals.css'
import NavBar from '@/components/layout/NavBar'

// ==========================================
// METADATA
// ==========================================

export const metadata: Metadata = {
  title: {
    default: 'SkillScan AI — Elite Performance Analysis',
    template: '%s | SkillScan AI',
  },
  description: 'AI-powered sports performance analysis platform. Precision scanned.',
  keywords: ['sports', 'AI', 'analysis', 'performance', 'biomechanics', 'training'],
}

// ==========================================
// ROOT LAYOUT
// ==========================================

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-text-primary antialiased overflow-x-hidden">
        <div className="fixed inset-0 -z-10 bg-[#080809]" />
        <div className="relative min-h-screen flex flex-col">
          <NavBar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-surface-border bg-background-secondary">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 bg-primary-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-black text-xs font-black">SS</span>
                    </div>
                    <span className="font-bold text-sm uppercase tracking-widest text-text-primary"
                          style={{ fontFamily: 'Barlow Condensed, sans-serif' }}>
                      SkillScan <span className="text-primary-500">AI</span>
                    </span>
                  </div>
                  <p className="text-xs text-text-tertiary leading-relaxed">
                    The elite standard in athletic telemetry and performance
                    forecasting. Engineered for data precision.
                  </p>
                </div>
                {[
                  { title: 'System Index', items: ['Core Engine', 'Data Lake', 'Scouting Bot', 'Security'] },
                  { title: 'Nodes', items: ['Los Angeles', 'London', 'Tokyo', 'Berlin'] },
                  { title: 'Protocol', items: ['API Keys', 'Changelog', 'Legal', 'Privacy'] },
                ].map(col => (
                  <div key={col.title}>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-500 mb-3"
                       style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      {col.title}
                    </p>
                    <ul className="space-y-2">
                      {col.items.map(item => (
                        <li key={item}>
                          <a href="#" className="text-xs text-text-secondary hover:text-primary-400 transition-colors uppercase tracking-wide">
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="border-t border-surface-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-text-tertiary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  © {new Date().getFullYear()} SKILLSCAN AI — SYSTEM V4.2 — INTERNAL BUILD
                </p>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-success-400 animate-blink" />
                  <span className="text-xs text-text-tertiary" style={{ fontFamily: 'JetBrains Mono, monospace' }}>NODE ACTIVE</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}