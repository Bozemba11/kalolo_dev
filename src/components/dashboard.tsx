import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { blink } from "@/lib/blink"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  LayoutDashboard, 
  LogOut,
  Loader2,
  Trash2,
  ScrollText,
  BookOpen,
  Mic2
} from "lucide-react"
import { toast } from "sonner"
import { HistoryPreservationForm } from "./history-preservation-form"
import { HistoryReader } from "./history-reader"
import { cn } from "@/lib/utils"

export interface HistoryRecord {
  id: string
  speaker_name: string
  context: string
  raw_transcript: string
  refined_transcript?: string
  natural_translation?: string
  family_summary?: string
  created_at: string
}

export function Dashboard() {
  const { user, logout } = useAuth()
  const [histories, setHistories] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<"dashboard" | "builder" | "reader">("dashboard")
  const [selectedHistory, setSelectedHistory] = useState<HistoryRecord | null>(null)

  useEffect(() => {
    fetchHistories()
  }, [])

  const fetchHistories = async () => {
    try {
      const data = await blink.db.histories.list({
        orderBy: { created_at: "desc" }
      }) as HistoryRecord[]
      setHistories(data)
    } catch (error) {
      console.error("Failed to fetch histories:", error)
      toast.error("Failed to load histories")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this preserved history?")) return

    try {
      await blink.db.histories.delete(id)
      setHistories(prev => prev.filter(h => h.id !== id))
      toast.success("History deleted successfully")
    } catch (error) {
      toast.error("Failed to delete history")
    }
  }

  const handlePreserveNew = () => {
    setSelectedHistory(null)
    setActiveView("builder")
  }

  const handleReadHistory = (history: HistoryRecord) => {
    setSelectedHistory(history)
    setActiveView("reader")
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 h-screen border-r border-primary/10 flex flex-col bg-secondary/30 backdrop-blur-xl">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-primary/10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <ScrollText className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight font-serif text-primary">Sauti ya Kale</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Archive" 
            active={activeView === "dashboard"}
            onClick={() => setActiveView("dashboard")}
          />
          <SidebarItem 
            icon={<Plus className="w-5 h-5" />} 
            label="Preserve New" 
            active={activeView === "builder"}
            onClick={handlePreserveNew}
          />
          <SidebarItem 
            icon={<BookOpen className="w-5 h-5" />} 
            label="History Reader" 
            active={activeView === "reader"}
            onClick={() => activeView !== "reader" && selectedHistory && setActiveView("reader")}
            disabled={!selectedHistory}
          />
        </nav>

        <div className="p-4 border-t border-primary/10 space-y-2">
          <div className="px-4 py-3 rounded-xl bg-primary/5 flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
              {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.displayName || "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-primary" onClick={logout}>
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen relative overflow-hidden">
        <header className="h-16 border-b border-primary/10 flex items-center justify-between px-8 bg-background/50 backdrop-blur-sm z-10">
          <h2 className="text-xl font-bold font-serif text-primary">
            {activeView === "dashboard" ? "Archive" : activeView === "builder" ? "Preservation Wizard" : "History Reader"}
          </h2>
          {activeView === "dashboard" && (
            <Button onClick={handlePreserveNew} className="gap-2">
              <Plus className="w-4 h-4" />
              Preserve History
            </Button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {activeView === "dashboard" && (
            <div className="max-w-6xl mx-auto">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : histories.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8 border-2 border-dashed border-primary/10 rounded-3xl bg-primary/5">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <ScrollText className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-serif">The Archive is Empty</h3>
                  <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                    Start preserving the voices of our elders. Every story is a sacred cultural artifact.
                  </p>
                  <Button onClick={handlePreserveNew} size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    Preserve First History
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {histories.map((history) => (
                    <div 
                      key={history.id} 
                      className="group p-6 rounded-2xl border border-primary/10 bg-white/[0.02] hover:bg-primary/[0.05] transition-all cursor-pointer relative"
                      onClick={() => handleReadHistory(history)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Mic2 className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" 
                            onClick={(e) => handleDeleteHistory(history.id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors font-serif">{history.speaker_name}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-6 leading-relaxed italic">
                        "{history.context}"
                      </p>
                      <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/60 pt-4 border-t border-primary/10">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          Preserved
                        </div>
                        <span>{new Date(history.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === "builder" && (
            <HistoryPreservationForm 
              onComplete={() => {
                setActiveView("dashboard");
                fetchHistories();
              }}
              onCancel={() => setActiveView("dashboard")}
            />
          )}

          {activeView === "reader" && selectedHistory && (
            <HistoryReader history={selectedHistory} onBack={() => setActiveView("dashboard")} />
          )}
        </div>
      </main>
    </div>
  )
}

function SidebarItem({ icon, label, active, onClick, disabled }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative",
        active 
          ? "bg-primary/10 text-primary" 
          : "text-muted-foreground hover:text-primary hover:bg-primary/5",
        disabled && "opacity-40 cursor-not-allowed grayscale"
      )}
    >
      {icon}
      {label}
      {active && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />}
    </button>
  )
}
