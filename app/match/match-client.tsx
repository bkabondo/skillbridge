'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SkillBadge } from '@/components/skill-badge'
import { Zap, User, MapPin, Star } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface MatchedUser {
  id: string
  full_name: string | null
  neighborhood: string | null
  bio: string | null
  skills?: Array<{ id: string; title: string; type: string; category: string | null }>
}

interface MatchData {
  id: string
  match_reason: string | null
  ai_generated: boolean
  created_at: string
  matched_user: MatchedUser | null
}

export function MatchClient({ initialMatches }: { initialMatches: MatchData[] }) {
  const [matches, setMatches] = useState(initialMatches)
  const [loading, setLoading] = useState(false)

  async function findMatches() {
    setLoading(true)
    try {
      const res = await fetch('/api/match', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to find matches')
        return
      }

      toast.success('AI found your best matches!')
      // Reload to get updated matches with user data
      window.location.reload()
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Skill Matches</h1>
          <p className="text-muted-foreground mt-1">
            Claude AI analyzes your skills to find the best exchange partners
          </p>
        </div>
        <Button onClick={findMatches} disabled={loading} size="lg" className="gap-2">
          <Zap className={`w-5 h-5 ${loading ? 'animate-pulse' : ''}`} />
          {loading ? 'Finding matches...' : 'Find My Matches'}
        </Button>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <Zap className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No matches yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Click &ldquo;Find My Matches&rdquo; to let our AI analyze your skills and find the best exchange partners in your community.
          </p>
          <Button onClick={findMatches} disabled={loading} className="gap-2">
            <Zap className="w-4 h-4" />
            {loading ? 'Finding...' : 'Find Matches Now'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match, index) => {
            const matchedUser = match.matched_user
            if (!matchedUser) return null

            const skills = matchedUser.skills || []
            const offeredSkills = skills.filter(s => s.type === 'offer')
            const wantedSkills = skills.filter(s => s.type === 'want')

            return (
              <div key={match.id} className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 relative">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {matchedUser.full_name || 'Anonymous'}
                        </h3>
                        {matchedUser.neighborhood && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5" />
                            {matchedUser.neighborhood}
                          </div>
                        )}
                      </div>
                      {match.ai_generated && (
                        <span className="flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">
                          <Star className="w-3 h-3" />
                          AI Match
                        </span>
                      )}
                    </div>

                    {match.match_reason && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-foreground leading-relaxed">{match.match_reason}</p>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {offeredSkills.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5 font-medium">They offer:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {offeredSkills.slice(0, 3).map(s => (
                              <SkillBadge key={s.id} title={s.title} type="offer" category={s.category} />
                            ))}
                          </div>
                        </div>
                      )}
                      {wantedSkills.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1.5 font-medium">They want:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {wantedSkills.slice(0, 3).map(s => (
                              <SkillBadge key={s.id} title={s.title} type="want" category={s.category} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <Link href={`/profile/${matchedUser.id}`}>
                        <Button variant="outline" size="sm">
                          View Profile &amp; Request Exchange
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
