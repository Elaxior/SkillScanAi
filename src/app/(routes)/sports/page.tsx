import SportsView from '@/features/sports/SportsView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Select Sport',
  description: 'Choose your sport for AI-powered performance analysis',
}

export default function SportsPage() {
  return <SportsView />
}