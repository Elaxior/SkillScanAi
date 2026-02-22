import SettingsView from '@/features/settings/SettingsView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Configure your SkillScan AI preferences and account settings',
}

export default function SettingsPage() {
  return <SettingsView />
}