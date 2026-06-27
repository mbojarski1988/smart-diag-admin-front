export interface License {
  id: number
  clientName: string
  clientEmail: string
  note: string | null
  validUntil: string
  active: boolean
  deactivatedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface LicenseWrite {
  clientName: string
  clientEmail: string
  note?: string
  validUntil: string
  active?: boolean
}

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  role: string
  active: boolean
}

export interface UserWrite {
  email: string
  firstName: string
  lastName: string
  role: string
  password?: string
  active?: boolean
}

export interface AiPrompt {
  id: number
  name: string
  prompt: string
}

export interface AiPromptWrite {
  name: string
  prompt: string
}

export interface KnownPid {
  id: number
  model: string
  pid: string
  name: string
  unit: string | null
  description: string | null
  active: boolean
}

export interface KnownPidWrite {
  model: string
  pid: string
  name: string
  unit?: string
  description?: string
  active: boolean
}
