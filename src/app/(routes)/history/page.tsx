import HistoryView from '@/features/history/HistoryView'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Analysis History',
    description: 'Review your previous recorded performance analyses',
}

export default function HistoryPage() {
    return <HistoryView />
}
