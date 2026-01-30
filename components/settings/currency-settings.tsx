"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { type Currency, CURRENCY_SYMBOLS } from "@/lib/types"
import { Loader2, Globe } from "lucide-react"

interface CurrencySettingsProps {
  userId: string
  currentCurrency: Currency
}

const currencies: { value: Currency; label: string }[] = [
  { value: "USD", label: `US Dollar (${CURRENCY_SYMBOLS.USD})` },
  { value: "EUR", label: `Euro (${CURRENCY_SYMBOLS.EUR})` },
  { value: "KES", label: `Kenyan Shilling (${CURRENCY_SYMBOLS.KES})` },
]

export function CurrencySettings({ userId, currentCurrency }: CurrencySettingsProps) {
  const [currency, setCurrency] = useState<Currency>(currentCurrency)
  const [isLoading, setIsLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setSaved(false)

    await supabase
      .from("profiles")
      .update({ preferred_currency: currency })
      .eq("id", userId)

    setIsLoading(false)
    setSaved(true)
    router.refresh()

    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Currency</CardTitle>
            <CardDescription>Choose your preferred currency</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Preferred Currency</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will be used for displaying amounts throughout the app
            </p>
          </div>

          <Button type="submit" disabled={isLoading || currency === currentCurrency}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              "Saved!"
            ) : (
              "Save Changes"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
