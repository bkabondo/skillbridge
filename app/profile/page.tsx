import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { SkillBadge } from '@/components/skill-badge'
import { redirect } from 'next/navigation'
import { MapPin, User, Plus } from 'lucide-react'
import { AddSkillForm } from './add-skill-form'
import { EditProfileForm } from './edit-profile-form'
import { DeleteSkillButton } from './delete-skill-button'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('skillbridge_users')
    .select('*')
    .eq('id', user.id)
    .single()

  // If no profile exists yet, create one
  if (!profile) {
    await supabase.from('skillbridge_users').upsert({
      id: user.id,
      email: user.email!,
      role: 'user',
    })
  }

  const { data: skills } = await supabase
    .from('skillbridge_skills')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const offeredSkills = skills?.filter(s => s.type === 'offer') || []
  const wantedSkills = skills?.filter(s => s.type === 'want') || []

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar isAdmin={profile?.role === 'admin'} />

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
                  {profile?.full_name || 'Your Profile'}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
                {profile?.neighborhood && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.neighborhood}
                  </div>
                )}
              </div>
            </div>
            {profile?.role === 'admin' && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                Admin
              </span>
            )}
          </div>
          {profile?.bio && (
            <p className="mt-4 text-muted-foreground">{profile.bio}</p>
          )}
        </div>

        {/* Edit Profile */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Edit Profile</h2>
          <EditProfileForm
            userId={user.id}
            initialData={{
              full_name: profile?.full_name || '',
              neighborhood: profile?.neighborhood || '',
              bio: profile?.bio || '',
            }}
          />
        </div>

        {/* Skills Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills Offered */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 text-xs font-bold">↑</span>
                Skills I Offer
              </h2>
              <span className="text-xs text-muted-foreground">{offeredSkills.length} skills</span>
            </div>
            <div className="space-y-3 mb-4">
              {offeredSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No skills added yet</p>
              ) : (
                offeredSkills.map(skill => (
                  <div key={skill.id} className="flex items-start justify-between group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <SkillBadge title={skill.title} type="offer" category={skill.category} />
                      </div>
                      {skill.description && (
                        <p className="text-xs text-muted-foreground mt-1 ml-1">{skill.description}</p>
                      )}
                    </div>
                    <DeleteSkillButton skillId={skill.id} />
                  </div>
                ))
              )}
            </div>
            <AddSkillForm userId={user.id} type="offer" />
          </div>

          {/* Skills Wanted */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">↓</span>
                Skills I Want
              </h2>
              <span className="text-xs text-muted-foreground">{wantedSkills.length} skills</span>
            </div>
            <div className="space-y-3 mb-4">
              {wantedSkills.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No skills added yet</p>
              ) : (
                wantedSkills.map(skill => (
                  <div key={skill.id} className="flex items-start justify-between group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <SkillBadge title={skill.title} type="want" category={skill.category} />
                      </div>
                      {skill.description && (
                        <p className="text-xs text-muted-foreground mt-1 ml-1">{skill.description}</p>
                      )}
                    </div>
                    <DeleteSkillButton skillId={skill.id} />
                  </div>
                ))
              )}
            </div>
            <AddSkillForm userId={user.id} type="want" />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { label: 'Skills Offered', value: offeredSkills.length },
            { label: 'Skills Wanted', value: wantedSkills.length },
            { label: 'Total Skills', value: (skills?.length || 0) },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
