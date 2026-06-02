import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { provider_id, offer_skill_id, want_skill_id, message } = body

  if (!provider_id) {
    return NextResponse.json({ error: 'provider_id is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('skillbridge_exchanges')
    .insert({
      requester_id: user.id,
      provider_id,
      offer_skill_id: offer_skill_id || null,
      want_skill_id: want_skill_id || null,
      message: message || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ exchange: data })
}
