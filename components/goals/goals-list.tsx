"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatCurrency, CURRENCY_SYMBOLS, type Currency, type Goal } from "@/lib/types"
import { Target, Plus, Check, Trash2, Loader2, Trophy } from "lucide-react"

interface GoalsListProps {
  activeGoals: Goal[]
  completedGoals: Goal[]
  currency: Currency
}

export function GoalsList({ activeGoals, completedGoals, currency }: GoalsListProps) {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [addAmount, setAddAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleAddFunds(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedGoal || !addAmount) return

    setIsLoading(true)

    const newAmount = Number(selectedGoal.current_amount) + parseFloat(addAmount)
    const isCompleted = newAmount >= Number(selectedGoal.target_amount)

    const { error } = await supabase
      .from("goals")
      .update({
        current_amount: newAmount,
        status: isCompleted ? "completed" : "active",
      })
      .eq("id", selectedGoal.id)

    setIsLoading(false)

    if (!error) {
      setSelectedGoal(null)
      setAddAmount("")
      router.refresh()
    }
  }

  async function handleDelete() {
    if (!deleteId) return

    await supabase.from("goals").delete().eq("id", deleteId)
    setDeleteId(null)
    router.refresh()
  }

  if (activeGoals.length === 0 && completedGoals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No goals yet</h3>
          <p className="text-muted-foreground">
            Start by setting your first financial goal.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {activeGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Active Goals</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeGoals.map((goal) => {
              const progress =
                (Number(goal.current_amount) / Number(goal.target_amount)) * 100
              const remaining =
                Number(goal.target_amount) - Number(goal.current_amount)
              const daysLeft = goal.deadline
                ? Math.ceil(
                    (new Date(goal.deadline).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )
                : null

              return (
                <Card key={goal.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => setDeleteId(goal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <h3 className="font-semibold mb-1">{goal.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {daysLeft !== null && daysLeft > 0
                        ? `${daysLeft} days left`
                        : daysLeft !== null && daysLeft <= 0
                          ? "Deadline passed"
                          : "No deadline"}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span>{formatCurrency(Number(goal.current_amount), currency)}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(Number(goal.target_amount), currency)}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">
                        {progress.toFixed(0)}% complete
                      </p>
                    </div>

                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setSelectedGoal(goal)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Funds
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Completed Goals</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedGoals.map((goal) => (
              <Card key={goal.id} className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" />
                      Completed
                    </div>
                  </div>

                  <h3 className="font-semibold mb-1">{goal.name}</h3>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(Number(goal.target_amount), currency)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Dialog open={!!selectedGoal} onOpenChange={() => setSelectedGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds to {selectedGoal?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddFunds} className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Current Progress</p>
              <p className="text-lg font-semibold">
                {formatCurrency(Number(selectedGoal?.current_amount || 0), currency)} /{" "}
                {formatCurrency(Number(selectedGoal?.target_amount || 0), currency)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Amount to Add ({CURRENCY_SYMBOLS[currency]})
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedGoal(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || !addAmount}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Funds"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete goal?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              goal and all its progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
