'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface BrowseFiltersProps {
  categories: string[]
  selectedCategory: string
  selectedType: string
}

export function BrowseFilters({ categories, selectedCategory, selectedType }: BrowseFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    router.push(`/browse?${params.toString()}`)
  }

  return (
    <div className="mb-6 space-y-3">
      {/* Type filter */}
      <div className="flex gap-2">
        {['offer', 'want'].map(type => (
          <button
            key={type}
            onClick={() => updateFilter('type', type)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedType === type
                ? type === 'offer'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-blue-500 text-white'
                : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {type === 'offer' ? 'Skills Offered' : 'Skills Wanted'}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => updateFilter('category', cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
