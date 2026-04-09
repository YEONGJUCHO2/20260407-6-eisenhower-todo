-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Profiles
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tags
create table tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  color text not null default '#adc6ff',
  created_at timestamptz default now()
);
alter table tags enable row level security;
create policy "Users manage own tags" on tags for all using (auth.uid() = user_id);

-- Todos
create table todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  quadrant text not null check (quadrant in ('do','plan','delegate','delete')),
  date date not null,
  completed boolean default false,
  completed_at timestamptz,
  repeat text default 'none' check (repeat in ('none','daily','weekly','monthly','yearly')),
  repeat_days int[],
  repeat_date int,
  repeat_month int,
  start_time time,
  end_time time,
  memo text default '',
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table todos enable row level security;
create policy "Users manage own todos" on todos for all using (auth.uid() = user_id);

-- Todo tags (many-to-many)
create table todo_tags (
  todo_id uuid references todos(id) on delete cascade,
  tag_id uuid references tags(id) on delete cascade,
  primary key (todo_id, tag_id)
);
alter table todo_tags enable row level security;
create policy "Users manage own todo_tags" on todo_tags for all
  using (exists (select 1 from todos where todos.id = todo_tags.todo_id and todos.user_id = auth.uid()));

-- Subtasks
create table subtasks (
  id uuid primary key default gen_random_uuid(),
  todo_id uuid references todos(id) on delete cascade not null,
  title text not null,
  completed boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);
alter table subtasks enable row level security;
create policy "Users manage own subtasks" on subtasks for all
  using (exists (select 1 from todos where todos.id = subtasks.todo_id and todos.user_id = auth.uid()));

-- Templates
create table templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  items jsonb not null default '[]',
  created_at timestamptz default now()
);
alter table templates enable row level security;
create policy "Users manage own templates" on templates for all using (auth.uid() = user_id);

-- Achievements
create table achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null,
  unlocked_at timestamptz default now(),
  unique(user_id, type)
);
alter table achievements enable row level security;
create policy "Users manage own achievements" on achievements for all using (auth.uid() = user_id);
