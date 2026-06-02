import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get current user's skills
  const { data: mySkills } = await supabase
    .from('skillbridge_skills')
    .select('*')
    .eq('user_id', user.id)

  if (!mySkills || mySkills.length === 0) {
    return NextResponse.json({ error: 'No skills found. Add skills to your profile first.' }, { status: 400 })
  }

  // Get current user profile
  const { data: myProfile } = await supabase
    .from('skillbridge_users')
    .select('*')
    .eq('id', user.id)
    .single()

  // Get all other users with their skills
  const { data: otherUsers } = await supabase
    .from('skillbridge_users')
    .select(`
      *,
      skillbridge_skills (*)
    `)
    .neq('id', user.id)

  if (!otherUsers || otherUsers.length === 0) {
    return NextResponse.json({ error: 'No other users found to match with.' }, { status: 400 })
  }

  const myOffers = mySkills.filter(s => s.type === 'offer')
  const myWants = mySkills.filter(s => s.type === 'want')

  const prompt = `You are a skill-exchange matchmaking AI for SkillBridge, a neighborhood skill exchange platform.

Current user: ${myProfile?.full_name || 'Unknown'} (${myProfile?.neighborhood || 'Unknown neighborhood'})
Their bio: ${myProfile?.bio || 'No bio'}

Skills they OFFER:
${myOffers.map(s => `- ${s.title}: ${s.description || ''} (Category: ${s.category || 'General'})`).join('\n')}

Skills they WANT to learn:
${myWants.map(s => `- ${s.title}: ${s.description || ''} (Category: ${s.category || 'General'})`).join('\n')}

Other community members:
${otherUsers.map(u => {
  const skills = (u.skillbridge_skills as { type: string; title: string; description: string | null; category: string | null }[]) || []
  const offers = skills.filter((s) => s.type === 'offer')
  const wants = skills.filter((s) => s.type === 'want')
  return `
User: ${u.full_name} (ID: ${u.id}, Neighborhood: ${u.neighborhood || 'Unknown'})
Bio: ${u.bio || 'No bio'}
Offers: ${offers.map((s) => s.title).join(', ') || 'None'}
Wants: ${wants.map((s) => s.title).join(', ') || 'None'}`
}).join('\n')}

Please analyze potential skill exchange matches. A good match is when:
1. The current user wants to learn something the other person offers, AND/OR
2. The current user offers something the other person wants to learn

Return exactly 3 matches in this JSON format (no markdown, just raw JSON):
{
  "matches": [
    {
      "matched_user_id": "uuid",
      "matched_user_name": "name",
      "match_reason": "Detailed explanation of why this is a good match, mentioning specific skills",
      "compatibility_score": 85
    }
  ]
}`

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  })

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const responseText = message.content[0].type === 'text' ? message.content[0].text : ''

  let matchData: { matches: Array<{ matched_user_id: string; matched_user_name: string; match_reason: string; compatibility_score: number }> }
  try {
    matchData = JSON.parse(responseText)
  } catch {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      matchData = JSON.parse(jsonMatch[0])
    } else {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }
  }

  // Save matches to database
  const matchesToInsert = matchData.matches.map(m => ({
    user_id: user.id,
    matched_user_id: m.matched_user_id,
    match_reason: m.match_reason,
    ai_generated: true,
  }))

  // Delete old matches for this user
  await supabase
    .from('skillbridge_matches')
    .delete()
    .eq('user_id', user.id)

  // Insert new matches
  await supabase
    .from('skillbridge_matches')
    .insert(matchesToInsert)

  return NextResponse.json({ matches: matchData.matches })
}
