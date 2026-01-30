export type Currency = "USD" | "EUR" | "KES"

export interface Profile {
  id: string
  full_name: string | null
  preferred_currency: Currency
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  is_default: boolean
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  category_id: string
  amount: number
  currency: Currency
  description: string | null
  date: string
  is_recurring: boolean
  recurring_interval: "daily" | "weekly" | "monthly" | "yearly" | null
  created_at: string
  updated_at: string
  category?: Category
}

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  currency: Currency
  deadline: string | null
  status: "active" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  amount: number
  currency: Currency
  period: "weekly" | "monthly" | "yearly"
  created_at: string
  updated_at: string
  category?: Category
}

export interface ExpenseWithCategory extends Expense {
  category: Category
}

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  KES: "KSh"
}

export const CURRENCY_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  KES: 153.50
}

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
  return `${symbol}${formatted}`
}

export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  const inUSD = amount / CURRENCY_RATES[from]
  return inUSD * CURRENCY_RATES[to]
}
