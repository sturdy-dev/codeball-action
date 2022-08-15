export type Status =
  | 'registered'
  | 'running'
  | 'failure'
  | 'success'
  | 'unknown'

export type Job = {
  id: string
  created_at: string
  started_at: string
  completed_at: any
  status: Status
  error: any
  repository?: Repository
  contribution?: Contribution
  comment?: Comment
}

export type Repository = {
  url: string
  name: string
  contribution_jobs: ContributionJob[]
}

export type Suggestion = {
  commit_id: string
  filename: string
  from_line: number
  to_line: number
  text: string
}

export type ContributionJob = {
  id: string
  parent: string
  created_at: string
  started_at: string
  completed_at: string
  status: Status
  error?: Error
  contribution: Contribution
}

export type Error = {
  message: string
}

export type Contribution = {
  url: string
  number: number
  title: string
  merged_without_objections: boolean
  created_at: string
  merged_at: any
  result: 'inconclusive' | 'approved' | 'not_approved' | null
}

export type Comment = {
  url: string
  suggestions: Suggestion[]
}
