alter table public.products add column if not exists vendor_id uuid;
alter table public.products add column if not exists status text default 'approved';

create table if not exists public.vendor_booths (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid unique references auth.users(id),
  business_name text not null,
  slug text unique not null,
  phone text,
  username text unique,
  logo_url text,
  payment_url text,
  description text,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role text default 'customer',
  updated_at timestamptz default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_vendor_fk'
  ) then
    alter table public.products add constraint products_vendor_fk foreign key (vendor_id) references public.vendor_booths(id);
  end if;
end $$;

alter table public.vendor_booths enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Public can read approved booths" on public.vendor_booths;
drop policy if exists "Vendors can manage own booth" on public.vendor_booths;
drop policy if exists "Profiles are public to users" on public.profiles;
drop policy if exists "Users manage own profile" on public.profiles;
drop policy if exists "Public avatar read" on storage.objects;
drop policy if exists "Users upload avatars" on storage.objects;
drop policy if exists "Public vendor product read" on storage.objects;
drop policy if exists "Vendors upload products" on storage.objects;

create policy "Public can read approved booths" on public.vendor_booths for select using (status = 'approved');
create policy "Vendors can manage own booth" on public.vendor_booths for all to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "Profiles are public to users" on public.profiles for select using (true);
create policy "Users manage own profile" on public.profiles for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

insert into storage.buckets (id, name, public) values ('avatars','avatars',true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('vendor-products','vendor-products',true) on conflict (id) do nothing;

create policy "Public avatar read" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users upload avatars" on storage.objects for insert to authenticated with check (bucket_id = 'avatars');
create policy "Public vendor product read" on storage.objects for select using (bucket_id = 'vendor-products');
create policy "Vendors upload products" on storage.objects for insert to authenticated with check (bucket_id = 'vendor-products');
