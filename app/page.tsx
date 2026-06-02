import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Zap, Users, ArrowLeftRight, Search, Star, ChevronRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            SkillBridge
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            AI-Powered Skill Matching
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-6">
            Exchange Skills with
            <span className="text-primary"> Your Neighbors</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            SkillBridge connects you with people in your neighborhood who can teach you something new — while you teach them what you know. No money, just knowledge.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Join SkillBridge
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/browse">
              <Button variant="outline" size="lg" className="gap-2">
                <Search className="w-4 h-4" />
                Browse Skills
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-background py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">How SkillBridge Works</h2>
            <p className="text-muted-foreground text-lg">Three simple steps to start exchanging skills</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                step: '01',
                title: 'Create Your Profile',
                description: 'List the skills you can teach others and the skills you want to learn. Add your neighborhood and bio.',
                color: 'text-blue-500',
                bg: 'bg-blue-50 dark:bg-blue-900/20',
              },
              {
                icon: Zap,
                step: '02',
                title: 'Get AI Matches',
                description: 'Our AI analyzes your skills and finds the best exchange partners in your community.',
                color: 'text-purple-500',
                bg: 'bg-purple-50 dark:bg-purple-900/20',
              },
              {
                icon: ArrowLeftRight,
                step: '03',
                title: 'Exchange Skills',
                description: 'Send an exchange request to a match. Agree on a skill trade and start learning from each other.',
                color: 'text-emerald-500',
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
              },
            ].map(({ icon: Icon, step, title, description, color, bg }) => (
              <div key={step} className="relative p-8 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div className="text-4xl font-black text-muted-foreground/20 absolute top-6 right-8">{step}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill categories */}
      <section className="bg-muted/30 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Popular Skill Categories</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {['Music', 'Languages', 'Technology', 'Arts', 'Cooking', 'Fitness', 'Outdoors', 'Pets', 'Community', 'Education', 'Crafts', 'Photography'].map(cat => (
              <span
                key={cat}
                className="px-4 py-2 bg-background border border-border rounded-full text-sm font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors cursor-default"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join your neighborhood skill exchange community today. It&apos;s free.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="gap-2">
              Create Your Profile
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>SkillBridge — Built for communities, powered by AI</p>
        </div>
      </footer>
    </div>
  )
}
