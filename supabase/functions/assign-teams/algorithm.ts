import { TeamAssignmentResult, AssignmentStrategy } from '../../../packages/shared/src/types/team-assignment.ts'

interface Participant {
  id: string
  display_name: string
}

interface Team {
  id: string
  name: string
}

/**
 * Shuffles an array using the Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Distributes teams fairly among participants
 */
function distributeTeamsFairly(participants: Participant[], teams: Team[]): TeamAssignmentResult[] {
  const assignments: TeamAssignmentResult[] = []
  const participantCount = participants.length
  const teamCount = teams.length
  
  // Shuffle both arrays for randomness
  const shuffledParticipants = shuffleArray(participants)
  const shuffledTeams = shuffleArray(teams)
  
  if (participantCount <= teamCount) {
    // More teams than participants - each participant gets one team
    for (let i = 0; i < participantCount; i++) {
      assignments.push({
        participantId: shuffledParticipants[i].id,
        teamId: shuffledTeams[i].id,
      })
    }
  } else {
    // More participants than teams - distribute teams as evenly as possible
    const teamsPerParticipant = Math.floor(teamCount / participantCount)
    const extraTeams = teamCount % participantCount
    
    let teamIndex = 0
    
    for (let i = 0; i < participantCount; i++) {
      const participant = shuffledParticipants[i]
      
      // Each participant gets at least teamsPerParticipant teams
      const numTeamsForThisParticipant = teamsPerParticipant + (i < extraTeams ? 1 : 0)
      
      for (let j = 0; j < numTeamsForThisParticipant && teamIndex < teamCount; j++) {
        assignments.push({
          participantId: participant.id,
          teamId: shuffledTeams[teamIndex].id,
        })
        teamIndex++
      }
    }
  }
  
  return assignments
}

/**
 * Round-robin assignment - distributes teams one by one to participants
 */
function distributeTeamsRoundRobin(participants: Participant[], teams: Team[]): TeamAssignmentResult[] {
  const assignments: TeamAssignmentResult[] = []
  const shuffledParticipants = shuffleArray(participants)
  const shuffledTeams = shuffleArray(teams)
  
  for (let i = 0; i < shuffledTeams.length; i++) {
    const participantIndex = i % shuffledParticipants.length
    assignments.push({
      participantId: shuffledParticipants[participantIndex].id,
      teamId: shuffledTeams[i].id,
    })
  }
  
  return assignments
}

/**
 * Snake draft assignment - alternates direction each round
 */
function distributeTeamsSnakeDraft(participants: Participant[], teams: Team[]): TeamAssignmentResult[] {
  const assignments: TeamAssignmentResult[] = []
  const shuffledParticipants = shuffleArray(participants)
  const shuffledTeams = shuffleArray(teams)
  const participantCount = shuffledParticipants.length
  
  if (participantCount === 0 || shuffledTeams.length === 0) {
    return assignments
  }
  
  let currentParticipantIndex = 0
  let direction = 1 // 1 for forward, -1 for backward
  
  for (const team of shuffledTeams) {
    assignments.push({
      participantId: shuffledParticipants[currentParticipantIndex].id,
      teamId: team.id,
    })
    
    // Move to next participant
    currentParticipantIndex += direction
    
    // Check if we need to change direction
    if (currentParticipantIndex >= participantCount) {
      currentParticipantIndex = participantCount - 1
      direction = -1
    } else if (currentParticipantIndex < 0) {
      currentParticipantIndex = 0
      direction = 1
    }
  }
  
  return assignments
}

/**
 * Main team assignment algorithm
 */
export function assignTeamsAlgorithm(
  participants: Participant[], 
  teams: Team[], 
  strategy: AssignmentStrategy = 'fair'
): TeamAssignmentResult[] {
  if (!participants.length) {
    throw new Error('No participants provided for team assignment')
  }
  
  if (!teams.length) {
    throw new Error('No teams available for assignment')
  }
  
  switch (strategy) {
    case 'round-robin':
      return distributeTeamsRoundRobin(participants, teams)
    
    case 'snake-draft':
      return distributeTeamsSnakeDraft(participants, teams)
    
    case 'fair':
    default:
      return distributeTeamsFairly(participants, teams)
  }
}

/**
 * Validates assignment results
 */
export function validateAssignments(
  assignments: TeamAssignmentResult[],
  participants: Participant[],
  teams: Team[]
): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Check that all assignments have valid participant and team IDs
  const participantIds = new Set(participants.map(p => p.id))
  const teamIds = new Set(teams.map(t => t.id))
  
  for (const assignment of assignments) {
    if (!participantIds.has(assignment.participantId)) {
      errors.push(`Invalid participant ID: ${assignment.participantId}`)
    }
    
    if (!teamIds.has(assignment.teamId)) {
      errors.push(`Invalid team ID: ${assignment.teamId}`)
    }
  }
  
  // Check that all teams are assigned
  const assignedTeamIds = new Set(assignments.map(a => a.teamId))
  for (const team of teams) {
    if (!assignedTeamIds.has(team.id)) {
      errors.push(`Team not assigned: ${team.name} (${team.id})`)
    }
  }
  
  // Check for duplicate team assignments
  const teamAssignmentCounts = new Map<string, number>()
  for (const assignment of assignments) {
    const count = teamAssignmentCounts.get(assignment.teamId) || 0
    teamAssignmentCounts.set(assignment.teamId, count + 1)
  }
  
  for (const [teamId, count] of teamAssignmentCounts) {
    if (count > 1) {
      const team = teams.find(t => t.id === teamId)
      errors.push(`Team assigned multiple times: ${team?.name || teamId} (${count} times)`)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Gets assignment statistics for reporting
 */
export function getAssignmentStats(
  assignments: TeamAssignmentResult[],
  participants: Participant[],
  teams: Team[]
): {
  totalAssignments: number
  participantsWithTeams: number
  teamsAssigned: number
  averageTeamsPerParticipant: number
  participantDistribution: Map<string, number>
} {
  const participantTeamCounts = new Map<string, number>()
  const assignedTeams = new Set<string>()
  
  for (const assignment of assignments) {
    const currentCount = participantTeamCounts.get(assignment.participantId) || 0
    participantTeamCounts.set(assignment.participantId, currentCount + 1)
    assignedTeams.add(assignment.teamId)
  }
  
  const participantsWithTeams = participantTeamCounts.size
  const averageTeamsPerParticipant = participantsWithTeams > 0 
    ? assignments.length / participantsWithTeams 
    : 0
  
  return {
    totalAssignments: assignments.length,
    participantsWithTeams,
    teamsAssigned: assignedTeams.size,
    averageTeamsPerParticipant,
    participantDistribution: participantTeamCounts
  }
}