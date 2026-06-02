import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { redirect } from 'next/navigation'
import { MatchClient } from './match-client'

export default async function MatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('skillbridge_users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Get existing matches
  const { data: matches } = await supabase
    .from('skillbridge_matches')
    .select(`
      *,
      matched_user:skillbridge_users!skillbridge_matches_matched_user_id_fkey (
        id, full_name, neighborhood, bio
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get matched users' skills
  const matchesWithSkills = await Promise.all(
    (matches || []).map(async (match) => {
      const matchedUser = match.matched_user as { id: string; full_name: string | null; neighborhood: string | null; bio: string | null } | null
      if (!matchedUser) return match
      const { data: skills } = await supabase
        .from('skillbridge_skills')
        .select('*')
        .eq('user_id', matchedUser.id)
      return { ...match, matched_user: { ...matchedUser, skills: skills || [] } }
    })
  )

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar isAdmin={profile?.role === 'admin'} />
      <MatchClient initialMatches={matchesWithSkills} />
    </div>
  )
}
