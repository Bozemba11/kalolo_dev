import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency, type Currency, type ExpenseWithCategory } from "@/lib/types"
import { ArrowRight, Receipt } from "lucide-react"

interface RecentExpensesProps {
  expenses: ExpenseWithCategory[]
  currency: Currency
}

export function RecentExpenses({ expenses, currency }: RecentExpensesProps) {
  if (expenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Receipt className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">No expenses recorded yet</p>
            <Button asChild>
              <Link href="/dashboard/expenses">Add your first expense</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Expenses</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/expenses" className="gap-1">
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                  style={{ backgroundColor: `${expense.category?.color}20` }}
                >
                  {expense.category?.icon || "💰"}
                </div>
                <div>
                  <p className="font-medium">{expense.description || expense.category?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(expense.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <p className="font-semibold text-destructive">
                -{formatCurrency(Number(expense.amount), currency)}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
