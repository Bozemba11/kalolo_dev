import { createClient } from "@/lib/supabase/server"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { CurrencySettings } from "@/components/settings/currency-settings"
import { CategoriesSettings } from "@/components/settings/categories-settings"
import type { Currency } from "@/lib/types"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true })

  const currency = (profile?.preferred_currency || "USD") as Currency

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="grid gap-6">
        <ProfileSettings 
          userId={user.id}
          email={user.email || ""}
          fullName={profile?.full_name || ""}
        />
        
        <CurrencySettings 
          userId={user.id}
          currentCurrency={currency}
        />

        <CategoriesSettings
          userId={user.id}
          categories={categories || []}
        />
      </div>
    </div>
  )
}
