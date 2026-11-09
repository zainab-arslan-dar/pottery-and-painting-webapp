create table if not exists products (
  id serial primary key,
  title text not null,
  category text not null check (category in ('Vases','Canvases','Other')),
  price numeric(10,2) not null check (price >= 0),
  description text,
  image text,
  sold boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists inquiries (
  id serial primary key,
  name text not null,
  email text not null,
  product_id int references products(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);
