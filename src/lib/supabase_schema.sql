-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- Transactions table
create table if not exists transactions (
  id         text primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  type       text not null check (type in ('income', 'expense')),
  category_id text not null,
  amount     bigint not null check (amount > 0),
  date       date not null,
  note       text default '',
  created_at timestamptz default now()
);

alter table transactions enable row level security;
create policy "Users manage own transactions"
  on transactions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
create index if not exists transactions_user_date on transactions(user_id, date desc);

-- Savings plans table
create table if not exists savings_plans (
  id            text primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  name          text not null,
  icon          text default '🎯',
  target_amount bigint not null check (target_amount > 0),
  saved_amount  bigint default 0,
  deadline      date,
  color         text default '#6366f1',
  note          text default '',
  created_at    timestamptz default now()
);

alter table savings_plans enable row level security;
create policy "Users manage own savings_plans"
  on savings_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
