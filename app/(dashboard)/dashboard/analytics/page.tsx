import { createClient } from "@/lib/supabase/server"
import { AnalyticsCharts } from "@/components/analytics/analytics-charts"
import type { Currency } from "@/lib/types"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const currency = (profile?.preferred_currency || "USD") as Currency

  // Get last 6 months of expenses
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .gte("date", sixMonthsAgo.toISOString())
    .order("date", { ascending: true })

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)

  // Process data for charts
  const monthlyData = new Map<string, number>()
  const categoryData = new Map<string, { name: string; total: number; color: string }>()

  expenses?.forEach((expense) => {
    // Monthly totals
    const monthKey = new Date(expense.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
    monthlyData.set(monthKey, (monthlyData.get(monthKey) || 0) + Number(expense.amount))

    // Category totals
    if (expense.category) {
      const existing = categoryData.get(expense.category_id) || {
        name: expense.category.name,
        total: 0,
        color: expense.category.color,
      }
      existing.total += Number(expense.amount)
      categoryData.set(expense.category_id, existing)
    }
  })

  const monthlyChartData = Array.from(monthlyData.entries()).map(([month, total]) => ({
    month,
    total,
  }))

  const categoryChartData = Array.from(categoryData.values())
    .sort((a, b) => b.total - a.total)

  // Calculate totals
  const totalSpent = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0
  const avgMonthly = monthlyChartData.length > 0 
    ? totalSpent / monthlyChartData.length 
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Insights into your spending patterns
        </p>
      </div>

      <AnalyticsCharts
        monthlyData={monthlyChartData}
        categoryData={categoryChartData}
        totalSpent={totalSpent}
        avgMonthly={avgMonthly}
        currency={currency}
      />
    </div>
  )
}
