/**
 * Camera Route Page
 * 
 * Renders the camera preview view.
 * Stream automatically starts and stops based on route.
 */

import { Metadata } from 'next'
import { CameraView } from '@/features/camera'

export const metadata: Metadata = {
  title: 'Camera Preview',
  description: 'Preview and configure your camera for sports analysis',
}

export default function CameraPage() {
  return <CameraView />
}