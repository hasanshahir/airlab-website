import teamData from '../data/team.json'
import previousInternsData from '../data/previous_interns.json'
import grantsData from '../data/grants.json'
import sponsorsData from '../data/sponsors.json'
import projectsData from '../data/projects.json'
import publicationsData from '../data/publications.json'
import type { Grant, Sponsor, ProjectItem, TeamMemberData, PublicationItem } from '../types/data'

export function getTeamMembers(): TeamMemberData[] {
  return teamData as TeamMemberData[]
}

export function getPreviousInterns(): any[] {
  return previousInternsData
}

export function getGrants(): Grant[] {
  return grantsData as Grant[]
}

export function getActiveGrants(): Grant[] {
  return (grantsData as Grant[]).filter(g => g.status === 'Active')
}

export function getSponsors(): Sponsor[] {
  return sponsorsData as Sponsor[]
}

export function getProjects(): ProjectItem[] {
  return projectsData as ProjectItem[]
}

export function getOngoingProjects(): ProjectItem[] {
  return (projectsData as ProjectItem[]).filter(p => p.status === 'Ongoing')
}

export function getFinishedProjects(): ProjectItem[] {
  return (projectsData as ProjectItem[]).filter(p => p.status === 'Finished')
}

export function getPublications(): PublicationItem[] {
  return (publicationsData as PublicationItem[]).sort((a, b) => b.year - a.year)
}

