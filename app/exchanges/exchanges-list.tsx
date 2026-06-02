'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SkillBadge } from '@/components/skill-badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MapPin, Check, X, Clock, User } from 'lucide-react'
import { toast } from 'sonner'

interface Skill {
  id: string
  title: string
  type: string
  category: string | null
}

interface UserInfo {
  id: string
  full_name: string | null
  neighborhood: string | null
}

interface Exchange {
  id: string
  message: string | null
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
  offer_skill: Skill | null
  want_skill: Skill | null
}

interface ReceivedExchange extends Exchange {
  requester: UserInfo | null
}

interface SentExchange extends Exchange {
  provider: UserInfo | null
}

interface ExchangesListProps {
  received: ReceivedExchange[]
  sent: SentExchange[]
  currentUserId: string
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      status === 'pending' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      status === 'accepted' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      status === 'declined' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    )}>
      {status === 'pending' && <Clock className="w-3 h-3" />}
      {status === 'accepted' && <Check className="w-3 h-3" />}
      {status === 'declined' && <X className="w-3 h-3" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function ExchangeCard({
  exchange,
  otherUser,
  isReceived,
  onAction,
}: {
  exchange: Exchange
  otherUser: UserInfo | null
  isReceived: boolean
  onAction?: (id: string, status: 'accepted' | 'declined') => void
}) {
  const [loading, setLoading] = useState<string | null>(null)

  async function handleAction(status: 'accepted' | 'declined') {
    setLoading(status)
    await onAction?.(exchange.id, status)
    setLoading(null)
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <Link
              href={`/profile/${otherUser?.id}`}
              className="font-medium text-foreground hover:text-primary transition-colors"
            >
              {otherUser?.full_name || 'Anonymous'}
            </Link>
            {otherUser?.neighborhood && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {otherUser.neighborhood}
              </div>
            )}
          </div>
        </div>
        <StatusBadge status={exchange.status} />
      </div>

      {(exchange.offer_skill || exchange.want_skill) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {exchange.offer_skill && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{isReceived ? 'They offer:' : 'You offer:'}</span>
              <SkillBadge title={exchange.offer_skill.title} type="offer" category={exchange.offer_skill.category} />
            </div>
          )}
          {exchange.want_skill && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{isReceived ? 'They want:' : 'You want:'}</span>
              <SkillBadge title={exchange.want_skill.title} type="want" category={exchange.want_skill.category} />
            </div>
          )}
        </div>
      )}

      {exchange.message && (
        <p className="mt-3 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          &ldquo;{exchange.message}&rdquo;
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {new Date(exchange.created_at).toLocaleDateString()}
        </span>
        {isReceived && exchange.status === 'pending' && onAction && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction('declined')}
              disabled={!!loading}
              className="text-destructive hover:text-destructive"
            >
              {loading === 'declined' ? '...' : 'Decline'}
            </Button>
            <Button
              size="sm"
              onClick={() => handleAction('accepted')}
              disabled={!!loading}
            >
              {loading === 'accepted' ? '...' : 'Accept'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function ExchangesList({ received, sent, currentUserId }: ExchangesListProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received')

  async function handleAction(id: string, status: 'accepted' | 'declined') {
    const res = await fetch(`/api/exchanges/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    if (res.ok) {
      toast.success(`Exchange ${status}!`)
      router.refresh()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to update')
    }
  }

  const pendingReceived = received.filter(e => e.status === 'pending').length

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('received')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2',
            activeTab === 'received'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          Received
          {pendingReceived > 0 && (
            <span className="bg-yellow-400 text-yellow-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {pendingReceived}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'sent'
              ? 'bg-primary text-primary-foreground'
              : 'bg-background border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          Sent ({sent.length})
        </button>
      </div>

      {activeTab === 'received' && (
        <div className="space-y-4">
          {received.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-2xl">
              <p>No exchange requests received yet</p>
            </div>
          ) : (
            received.map(exchange => (
              <ExchangeCard
                key={exchange.id}
                exchange={exchange}
                otherUser={exchange.requester}
                isReceived={true}
                onAction={handleAction}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sent.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-2xl">
              <p>You haven&apos;t sent any exchange requests yet</p>
              <Link href="/browse" className="text-primary hover:underline text-sm mt-2 block">
                Browse skills to get started
              </Link>
            </div>
          ) : (
            sent.map(exchange => (
              <ExchangeCard
                key={exchange.id}
                exchange={exchange}
                otherUser={(exchange as SentExchange).provider}
                isReceived={false}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
