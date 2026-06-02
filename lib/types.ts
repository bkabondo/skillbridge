export type UserRole = 'user' | 'admin'
export type SkillType = 'offer' | 'want'
export type ExchangeStatus = 'pending' | 'accepted' | 'declined'

export interface SkillbridgeUser {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  neighborhood: string | null
  bio: string | null
  created_at: string
}

export interface Skill {
  id: string
  user_id: string
  title: string
  description: string | null
  type: SkillType
  category: string | null
  created_at: string
}

export interface Exchange {
  id: string
  requester_id: string
  provider_id: string
  offer_skill_id: string | null
  want_skill_id: string | null
  message: string | null
  status: ExchangeStatus
  created_at: string
  requester?: SkillbridgeUser
  provider?: SkillbridgeUser
  offer_skill?: Skill
  want_skill?: Skill
}

export interface Match {
  id: string
  user_id: string
  matched_user_id: string
  match_reason: string | null
  ai_generated: boolean
  created_at: string
  matched_user?: SkillbridgeUser
}

export interface SkillWithUser extends Skill {
  skillbridge_users: SkillbridgeUser
}
