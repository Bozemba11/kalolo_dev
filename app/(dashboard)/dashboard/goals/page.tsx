import { createClient } from "@/lib/supabase/server"
import { GoalsList } from "@/components/goals/goals-list"
import { AddGoalDialog } from "@/components/goals/add-goal-dialog"
import type { Currency } from "@/lib/types"

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const currency = (profile?.preferred_currency || "USD") as Currency

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const activeGoals = goals?.filter((g) => g.status === "active") || []
  const completedGoals = goals?.filter((g) => g.status === "completed") || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financial Goals</h1>
          <p className="text-muted-foreground">
            Set and track your savings goals
          </p>
        </div>
        <AddGoalDialog currency={currency} userId={user.id} />
      </div>

      <GoalsList 
        activeGoals={activeGoals}
        completedGoals={completedGoals}
        currency={currency}
      />
    </div>
  )
}
