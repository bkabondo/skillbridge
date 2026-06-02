'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIES = ['Music', 'Languages', 'Technology', 'Arts', 'Cooking', 'Fitness', 'Outdoors', 'Pets', 'Community', 'Education', 'General']

interface AddSkillFormProps {
  userId: string
  type: 'offer' | 'want'
}

export function AddSkillForm({ userId, type }: AddSkillFormProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'General',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('skillbridge_skills').insert({
      user_id: userId,
      title: form.title.trim(),
      description: form.description.trim() || null,
      category: form.category,
      type,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Skill added!`)
      setForm({ title: '', description: '', category: 'General' })
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add {type === 'offer' ? 'skill to offer' : 'skill you want'}
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Add new skill</span>
        <button type="button" onClick={() => setOpen(false)}>
          <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
      <input
        type="text"
        placeholder="Skill title (e.g. Piano lessons)"
        value={form.title}
        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
        required
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={form.description}
        onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      />
      <select
        value={form.category}
        onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
        className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        {CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <Button type="submit" size="sm" className="w-full" disabled={loading}>
        {loading ? 'Adding...' : 'Add Skill'}
      </Button>
    </form>
  )
}
