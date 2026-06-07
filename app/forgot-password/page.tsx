'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })
    setLoading(false)
    if (error) toast.error(error.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-primary mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              SkillBridge
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
            <p className="text-muted-foreground mt-1">We&apos;ll send a reset link to your email</p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-4xl">📬</p>
              <p className="text-muted-foreground text-sm">
                Check <strong className="text-foreground">{email}</strong> for a reset link.
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full" size="lg">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="you@example.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading} size="lg">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Remember it?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
