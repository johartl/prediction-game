create type role_type as enum ('admin');

create table "user" (
  id serial,
  login text not null,
  password text not null,
  created_at timestamp with time zone,
  roles role_type[] not null default '{}',

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

create type match_type as enum ('group-phase', 'final-8', 'final-4', 'final-2', 'final', 'third-place-match');

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

create table prediction (
  user_id integer not null references "user" (id) on delete cascade,
  match_id integer not null references schedule (id) on delete cascade,
  tip_a integer not null,
  tip_b integer not null,
  points integer null default null,

  primary key (user_id, match_id)
);

create view ranking as (
  with ranking_tmp as (
    select
      u.id,
      u.login,
      sum(coalesce(p.points, 0)) as points,
      sum(case when p.tip_a = s.score_a and p.tip_b = s.score_b and
        s.score_a is not null and s.score_b is not null then 1 else 0 end) as predictions_correct
    from
      "user" u
      left join prediction p on u.id = p.user_id
      left join schedule s on s.id = p.match_id
    group by
      u.id,
      u.login
  )
  select
    id, login, points, predictions_correct,
    rank() over (order by points desc, predictions_correct desc) rank
  from ranking_tmp
  order by rank
);

create table prediction_champion (
  user_id integer not null references "user" (id) on delete cascade,
  team_id integer not null references team (id) on delete cascade,

  primary key (user_id)
);
