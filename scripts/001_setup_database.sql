-- Fedha Yako Database Schema
-- Personal Finance Management System

-- =====================
-- PROFILES TABLE
-- =====================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  preferred_currency text default 'KES' check (preferred_currency in ('KES', 'USD', 'EUR')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- =====================
-- CATEGORIES TABLE
-- =====================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text default 'folder',
  color text default '#6366f1',
  is_default boolean default false,
  created_at timestamptz default now()
);

alter table public.categories enable row level security;

create policy "categories_select_own" on public.categories for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories for update using (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories for delete using (auth.uid() = user_id);

-- =====================
-- EXPENSES TABLE
-- =====================
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  description text not null,
  amount decimal(12,2) not null,
  currency text default 'KES' check (currency in ('KES', 'USD', 'EUR')),
  expense_date date not null default current_date,
  is_recurring boolean default false,
  recurring_frequency text check (recurring_frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.expenses enable row level security;

create policy "expenses_select_own" on public.expenses for select using (auth.uid() = user_id);
create policy "expenses_insert_own" on public.expenses for insert with check (auth.uid() = user_id);
create policy "expenses_update_own" on public.expenses for update using (auth.uid() = user_id);
create policy "expenses_delete_own" on public.expenses for delete using (auth.uid() = user_id);

-- =====================
-- GOALS TABLE
-- =====================
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  target_amount decimal(12,2) not null,
  current_amount decimal(12,2) default 0,
  currency text default 'KES' check (currency in ('KES', 'USD', 'EUR')),
  target_date date,
  status text default 'active' check (status in ('active', 'completed', 'paused')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.goals enable row level security;

create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id);
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

-- =====================
-- BUDGETS TABLE
-- =====================
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete cascade,
  amount decimal(12,2) not null,
  currency text default 'KES' check (currency in ('KES', 'USD', 'EUR')),
  period text default 'monthly' check (period in ('weekly', 'monthly', 'yearly')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.budgets enable row level security;

create policy "budgets_select_own" on public.budgets for select using (auth.uid() = user_id);
create policy "budgets_insert_own" on public.budgets for insert with check (auth.uid() = user_id);
create policy "budgets_update_own" on public.budgets for update using (auth.uid() = user_id);
create policy "budgets_delete_own" on public.budgets for delete using (auth.uid() = user_id);

-- =====================
-- TRIGGER: Auto-create profile on signup
-- =====================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;

  -- Create default categories for new user
  insert into public.categories (user_id, name, icon, color, is_default) values
    (new.id, 'Food & Dining', 'utensils', '#ef4444', true),
    (new.id, 'Transportation', 'car', '#f97316', true),
    (new.id, 'Shopping', 'shopping-bag', '#eab308', true),
    (new.id, 'Entertainment', 'film', '#22c55e', true),
    (new.id, 'Bills & Utilities', 'zap', '#3b82f6', true),
    (new.id, 'Healthcare', 'heart', '#ec4899', true),
    (new.id, 'Education', 'book-open', '#8b5cf6', true),
    (new.id, 'Other', 'more-horizontal', '#6b7280', true);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =====================
-- INDEXES for performance
-- =====================
create index if not exists idx_expenses_user_date on public.expenses(user_id, expense_date desc);
create index if not exists idx_expenses_category on public.expenses(category_id);
create index if not exists idx_goals_user_status on public.goals(user_id, status);
create index if not exists idx_categories_user on public.categories(user_id);
