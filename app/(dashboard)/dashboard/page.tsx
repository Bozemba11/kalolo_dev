import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentExpenses } from "@/components/dashboard/recent-expenses"
import { GoalsProgress } from "@/components/dashboard/goals-progress"
import { SpendingChart } from "@/components/dashboard/spending-chart"
import type { Currency } from "@/lib/types"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const currency = (profile?.preferred_currency || "USD") as Currency

  // Get current month's expenses
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .gte("date", startOfMonth.toISOString())
    .order("date", { ascending: false })

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(3)

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)

  // Calculate stats
  const totalSpent = expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
  const expenseCount = expenses?.length || 0
  const avgPerDay = expenseCount > 0 ? totalSpent / new Date().getDate() : 0

  // Get last month's total for comparison
  const lastMonthStart = new Date()
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1)
  lastMonthStart.setDate(1)
  lastMonthStart.setHours(0, 0, 0, 0)
  
  const lastMonthEnd = new Date()
  lastMonthEnd.setDate(0)
  lastMonthEnd.setHours(23, 59, 59, 999)

  const { data: lastMonthExpenses } = await supabase
    .from("expenses")
    .select("amount")
    .eq("user_id", user.id)
    .gte("date", lastMonthStart.toISOString())
    .lte("date", lastMonthEnd.toISOString())

  const lastMonthTotal = lastMonthExpenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
  const monthlyChange = lastMonthTotal > 0 
    ? ((totalSpent - lastMonthTotal) / lastMonthTotal) * 100 
    : 0

  // Aggregate spending by category
  const categorySpending = new Map<string, { name: string; total: number; color: string }>()
  expenses?.forEach((expense) => {
    if (expense.category) {
      const existing = categorySpending.get(expense.category_id) || {
        name: expense.category.name,
        total: 0,
        color: expense.category.color,
      }
      existing.total += Number(expense.amount)
      categorySpending.set(expense.category_id, existing)
    }
  })

  const chartData = Array.from(categorySpending.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! {"Here's"} your financial overview.
        </p>
      </div>

      <DashboardStats
        totalSpent={totalSpent}
        expenseCount={expenseCount}
        avgPerDay={avgPerDay}
        monthlyChange={monthlyChange}
        currency={currency}
        goalsCount={goals?.length || 0}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingChart data={chartData} currency={currency} />
        <GoalsProgress goals={goals || []} currency={currency} />
      </div>

      <RecentExpenses 
        expenses={expenses?.slice(0, 5) || []} 
        currency={currency}
      />
    </div>
  )
}
