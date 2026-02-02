import { Button } from "@/components/ui/button"
import { ScrollText, Sparkles, BookOpen, Shield, Globe, Mic2 } from "lucide-react"

interface LandingPageProps {
  onLogin: () => void
}

export function LandingPage({ onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-primary/10 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ScrollText className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight font-serif">Sauti ya Kale</span>
          </div>
          <Button onClick={onLogin} variant="ghost" className="hover:bg-primary/5 transition-colors">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="pt-32 pb-20 px-4 relative overflow-hidden min-h-[90vh] flex items-center">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1718010588689-9806ce642d39?auto=format&fit=crop&q=80&w=2000" 
              className="w-full h-full object-cover opacity-20 dark:opacity-10 scale-105"
              alt="Elderly people sharing stories"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          </div>
          <div className="container mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-sm font-medium mb-6 animate-fade-in backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Preserving East Africa's Spoken Heritage</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 max-w-4xl mx-auto leading-[1.1] font-serif">
              The Guardian of <br /> 
              <span className="text-primary italic">Tanzanian Oral History</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Transform raw recordings into authentic cultural artifacts. We preserve every dialect, proverb, and emotion of our elders.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button onClick={onLogin} size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/20">
                Preserve a History
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base font-semibold bg-transparent border-primary/20 hover:bg-primary/5 transition-colors">
                Explore Archives
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 border-t border-primary/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Mic2 className="w-6 h-6 text-primary" />}
                title="Authentic Transcription"
                description="Preserve exact dialect features, hesitations, and code-switching without standardization."
              />
              <FeatureCard 
                icon={<BookOpen className="w-6 h-6 text-primary" />}
                title="Cultural Context"
                description="Automatic detection of methali (proverbs) and community-specific linguistic nuances."
              />
              <FeatureCard 
                icon={<Globe className="w-6 h-6 text-primary" />}
                title="Ethical Sharing"
                description="Respect community sovereignty with granular privacy for family and clan-only stories."
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-primary/10 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <ScrollText className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg font-serif">Sauti ya Kale</span>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2026 Sauti ya Kale. Dedicated to the elders of Tanzania. Built with Blink.
          </p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl border border-primary/10 bg-white/[0.02] hover:bg-primary/[0.02] transition-all group">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 font-serif">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  )
}
