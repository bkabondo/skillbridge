'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export function DeleteSkillButton({ skillId }: { skillId: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this skill?')) return

    const supabase = createClient()
    const { error } = await supabase
      .from('skillbridge_skills')
      .delete()
      .eq('id', skillId)

    if (error) {
      toast.error(error.message)
    } else {
      router.refresh()
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="ml-2 p-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
      title="Delete skill"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  )
}
