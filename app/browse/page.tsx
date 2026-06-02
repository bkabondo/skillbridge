import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { SkillBadge } from '@/components/skill-badge'
import Link from 'next/link'
import { MapPin, User } from 'lucide-react'
import { BrowseFilters } from './browse-filters'

const CATEGORIES = ['All', 'Music', 'Languages', 'Technology', 'Arts', 'Cooking', 'Fitness', 'Outdoors', 'Pets', 'Community', 'Education']

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; type?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = user ? await supabase
    .from('skillbridge_users')
    .select('role')
    .eq('id', user.id)
    .single() : { data: null }

  const params = await searchParams
  const selectedCategory = params.category || 'All'
  const selectedType = params.type || 'offer'

  let query = supabase
    .from('skillbridge_skills')
    .select(`
      *,
      skillbridge_users (id, full_name, neighborhood, bio)
    `)
    .eq('type', selectedType)
    .order('created_at', { ascending: false })

  if (selectedCategory !== 'All') {
    query = query.eq('category', selectedCategory)
  }

  const { data: skills } = await query

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar isAdmin={profile?.role === 'admin'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Browse Community Skills</h1>
          <p className="text-muted-foreground mt-1">Discover what your neighbors can teach you</p>
        </div>

        <BrowseFilters
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          selectedType={selectedType}
        />

        {!skills || skills.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No skills found for this filter.</p>
            <p className="text-sm mt-1">Try a different category or type.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill: {
              id: string
              title: string
              description: string | null
              type: 'offer' | 'want'
              category: string | null
              skillbridge_users: {
                id: string
                full_name: string | null
                neighborhood: string | null
                bio: string | null
              } | null
            }) => (
              <Link
                key={skill.id}
                href={`/profile/${skill.skillbridge_users?.id}`}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-md hover:border-primary/50 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <SkillBadge title={skill.type === 'offer' ? 'Offering' : 'Wanting'} type={skill.type} category={skill.category || undefined} />
                  {skill.category && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {skill.category}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-1 group-hover:text-primary transition-colors">
                  {skill.title}
                </h3>
                {skill.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{skill.description}</p>
                )}
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {skill.skillbridge_users?.full_name || 'Anonymous'}
                    </p>
                    {skill.skillbridge_users?.neighborhood && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {skill.skillbridge_users.neighborhood}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
