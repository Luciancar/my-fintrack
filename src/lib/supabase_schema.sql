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

-- Row Level Security: users can only see/edit their own data
alter table transactions enable row level security;

create policy "Users manage own transactions"
  on transactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Index for fast queries
create index if not exists transactions_user_date on transactions(user_id, date desc);
