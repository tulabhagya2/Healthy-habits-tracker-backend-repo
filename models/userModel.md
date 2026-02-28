create extension if not exists "uuid-ossp";
create table usermodel(id uuid primary key default uuid_generate_v4(),
name text not null,
email text unique not null,
password text not null,
created_at timestamp default now());