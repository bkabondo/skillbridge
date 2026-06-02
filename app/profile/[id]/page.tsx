import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { SkillBadge } from '@/components/skill-badge'
import { notFound } from 'next/navigation'
import { MapPin, User } from 'lucide-react'
import { RequestExchangeButton } from './request-exchange-button'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  const { id } = await params

  // Redirect to own profile if viewing self
  if (currentUser && id === currentUser.id) {
    const { redirect } = await import('next/navigation')
    redirect('/profile')
  }

  const { data: profile } = await supabase
    .from('skillbridge_users')
    .select('*')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: skills } = await supabase
    .from('skillbridge_skills')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const { data: myProfile } = currentUser ? await supabase
    .from('skillbridge_users')
    .select('role')
    .eq('id', currentUser.id)
    .single() : { data: null }

  const offeredSkills = skills?.filter(s => s.type === 'offer') || []
  const wantedSkills = skills?.filter(s => s.type === 'want') || []

  const { data: mySkills } = currentUser ? await supabase
    .from('skillbridge_skills')
    .select('*')
    .eq('user_id', currentUser.id) : { data: null }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar isAdmin={myProfile?.role === 'admin'} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.full_name || 'Anonymous User'}
                </h1>
                {profile.neighborhood && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.neighborhood}
                  </div>
                )}
              </div>
            </div>

            {currentUser && currentUser.id !== id && (
              <RequestExchangeButton
                providerId={id}
                providerName={profile.full_name || 'this user'}
                providerSkills={offeredSkills}
                mySkills={mySkills || []}
              />
            )}
          </div>
          {profile.bio && (
            <p className="mt-4 text-muted-foreground">{profile.bio}</p>
          )}
        </div>

        {/* Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 text-xs font-bold">↑</span>
              Skills Offered ({offeredSkills.length})
            </h2>
            {offeredSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No skills listed yet</p>
            ) : (
              <div className="space-y-3">
                {offeredSkills.map(skill => (
                  <div key={skill.id}>
                    <SkillBadge title={skill.title} type="offer" category={skill.category} />
                    {skill.description && (
                      <p className="text-xs text-muted-foreground mt-1 ml-1">{skill.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">↓</span>
              Skills Wanted ({wantedSkills.length})
            </h2>
            {wantedSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No skills listed yet</p>
            ) : (
              <div className="space-y-3">
                {wantedSkills.map(skill => (
                  <div key={skill.id}>
                    <SkillBadge title={skill.title} type="want" category={skill.category} />
                    {skill.description && (
                      <p className="text-xs text-muted-foreground mt-1 ml-1">{skill.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
