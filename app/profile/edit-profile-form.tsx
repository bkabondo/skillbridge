'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface EditProfileFormProps {
  userId: string
  initialData: {
    full_name: string
    neighborhood: string
    bio: string
  }
}

export function EditProfileForm({ userId, initialData }: EditProfileFormProps) {
  const router = useRouter()
  const [form, setForm] = useState(initialData)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase
      .from('skillbridge_users')
      .update({
        full_name: form.full_name || null,
        neighborhood: form.neighborhood || null,
        bio: form.bio || null,
      })
      .eq('id', userId)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Profile updated!')
      router.refresh()
    }
    setLoading(false)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
          <input
            name="full_name"
            type="text"
            value={form.full_name}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Neighborhood</label>
          <input
            name="neighborhood"
            type="text"
            value={form.neighborhood}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Downtown, Westside..."
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Bio</label>
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          placeholder="Tell the community a bit about yourself..."
        />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  )
}
