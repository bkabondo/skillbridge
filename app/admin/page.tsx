import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/navbar'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, ArrowLeftRight, LayoutDashboard } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('skillbridge_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/profile')

  // Get all users
  const { data: users } = await supabase
    .from('skillbridge_users')
    .select(`
      *,
      skillbridge_skills (id, type)
    `)
    .order('created_at', { ascending: false })

  // Get all exchanges
  const { data: exchanges } = await supabase
    .from('skillbridge_exchanges')
    .select(`
      *,
      requester:skillbridge_users!skillbridge_exchanges_requester_id_fkey (id, full_name),
      provider:skillbridge_users!skillbridge_exchanges_provider_id_fkey (id, full_name)
    `)
    .order('created_at', { ascending: false })

  const totalSkills = users?.reduce((sum, u) => sum + ((u.skillbridge_skills as { id: string; type: string }[] || []).length), 0) || 0
  const pendingExchanges = exchanges?.filter(e => e.status === 'pending').length || 0

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar isAdmin={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <LayoutDashboard className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Overview of all users and exchanges</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: users?.length || 0, color: 'text-blue-500' },
            { label: 'Total Skills', value: totalSkills, color: 'text-purple-500' },
            { label: 'Total Exchanges', value: exchanges?.length || 0, color: 'text-emerald-500' },
            { label: 'Pending Exchanges', value: pendingExchanges, color: 'text-yellow-500' },
          ].map(stat => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden mb-8">
          <div className="flex items-center gap-2 p-5 border-b border-border">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">All Users ({users?.length || 0})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Name</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Email</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Neighborhood</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Role</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Skills</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => {
                  const skills = (u.skillbridge_skills as { id: string; type: string }[]) || []
                  return (
                    <tr key={u.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/profile/${u.id}`} className="font-medium text-foreground hover:text-primary transition-colors">
                          {u.full_name || 'Anonymous'}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3 text-muted-foreground">{u.neighborhood || '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {skills.filter(s => s.type === 'offer').length} offers,{' '}
                        {skills.filter(s => s.type === 'want').length} wants
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Exchanges Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 p-5 border-b border-border">
            <ArrowLeftRight className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">All Exchanges ({exchanges?.length || 0})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Requester</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Provider</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-5 py-3 text-muted-foreground font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {exchanges?.map(exchange => {
                  const requester = exchange.requester as { id: string; full_name: string | null } | null
                  const provider = exchange.provider as { id: string; full_name: string | null } | null
                  return (
                    <tr key={exchange.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/profile/${requester?.id}`} className="font-medium text-foreground hover:text-primary">
                          {requester?.full_name || 'Anonymous'}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/profile/${provider?.id}`} className="font-medium text-foreground hover:text-primary">
                          {provider?.full_name || 'Anonymous'}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          exchange.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          exchange.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {exchange.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(exchange.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
