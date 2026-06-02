'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeftRight } from 'lucide-react'
import { toast } from 'sonner'

interface Skill {
  id: string
  title: string
  type: string
  description: string | null
}

interface RequestExchangeButtonProps {
  providerId: string
  providerName: string
  providerSkills: Skill[]
  mySkills: Skill[]
}

export function RequestExchangeButton({
  providerId,
  providerName,
  providerSkills,
  mySkills,
}: RequestExchangeButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    offer_skill_id: '',
    want_skill_id: '',
    message: '',
  })

  const myOffers = mySkills.filter(s => s.type === 'offer')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/exchanges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider_id: providerId,
        offer_skill_id: form.offer_skill_id || null,
        want_skill_id: form.want_skill_id || null,
        message: form.message || null,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.error || 'Failed to send request')
    } else {
      toast.success('Exchange request sent!')
      setOpen(false)
      setForm({ offer_skill_id: '', want_skill_id: '', message: '' })
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-2">
        <ArrowLeftRight className="w-4 h-4" />
        Request Exchange
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Request Exchange with {providerName}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Skill I can offer (optional)
            </label>
            <select
              value={form.offer_skill_id}
              onChange={e => setForm(p => ({ ...p, offer_skill_id: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select a skill you offer...</option>
              {myOffers.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Skill I want from {providerName} (optional)
            </label>
            <select
              value={form.want_skill_id}
              onChange={e => setForm(p => ({ ...p, want_skill_id: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">Select a skill they offer...</option>
              {providerSkills.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Message (optional)
            </label>
            <textarea
              value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Introduce yourself and explain your exchange idea..."
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
