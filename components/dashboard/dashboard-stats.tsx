import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency, type Currency } from "@/lib/types"
import { TrendingDown, TrendingUp, Receipt, Target, Calendar } from "lucide-react"

interface DashboardStatsProps {
  totalSpent: number
  expenseCount: number
  avgPerDay: number
  monthlyChange: number
  currency: Currency
  goalsCount: number
}

export function DashboardStats({
  totalSpent,
  expenseCount,
  avgPerDay,
  monthlyChange,
  currency,
  goalsCount,
}: DashboardStatsProps) {
  const stats = [
    {
      name: "Total Spent",
      value: formatCurrency(totalSpent, currency),
      change: monthlyChange,
      icon: Receipt,
      description: "This month",
    },
    {
      name: "Transactions",
      value: expenseCount.toString(),
      icon: Calendar,
      description: "This month",
    },
    {
      name: "Daily Average",
      value: formatCurrency(avgPerDay, currency),
      icon: TrendingUp,
      description: "Per day",
    },
    {
      name: "Active Goals",
      value: goalsCount.toString(),
      icon: Target,
      description: "In progress",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              {stat.change !== undefined && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    stat.change >= 0 ? "text-destructive" : "text-green-600"
                  }`}
                >
                  {stat.change >= 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {Math.abs(stat.change).toFixed(1)}%
                </div>
              )}
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.name}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
