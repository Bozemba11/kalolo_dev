import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { formatCurrency, type Currency, type Goal } from "@/lib/types"
import { ArrowRight, Target } from "lucide-react"

interface GoalsProgressProps {
  goals: Goal[]
  currency: Currency
}

export function GoalsProgress({ goals, currency }: GoalsProgressProps) {
  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">No active goals yet</p>
            <Button asChild>
              <Link href="/dashboard/goals">Set your first goal</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Goals</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/goals" className="gap-1">
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {goals.map((goal) => {
            const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100
            const remaining = Number(goal.target_amount) - Number(goal.current_amount)
            
            return (
              <div key={goal.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{goal.name}</p>
                  <span className="text-sm text-muted-foreground">
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatCurrency(Number(goal.current_amount), currency)} saved
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(remaining, currency)} to go
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
