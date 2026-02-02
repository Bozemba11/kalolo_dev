import { useAuth } from "@/hooks/use-auth"
import { LandingPage } from "@/components/landing-page"
import { Spinner } from "@/components/ui/spinner"
import { Toaster } from "@/components/ui/sonner"
import { Dashboard } from "@/components/dashboard"

export default function App() {
  const { user, loading, login } = useAuth()

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <LandingPage onLogin={login} />
  }

  return (
    <>
      <Dashboard />
      <Toaster position="top-right" />
    </>
  )
}
