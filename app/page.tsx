import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  Wallet, 
  BarChart3, 
  Target, 
  Shield, 
  ArrowRight,
  CheckCircle2,
  Globe
} from "lucide-react"

export default function HomePage() {
  const features = [
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description: "Visualize your spending patterns with interactive charts and insights.",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set financial goals and track your progress towards achieving them.",
    },
    {
      icon: Globe,
      title: "Multi-Currency",
      description: "Support for USD, EUR, and KES with automatic conversions.",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your financial data is encrypted and protected with enterprise-grade security.",
    },
  ]

  const benefits = [
    "Track expenses across multiple categories",
    "Set and achieve savings goals",
    "Get insights into spending habits",
    "Support for multiple currencies",
    "Beautiful analytics dashboards",
    "Mobile-friendly design",
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Fedha Yako</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            Multi-currency support: USD, EUR, KES
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6 text-balance">
            Take Control of
            <span className="text-primary"> Your Finances</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
            Fedha Yako helps you track expenses, set savings goals, and gain insights into your spending habits. Your money, your way.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Start Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign in to Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powerful features to help you manage your finances effectively.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-6 border border-border"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Financial Freedom Starts Here
              </h2>
              <p className="text-muted-foreground mb-8">
                Whether you are saving for a vacation, tracking daily expenses, or working towards financial independence, Fedha Yako provides the tools you need.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-muted/50 rounded-2xl p-8 border border-border">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-lg">
                      🍔
                    </div>
                    <div>
                      <p className="font-medium">Food & Dining</p>
                      <p className="text-sm text-muted-foreground">Today</p>
                    </div>
                  </div>
                  <p className="font-semibold text-destructive">-$45.00</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-lg">
                      🚗
                    </div>
                    <div>
                      <p className="font-medium">Transportation</p>
                      <p className="text-sm text-muted-foreground">Yesterday</p>
                    </div>
                  </div>
                  <p className="font-semibold text-destructive">-$25.00</p>
                </div>
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-lg">
                      🏠
                    </div>
                    <div>
                      <p className="font-medium">Housing</p>
                      <p className="text-sm text-muted-foreground">Jan 1</p>
                    </div>
                  </div>
                  <p className="font-semibold text-destructive">-$1,200.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Take Control?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join thousands of users who are already managing their finances smarter with Fedha Yako.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/sign-up">
              Create Free Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Fedha Yako</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your money, your way.
          </p>
        </div>
      </footer>
    </div>
  )
}
