-- RUSH 5OUR — the database (PostgreSQL).
--
-- Apply with `npm run db:migrate`, which runs this file against
-- DATABASE_URL. Every statement is safe to run again: tables and indexes
-- are only created when missing, so the same command brings a new database
-- up and leaves an existing one as it is. Later changes go at the end as
-- further `if not exists` statements.

-- Members. Email and username are unique regardless of letter case.
create table if not exists users (
  id                bigserial primary key,
  name              text        not null,
  email             text        not null,
  username          text        not null,
  password_hash     text        not null,
  -- The member's own code, e.g. "R5-7KQ2MX" (Phase 3.2: referrals, QR).
  rush_code         text        not null,
  -- "Send me updates about hunts, drops & opportunities."
  updates           boolean     not null default false,
  -- Null until the member clicks the link in their verification email.
  email_verified_at timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index if not exists users_email_key    on users (lower(email));
create unique index if not exists users_username_key on users (lower(username));
create unique index if not exists users_rush_code_key on users (rush_code);

-- Signed-in browsers. Only a hash of each session token is stored, so the
-- table alone can't be used to sign in as anyone.
create table if not exists sessions (
  token_hash text        primary key,
  user_id    bigint      not null references users (id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists sessions_user_idx on sessions (user_id);

-- One-time links sent by email: verifying an address, resetting a
-- password. Hashed like sessions; each is deleted when used.
create table if not exists auth_tokens (
  token_hash text        primary key,
  user_id    bigint      not null references users (id) on delete cascade,
  purpose    text        not null check (purpose in ('verify-email', 'reset-password')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists auth_tokens_user_idx on auth_tokens (user_id, purpose);
