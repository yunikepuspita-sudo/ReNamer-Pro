-- ============================================================
-- E-Pustaka Pemilu — Skema Supabase
-- Jalankan di Supabase Dashboard → SQL Editor → New query → Run.
-- ============================================================

-- 1) Tabel koleksi buku
create table if not exists public.books (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  author      text not null,
  publisher   text,
  type        text not null default 'buku',          -- 'buku' | 'majalah' | 'koran'
  category    text,
  themes      text[] default '{}',
  year        int,
  price       int default 0,                          -- Rupiah; 0 = gratis
  rating      numeric default 0,
  premium     boolean default false,
  cover       text[] default array['#1e3a8a','#3b82f6'],
  synopsis    text,
  pages       int default 0,
  pdf_url     text,
  created_at  timestamptz default now()
);

alter table public.books enable row level security;

-- Semua orang boleh MEMBACA katalog.
drop policy if exists "books_public_read" on public.books;
create policy "books_public_read"
  on public.books for select
  using (true);

-- Hanya pengguna terautentikasi (admin) yang boleh menulis.
drop policy if exists "books_admin_write" on public.books;
create policy "books_admin_write"
  on public.books for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 2) Riwayat transaksi (dipakai pada Fase 2 — pembayaran)
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id),
  book_id      uuid references public.books(id),
  kind         text default 'book',                   -- book | premium
  plan         text,                                  -- bulanan | tahunan (utk premium)
  amount       int not null,
  status       text not null default 'pending',       -- pending | paid | failed
  provider     text,                                  -- midtrans | xendit
  provider_ref text,
  created_at   timestamptz default now()
);

-- Idempoten: tambah kolom bila tabel orders sudah ada sebelumnya.
alter table public.orders add column if not exists id_str text unique;
alter table public.orders add column if not exists kind text default 'book';
alter table public.orders add column if not exists plan text;

alter table public.orders enable row level security;

-- Pengguna hanya melihat order miliknya sendiri.
drop policy if exists "orders_owner_read" on public.orders;
create policy "orders_owner_read"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "orders_owner_insert" on public.orders;
create policy "orders_owner_insert"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- ============================================================
-- 2b) State pengguna (pustaka, premium, progres) — sinkron lintas perangkat
-- ============================================================
create table if not exists public.user_state (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  library       text[] default '{}',
  premium       boolean default false,
  premium_until timestamptz,
  progress      jsonb default '{}'::jsonb,
  updated_at    timestamptz default now()
);

alter table public.user_state add column if not exists premium_until timestamptz;

alter table public.user_state enable row level security;

-- Tiap pengguna hanya boleh membaca & menulis barisnya sendiri.
drop policy if exists "user_state_owner_all" on public.user_state;
create policy "user_state_owner_all"
  on public.user_state for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ============================================================
-- 3) Storage bucket untuk PDF (publik agar bisa dibaca pengguna)
--    Jalankan ATAU buat manual di Storage → New bucket → "ebooks" (Public).
-- ============================================================
insert into storage.buckets (id, name, public)
values ('ebooks', 'ebooks', true)
on conflict (id) do nothing;

-- Publik boleh membaca file di bucket 'ebooks'.
drop policy if exists "ebooks_public_read" on storage.objects;
create policy "ebooks_public_read"
  on storage.objects for select
  using (bucket_id = 'ebooks');

-- Admin (terautentikasi) boleh mengunggah/menghapus.
drop policy if exists "ebooks_admin_write" on storage.objects;
create policy "ebooks_admin_write"
  on storage.objects for all
  using (bucket_id = 'ebooks' and auth.role() = 'authenticated')
  with check (bucket_id = 'ebooks' and auth.role() = 'authenticated');
