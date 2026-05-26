create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

insert into public.modules (key, name)
values
  ('crm', 'CRM'),
  ('appointments', 'Appointments'),
  ('quotes', 'Quotes'),
  ('inventory', 'Inventory'),
  ('tasks', 'Tasks'),
  ('documents', 'Documents'),
  ('ai_assistant', 'AI Assistant'),
  ('reports', 'Reports')
on conflict (key) do nothing;
