import { cn } from '@/lib/utils'

interface SkillBadgeProps {
  title: string
  type: 'offer' | 'want'
  category?: string | null
  className?: string
}

const categoryColors: Record<string, string> = {
  Music: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  Languages: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Technology: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  Arts: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  Cooking: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Fitness: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Outdoors: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Pets: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Community: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
}

export function SkillBadge({ title, type, category, className }: SkillBadgeProps) {
  const colorClass = category && categoryColors[category]
    ? categoryColors[category]
    : type === 'offer'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        colorClass,
        className
      )}
    >
      {type === 'offer' ? '↑' : '↓'} {title}
    </span>
  )
}
