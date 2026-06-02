import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { redirect } from 'next/navigation'
import { ExchangesList } from './exchanges-list'

export default async function ExchangesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('skillbridge_users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Get received exchanges
  const { data: received } = await supabase
    .from('skillbridge_exchanges')
    .select(`
      *,
      requester:skillbridge_users!skillbridge_exchanges_requester_id_fkey (id, full_name, neighborhood),
      offer_skill:skillbridge_skills!skillbridge_exchanges_offer_skill_id_fkey (id, title, type, category),
      want_skill:skillbridge_skills!skillbridge_exchanges_want_skill_id_fkey (id, title, type, category)
    `)
    .eq('provider_id', user.id)
    .order('created_at', { ascending: false })

  // Get sent exchanges
  const { data: sent } = await supabase
    .from('skillbridge_exchanges')
    .select(`
      *,
      provider:skillbridge_users!skillbridge_exchanges_provider_id_fkey (id, full_name, neighborhood),
      offer_skill:skillbridge_skills!skillbridge_exchanges_offer_skill_id_fkey (id, title, type, category),
      want_skill:skillbridge_skills!skillbridge_exchanges_want_skill_id_fkey (id, title, type, category)
    `)
    .eq('requester_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar isAdmin={profile?.role === 'admin'} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Skill Exchanges</h1>
          <p className="text-muted-foreground mt-1">Manage your skill exchange requests</p>
        </div>
        <ExchangesList
          received={(received || []) as Parameters<typeof ExchangesList>[0]['received']}
          sent={(sent || []) as Parameters<typeof ExchangesList>[0]['sent']}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
