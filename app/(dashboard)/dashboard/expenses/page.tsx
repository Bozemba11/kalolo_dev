import { createClient } from "@/lib/supabase/server"
import { ExpensesList } from "@/components/expenses/expenses-list"
import { AddExpenseDialog } from "@/components/expenses/add-expense-dialog"
import type { Currency } from "@/lib/types"

export default async function ExpensesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const currency = (profile?.preferred_currency || "USD") as Currency

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*, category:categories(*)")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage your spending
          </p>
        </div>
        <AddExpenseDialog 
          categories={categories || []} 
          currency={currency}
          userId={user.id}
        />
      </div>

      <ExpensesList 
        expenses={expenses || []} 
        categories={categories || []}
        currency={currency}
      />
    </div>
  )
}
