'use client'

import React, { useCallback, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Button,
  Card,
  CardTitle,
  Badge,
  SectionHeader,
  PageContainer,
} from '@/components'
import { StoreHydration } from '@/components/providers'
import { useUserStore, useSessionStore, useAppStore } from '@/store'
import { HeightUnit, SkillLevel, formatHeight, isValidHeight, Sport, SPORTS_CONFIG } from '@/types'

// ==========================================
// SETTINGS VIEW COMPONENT
// ==========================================

export default function SettingsView() {
  return (
    <PageContainer>
      {/* Back navigation */}
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            ← Back to Home
          </Button>
        </Link>
      </div>

      {/* Page header */}
      <SectionHeader
        title="Settings"
        subtitle="Configure your SkillScan AI preferences"
        accent
        accentColor="accent"
        className="mb-8"
      />

      <StoreHydration fallback={<SettingsSkeleton />}>
        <div className="max-w-2xl space-y-6">
          {/* Profile Settings */}
          <ProfileSettings />

          {/* Sport Preferences */}
          <SportPreferences />

          {/* App Settings */}
          <AppSettings />

          {/* Session Management */}
          <SessionManagement />

          {/* Debug Info */}
          <DebugInfo />
        </div>
      </StoreHydration>
    </PageContainer>
  )
}

// ==========================================
// PROFILE SETTINGS
// ==========================================

