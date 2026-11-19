create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  icon text default '',
  image text default '',
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  specifications jsonb default '{}'::jsonb,
  price numeric(12,2) not null,
  original_price numeric(12,2) default 0,
  discount integer default 0,
  stock integer default 100,
  sold integer default 0,
  brand text default '',
  images jsonb default '[]'::jsonb,
  rating numeric(3,1) default 0,
  review_count integer default 0,
  sizes jsonb default '[]'::jsonb,
  colors jsonb default '[]'::jsonb,
  is_flash_sale boolean default false,
  flash_sale_end timestamptz,
  category_id uuid references public.categories(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  author text not null,
  rating integer not null,
  comment text not null,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  tracking_number text not null unique,
  full_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  delivery_method text default 'door',
  payment_method text default 'cod',
  status text default 'Pending',
  subtotal numeric(12,2) not null,
  delivery_fee numeric(12,2) default 0,
  total numeric(12,2) not null,
  user_id uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  name text not null,
  image text default '',
  price numeric(12,2) not null,
  quantity integer not null
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Public can read catalog" on public.categories for select using (true);
create policy "Public can read products" on public.products for select using (true);
create policy "Public can read reviews" on public.reviews for select using (true);
create policy "Users can create orders" on public.orders for insert to authenticated with check (auth.uid() = user_id or user_id is null);
create policy "Users can read own orders" on public.orders for select to authenticated using (auth.uid() = user_id);
create policy "Users can create order items" on public.order_items for insert to authenticated with check (true);
create policy "Users can read own order items" on public.order_items for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
