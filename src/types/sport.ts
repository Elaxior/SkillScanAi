/**
 * Sport Types for SkillScan AI
 * 
 * These types define all supported sports and their associated actions.
 * Strong typing here prevents bugs when AI models expect specific sport/action combinations.
 */

// ==========================================
// SPORT ENUM
// ==========================================

/**
 * Supported sports for AI analysis
 * Each sport has specific biomechanical models and metrics
 */
export enum Sport {
  BASKETBALL = 'basketball',
  BADMINTON = 'badminton',
  VOLLEYBALL = 'volleyball',
  CRICKET = 'cricket',
  TABLE_TENNIS = 'table_tennis',
}

// ==========================================
// SPORT METADATA
// ==========================================

/**
 * Display information for each sport
 */
export interface SportInfo {
  id: Sport
  name: string
  icon: string
  description: string
  color: string
  actions: SportAction[]
}

/**
 * Action/technique that can be analyzed for a sport
 */
export interface SportAction {
  id: string
  name: string
  description: string
  /** Key body parts involved in this action */
  keyPoints: string[]
  /** Expected duration range in seconds */
  durationRange: [number, number]
}

// ==========================================
// SPORT CONFIGURATION
// ==========================================

/**
 * Complete configuration for all supported sports
 * This is the source of truth for available sports and actions
 */
export const SPORTS_CONFIG: Record<Sport, SportInfo> = {
  [Sport.BASKETBALL]: {
    id: Sport.BASKETBALL,
    name: 'Basketball',
    icon: '🏀',
    description: 'Analyze shooting form, dribbling, and defensive stance',
    color: '#f97316', // Orange
    actions: [
      {
        id: 'jump_shot',
        name: 'Jump Shot',
        description: 'Analyze your shooting form and release point',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip', 'knee', 'ankle'],
        durationRange: [1, 3],
      },
      {
        id: 'free_throw',
        name: 'Free Throw',
        description: 'Perfect your free throw technique',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip', 'knee'],
        durationRange: [2, 5],
      },
      {
        id: 'layup',
        name: 'Layup',
        description: 'Analyze approach, takeoff, and finish',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip', 'knee', 'ankle'],
        durationRange: [2, 4],
      },
      {
        id: 'dribbling',
        name: 'Dribbling',
        description: 'Analyze ball handling and body control',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip', 'knee'],
        durationRange: [3, 10],
      },
    ],
  },

  [Sport.BADMINTON]: {
    id: Sport.BADMINTON,
    name: 'Badminton',
    icon: '🏸',
    description: 'Analyze smashes, serves, and footwork',
    color: '#22c55e', // Green
    actions: [
      {
        id: 'smash',
        name: 'Smash',
        description: 'Analyze power and technique in overhead smash',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip', 'knee', 'ankle'],
        durationRange: [1, 2],
      },
      {
        id: 'clear',
        name: 'Clear Shot',
        description: 'Analyze defensive and attacking clears',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip'],
        durationRange: [1, 2],
      },
      {
        id: 'drop_shot',
        name: 'Drop Shot',
        description: 'Analyze finesse and deception',
        keyPoints: ['wrist', 'elbow', 'shoulder'],
        durationRange: [1, 2],
      },
      {
        id: 'serve',
        name: 'Serve',
        description: 'Analyze service technique and accuracy',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip'],
        durationRange: [1, 3],
      },
    ],
  },

  [Sport.VOLLEYBALL]: {
    id: Sport.VOLLEYBALL,
    name: 'Volleyball',
    icon: '🏐',
    description: 'Analyze spikes, serves, and blocking',
    color: '#eab308', // Yellow
    actions: [
      {
        id: 'spike',
        name: 'Spike',
        description: 'Analyze approach, jump, and arm swing',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip', 'knee', 'ankle'],
        durationRange: [2, 4],
      },
      {
        id: 'serve',
        name: 'Serve',
        description: 'Analyze toss, contact, and follow-through',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip'],
        durationRange: [2, 4],
      },
      {
        id: 'block',
        name: 'Block',
        description: 'Analyze timing, jump, and hand position',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip', 'knee', 'ankle'],
        durationRange: [1, 3],
      },
      {
        id: 'set',
        name: 'Set',
        description: 'Analyze hand position and release',
        keyPoints: ['wrist', 'elbow', 'shoulder'],
        durationRange: [1, 2],
      },
    ],
  },

  [Sport.CRICKET]: {
    id: Sport.CRICKET,
    name: 'Cricket',
    icon: '🏏',
    description: 'Analyze batting, bowling, and fielding',
    color: '#3b82f6', // Blue
    actions: [
      {
        id: 'batting_drive',
        name: 'Cover Drive',
        description: 'Analyze stance, backlift, and follow-through',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip', 'knee', 'ankle'],
        durationRange: [1, 3],
      },
      {
        id: 'bowling',
        name: 'Bowling Action',
        description: 'Analyze run-up, delivery stride, and release',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip', 'knee', 'ankle'],
        durationRange: [3, 6],
      },
      {
        id: 'pull_shot',
        name: 'Pull Shot',
        description: 'Analyze footwork and shot execution',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip', 'knee'],
        durationRange: [1, 2],
      },
      {
        id: 'defense',
        name: 'Defensive Shot',
        description: 'Analyze defensive technique',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip', 'knee'],
        durationRange: [1, 2],
      },
    ],
  },

  [Sport.TABLE_TENNIS]: {
    id: Sport.TABLE_TENNIS,
    name: 'Table Tennis',
    icon: '🏓',
    description: 'Analyze strokes, serves, and footwork',
    color: '#ef4444', // Red
    actions: [
      {
        id: 'forehand_drive',
        name: 'Forehand Drive',
        description: 'Analyze stroke technique and timing',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip'],
        durationRange: [0.5, 2],
      },
      {
        id: 'backhand_drive',
        name: 'Backhand Drive',
        description: 'Analyze backhand stroke mechanics',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip'],
        durationRange: [0.5, 2],
      },
      {
        id: 'serve',
        name: 'Serve',
        description: 'Analyze toss, spin, and placement',
        keyPoints: ['wrist', 'elbow', 'shoulder'],
        durationRange: [1, 3],
      },
      {
        id: 'smash',
        name: 'Smash',
        description: 'Analyze power and timing',
        keyPoints: ['wrist', 'elbow', 'shoulder', 'hip'],
        durationRange: [0.5, 2],
      },
    ],
  },
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get sport info by ID
 */
export function getSportInfo(sportId: Sport): SportInfo {
  return SPORTS_CONFIG[sportId]
}

/**
 * Get all sports as array
 */
export function getAllSports(): SportInfo[] {
  return Object.values(SPORTS_CONFIG)
}

/**
 * Get actions for a specific sport
 */
export function getSportActions(sportId: Sport): SportAction[] {
  return SPORTS_CONFIG[sportId]?.actions || []
}

/**
 * Get action by sport and action ID
 */
export function getAction(sportId: Sport, actionId: string): SportAction | undefined {
  return SPORTS_CONFIG[sportId]?.actions.find(a => a.id === actionId)
}

// ==========================================
// TYPE GUARDS
// ==========================================

/**
 * Check if a string is a valid Sport enum value
 */
export function isValidSport(value: string): value is Sport {
  return Object.values(Sport).includes(value as Sport)
}

/**
 * Check if an action ID is valid for a sport
 */
export function isValidAction(sportId: Sport, actionId: string): boolean {
  return SPORTS_CONFIG[sportId]?.actions.some(a => a.id === actionId) ?? false
}