function ProfileSettings() {
  const height = useUserStore((state) => state.height)
  const heightUnit = useUserStore((state) => state.heightUnit)
  const setHeight = useUserStore((state) => state.setHeight)
  const setHeightUnit = useUserStore((state) => state.setHeightUnit)
  const skillLevel = useUserStore((state) => state.skillLevel)
  const setSkillLevel = useUserStore((state) => state.setSkillLevel)

  // Local state for input
  const [inputValue, setInputValue] = useState<string>(
    height !== null ? String(height) : ''
  )
  const [error, setError] = useState<string | null>(null)

  // Sync input with store
  useEffect(() => {
    setInputValue(height !== null ? String(height) : '')
  }, [height])

  // Handle height input change
  const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setError(null)
  }, [])

  // Handle height save
  const handleHeightSave = useCallback(() => {
    const numValue = parseFloat(inputValue)
    
    if (isNaN(numValue)) {
      setError('Please enter a valid number')
      return
    }

    if (!isValidHeight(numValue, heightUnit)) {
      setError(
        heightUnit === 'cm'
          ? 'Height must be between 100-250 cm'
          : 'Height must be between 39-98 inches'
      )
      return
    }

    console.log('[Settings] Saving height:', numValue, heightUnit)
    setHeight(numValue)
    setError(null)
  }, [inputValue, heightUnit, setHeight])

  // Handle unit change
  const handleUnitChange = useCallback((unit: HeightUnit) => {
    console.log('[Settings] Changing unit to:', unit)
    setHeightUnit(unit)
  }, [setHeightUnit])

  return (
    <Card variant="default" padding="lg">
      <CardTitle className="flex items-center gap-2 mb-6">
        <span>👤</span>
        Profile Settings
      </CardTitle>

      <div className="space-y-6">
        {/* Height Input */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Your Height
          </label>
          <p className="text-xs text-text-tertiary mb-3">
            Used to calibrate measurements during analysis
          </p>
          
          <div className="flex gap-3">
            {/* Unit Toggle */}
            <div className="flex bg-surface rounded-lg p-1">
              {(['cm', 'inches'] as HeightUnit[]).map((unit) => (
                <button
                  key={unit}
                  onClick={() => handleUnitChange(unit)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    heightUnit === unit
                      ? 'bg-primary-500 text-white'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {unit}
                </button>
              ))}
            </div>

            {/* Input */}
            <input
              type="number"
              value={inputValue}
              onChange={handleHeightChange}
              placeholder={heightUnit === 'cm' ? '175' : '69'}
              className={`flex-1 px-4 py-2 bg-surface border rounded-lg text-text-primary focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                error ? 'border-danger-500' : 'border-surface-border'
              }`}
            />

            {/* Save Button */}
            <Button onClick={handleHeightSave} variant="primary" size="md">
              Save
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-danger-400 mt-2">{error}</p>
          )}

          {/* Current Value */}
          {height !== null && (
            <p className="text-sm text-success-400 mt-2">
              ✓ Saved: {formatHeight(height, heightUnit)}
            </p>
          )}
        </div>

        {/* Skill Level */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Skill Level
          </label>
          <p className="text-xs text-text-tertiary mb-3">
            Helps us compare your performance to similar athletes
          </p>
          
          <div className="flex flex-wrap gap-2">
            {Object.values(SkillLevel).map((level) => (
              <button
                key={level}
                onClick={() => {
                  console.log('[Settings] Setting skill level:', level)
                  setSkillLevel(level)
                }}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                  skillLevel === level
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface text-text-secondary hover:bg-surface-light'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

// ==========================================
// SPORT PREFERENCES
// ==========================================

function SportPreferences() {
  const selectedSport = useUserStore((state) => state.selectedSport)
  const selectedAction = useUserStore((state) => state.selectedAction)
  const setSport = useUserStore((state) => state.setSport)
  const setAction = useUserStore((state) => state.setAction)

  const allSports = Object.values(SPORTS_CONFIG)

  return (
    <Card variant="default" padding="lg">
      <CardTitle className="flex items-center gap-2 mb-6">
        <span>🏆</span>
        Sport Preferences
      </CardTitle>

      <div className="space-y-4">
        {/* Current Selection */}
        <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
          <div>
            <p className="text-sm text-text-secondary">Current Selection</p>
            <p className="text-text-primary font-medium">
              {selectedSport ? (
                <>
                  {SPORTS_CONFIG[selectedSport]?.icon}{' '}
                  {SPORTS_CONFIG[selectedSport]?.name}
                  {selectedAction && ` → ${selectedAction}`}
                </>
              ) : (
                <span className="text-text-tertiary">None</span>
              )}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSport(null)
              setAction(null)
            }}
            disabled={!selectedSport}
          >
            Clear
          </Button>
        </div>

        {/* Quick Select */}
        <div>
          <p className="text-sm text-text-secondary mb-3">Quick Select</p>
          <div className="flex flex-wrap gap-2">
            {allSports.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSport(sport.id)}
                className={`p-2 rounded-lg transition-all ${
                  selectedSport === sport.id
                    ? 'bg-primary-500/20 ring-2 ring-primary-500'
                    : 'bg-surface hover:bg-surface-light'
                }`}
              >
                <span className="text-xl">{sport.icon}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

// ==========================================
// APP SETTINGS
// ==========================================

function AppSettings() {
  const preferences = useUserStore((state) => state.preferences)
  const setPreference = useUserStore((state) => state.setPreference)
  const resetPreferences = useUserStore((state) => state.resetPreferences)

  // Toggle component
  const Toggle = ({ 
    enabled, 
    onChange,
    label,
    description,
  }: { 
    enabled: boolean
    onChange: (value: boolean) => void
    label: string
    description?: string
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        {description && (
          <p className="text-xs text-text-tertiary">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-primary-500' : 'bg-surface-lighter'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )

  return (
    <Card variant="default" padding="lg">
      <div className="flex items-center justify-between mb-6">
        <CardTitle className="flex items-center gap-2">
          <span>⚙️</span>
          App Settings
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={resetPreferences}>
          Reset
        </Button>
      </div>

      <div className="divide-y divide-surface-border">
        <Toggle
          enabled={preferences.soundEnabled}
          onChange={(value) => setPreference('soundEnabled', value)}
          label="Sound Effects"
          description="Play sounds for events and feedback"
        />
        
        <Toggle
          enabled={preferences.showSkeleton}
          onChange={(value) => setPreference('showSkeleton', value)}
          label="Skeleton Overlay"
          description="Show pose skeleton on video"
        />
        
        <Toggle
          enabled={preferences.autoRecord}
          onChange={(value) => setPreference('autoRecord', value)}
          label="Auto Record"
          description="Start recording after countdown"
        />
        
        <Toggle
          enabled={preferences.saveRecordings}
          onChange={(value) => setPreference('saveRecordings', value)}
          label="Save Recordings"
          description="Keep recordings on device"
        />

        {/* Video Quality */}
        <div className="py-3">
          <p className="text-sm font-medium text-text-primary mb-1">Video Quality</p>
          <p className="text-xs text-text-tertiary mb-3">Higher quality uses more storage</p>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map((quality) => (
              <button
                key={quality}
                onClick={() => setPreference('videoQuality', quality)}
                className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                  preferences.videoQuality === quality
                    ? 'bg-primary-500 text-white'
                    : 'bg-surface text-text-secondary hover:bg-surface-light'
                }`}
              >
                {quality}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

// ==========================================
// SESSION MANAGEMENT
// ==========================================

function SessionManagement() {
  const sessionStatus = useSessionStore((state) => state.status)
  const hasVideo = useSessionStore((state) => state.hasVideo)
  const score = useSessionStore((state) => state.score)
  const resetSession = useSessionStore((state) => state.resetSession)

  const handleResetSession = useCallback(() => {
    console.log('[Settings] Resetting session')
    resetSession()
  }, [resetSession])

  return (
    <Card variant="default" padding="lg">
      <CardTitle className="flex items-center gap-2 mb-6">
        <span>📹</span>
        Session Management
      </CardTitle>

      <div className="space-y-4">
        {/* Current Session Status */}
        <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
          <div>
            <p className="text-sm text-text-secondary">Current Session</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={
                  sessionStatus === 'complete' ? 'success' :
                  sessionStatus === 'error' ? 'danger' :
                  sessionStatus === 'idle' ? 'default' : 'primary'
                }
                size="sm"
              >
                {sessionStatus}
              </Badge>
              {hasVideo && (
                <Badge variant="accent" size="sm">Has Video</Badge>
              )}
              {score !== null && (
                <Badge variant="success" size="sm">Score: {score}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
          <div>
            <p className="text-sm font-medium text-text-primary">Reset Session</p>
            <p className="text-xs text-text-tertiary">
              Clear current recording and analysis data
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleResetSession}
            disabled={sessionStatus === 'idle' && !hasVideo}
          >
            Reset
          </Button>
        </div>
      </div>
    </Card>
  )
}

// ==========================================
// DEBUG INFO
// ==========================================

function DebugInfo() {
  const userState = useUserStore()
  const sessionState = useSessionStore()
  const appState = useAppStore()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card variant="default" padding="lg">
      <CardTitle className="flex items-center gap-2 mb-4">
        <span>🔧</span>
        Debug Info
      </CardTitle>

      <div className="space-y-4">
        {/* User Store */}
        <div>
          <p className="text-xs font-semibold text-primary-400 mb-2">User Store</p>
          <pre className="text-xs text-text-tertiary bg-background p-3 rounded-lg overflow-auto max-h-32">
            {JSON.stringify({
              height: userState.height,
              heightUnit: userState.heightUnit,
              selectedSport: userState.selectedSport,
              selectedAction: userState.selectedAction,
              skillLevel: userState.skillLevel,
            }, null, 2)}
          </pre>
        </div>

        {/* Session Store */}
        <div>
          <p className="text-xs font-semibold text-accent-400 mb-2">Session Store</p>
          <pre className="text-xs text-text-tertiary bg-background p-3 rounded-lg overflow-auto max-h-32">
            {JSON.stringify({
              status: sessionState.status,
              hasVideo: sessionState.hasVideo,
              score: sessionState.score,
              flawsCount: sessionState.flaws.length,
              landmarksCount: sessionState.landmarks.length,
            }, null, 2)}
          </pre>
        </div>

        {/* App Store */}
        <div>
          <p className="text-xs font-semibold text-success-400 mb-2">App Store</p>
          <pre className="text-xs text-text-tertiary bg-background p-3 rounded-lg overflow-auto max-h-32">
            {JSON.stringify({
              isLoading: appState.isLoading,
              theme: appState.theme,
              isDebugMode: appState.isDebugMode,
              toastCount: appState.toasts.length,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </Card>
  )
}

// ==========================================
// SKELETON
// ==========================================

function SettingsSkeleton() {
  return (
    <div className="max-w-2xl space-y-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} variant="default" padding="lg" className="animate-pulse">
          <div className="h-6 bg-surface-light rounded w-40 mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-surface-light rounded" />
            <div className="h-10 bg-surface-light rounded" />
          </div>
        </Card>
      ))}
    </div>
  )
}