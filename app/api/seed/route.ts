import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

const SEED_USERS = [
  {
    email: 'admin@skillbridge.local',
    password: process.env.SEED_TEST_PASSWORD!,
    full_name: 'Alex Admin',
    role: 'admin' as const,
    neighborhood: 'Downtown',
    bio: 'Platform administrator and community organizer.',
    skills: [
      { title: 'Community Organizing', description: 'Help organize local events and meetups', type: 'offer' as const, category: 'Community' },
      { title: 'Web Design Basics', description: 'Learn basic HTML/CSS and web design principles', type: 'want' as const, category: 'Technology' },
    ],
  },
  {
    email: 'alice@skillbridge.local',
    password: process.env.SEED_TEST_PASSWORD!,
    full_name: 'Alice Chen',
    role: 'user' as const,
    neighborhood: 'Westside',
    bio: 'Music teacher by day, passionate home cook by night.',
    skills: [
      { title: 'Piano Lessons', description: 'Classical and contemporary piano for all levels', type: 'offer' as const, category: 'Music' },
      { title: 'Spanish Tutoring', description: 'Want to learn conversational Spanish', type: 'want' as const, category: 'Languages' },
      { title: 'Music Theory', description: 'Understand chords, scales, and composition', type: 'offer' as const, category: 'Music' },
    ],
  },
  {
    email: 'bob@skillbridge.local',
    password: process.env.SEED_TEST_PASSWORD!,
    full_name: 'Bob Martinez',
    role: 'user' as const,
    neighborhood: 'Eastside',
    bio: 'Freelance photographer who loves cooking and outdoor adventures.',
    skills: [
      { title: 'Photography', description: 'Portrait and landscape photography, photo editing', type: 'offer' as const, category: 'Arts' },
      { title: 'Cooking Classes', description: 'Want to learn Thai or Indian cuisine', type: 'want' as const, category: 'Cooking' },
      { title: 'Hiking Guide', description: 'Know all the best local trails', type: 'offer' as const, category: 'Outdoors' },
    ],
  },
  {
    email: 'carol@skillbridge.local',
    password: process.env.SEED_TEST_PASSWORD!,
    full_name: 'Carol Johnson',
    role: 'user' as const,
    neighborhood: 'Northside',
    bio: 'Spanish teacher and foodie. Loves yoga and sustainable living.',
    skills: [
      { title: 'Spanish Tutoring', description: 'Native speaker, teach conversational and business Spanish', type: 'offer' as const, category: 'Languages' },
      { title: 'Piano Lessons', description: 'Always wanted to learn piano as a child', type: 'want' as const, category: 'Music' },
      { title: 'Yoga Instruction', description: 'Vinyasa and Hatha yoga for beginners', type: 'offer' as const, category: 'Fitness' },
      { title: 'Dog Walking', description: 'Need help walking my energetic labrador', type: 'want' as const, category: 'Pets' },
    ],
  },
]

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('token') !== process.env.SETUP_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createAdminClient()
  const results: Record<string, unknown>[] = []

  for (const userData of SEED_USERS) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
    })

    if (authError && !authError.message.includes('already been registered')) {
      results.push({ email: userData.email, error: authError.message })
      continue
    }

    const userId = authData?.user?.id
    if (!userId) {
      // Try to get existing user
      const { data: existing } = await supabase
        .from('skillbridge_users')
        .select('id')
        .eq('email', userData.email)
        .single()
      if (!existing) {
        results.push({ email: userData.email, error: 'Could not get user ID' })
        continue
      }
      results.push({ email: userData.email, status: 'already exists' })
      continue
    }

    // Insert into skillbridge_users
    const { error: profileError } = await supabase
      .from('skillbridge_users')
      .upsert({
        id: userId,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        neighborhood: userData.neighborhood,
        bio: userData.bio,
      })

    if (profileError) {
      results.push({ email: userData.email, error: profileError.message })
      continue
    }

    // Insert skills
    const skillsToInsert = userData.skills.map(skill => ({
      ...skill,
      user_id: userId,
    }))

    const { error: skillsError } = await supabase
      .from('skillbridge_skills')
      .upsert(skillsToInsert)

    if (skillsError) {
      results.push({ email: userData.email, error: `Skills: ${skillsError.message}` })
      continue
    }

    results.push({ email: userData.email, status: 'created', userId })
  }

  return NextResponse.json({ results })
}
