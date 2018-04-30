create table "user" (
  id serial,
  username text not null,
  pwhash text not null,
  pwsalt text not null,
  created_at timestamp with time zone,

  primary key (id)
);

create type team_group as enum ('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h');

create table team (
  id serial,
  name text not null,
  country_code text null default null,
  "group" team_group null default null,

  primary key (id)
);

create type match_type as enum ('group-phase', 'final-8', 'final-4', 'final-2', 'final');

create table schedule (
  id serial,
  team_a integer null default null references team (id) on delete set null,
  team_b integer null default null references team (id) on delete set null,
  time timestamp with time zone null default null,
  type match_type null default null,
  score_a integer null default null,
  score_b integer null default null,

  primary key (id)
);

create table tip (
  user_id integer not null references "user" (id) on delete cascade,
  match_id integer not null references schedule (id) on delete cascade,
  score_a integer not null,
  score_b integer not null,
  points integer null default null,

  primary key (user_id, match_id)
);

create view ranking as (
  select
    u.id,
    rank() over (partition by u.id order by sum(t.points) desc) rank,
    u.username,
    sum(t.points) as score
  from
    "user" u,
    tip t,
    schedule s
  where
    u.id = t.user_id and
    s.id = t.match_id and
    t.points <> null
  group by
    u.id,
    u.username
  order by rank
);
