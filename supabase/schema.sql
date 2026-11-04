-- =====================================================================
-- LirePlus : schéma de la base de données (Supabase / PostgreSQL)
-- À exécuter une fois dans Supabase : SQL Editor → New query → coller → Run.
-- Puis exécuter seed.sql pour ajouter les mentors de démonstration.
-- =====================================================================

-- ---------- Profils (mentors et mentorés) ----------
create table if not exists public.profiles (
  id             uuid primary key default gen_random_uuid(),
  -- null pour les mentors de démonstration (sans compte)
  user_id        uuid unique references auth.users (id) on delete cascade,
  role           text not null default 'mentore' check (role in ('mentore', 'mentor')),
  nom            text not null default 'Nouvel utilisateur',
  ville          text not null default '',
  niveau         text not null default 'Étudiant',
  domaines       text[] not null default '{}',
  competences    text[] not null default '{}',
  besoins        text not null default '',
  titre          text,
  organisation   text,
  experience     int,
  langues        text[] not null default '{Français}',
  disponibilites text[] not null default '{}',
  couleur        text,
  created_at     timestamptz not null default now()
);

-- Identifiant du profil de l'utilisateur connecté
create or replace function public.mon_profil_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select id from public.profiles where user_id = auth.uid()
$$;

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, nom, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'nom', ''), split_part(new.email, '@', 1)),
    case when new.raw_user_meta_data ->> 'role' = 'mentor' then 'mentor' else 'mentore' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Séances de mentorat ----------
create table if not exists public.seances (
  id          uuid primary key default gen_random_uuid(),
  mentor_id   uuid not null references public.profiles (id) on delete cascade,
  mentore_id  uuid not null references public.profiles (id) on delete cascade,
  date        timestamptz not null,
  sujet       text not null,
  format      text not null default 'Visio' check (format in ('Visio', 'Chat', 'Présentiel')),
  statut      text not null default 'planifiee' check (statut in ('planifiee', 'terminee', 'annulee')),
  note        int check (note between 1 and 5),
  commentaire text,
  created_at  timestamptz not null default now()
);

-- ---------- Messages ----------
create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  expediteur_id   uuid not null references public.profiles (id) on delete cascade,
  destinataire_id uuid not null references public.profiles (id) on delete cascade,
  texte           text not null check (length(texte) between 1 and 4000),
  created_at      timestamptz not null default now()
);
create index if not exists messages_participants on public.messages (expediteur_id, destinataire_id, created_at);

-- ---------- Objectifs et progression ----------
create table if not exists public.objectifs (
  id              uuid primary key default gen_random_uuid(),
  proprietaire_id uuid not null references public.profiles (id) on delete cascade,
  mentor_id       uuid references public.profiles (id) on delete set null,
  titre           text not null,
  echeance        timestamptz not null,
  etapes          jsonb not null default '[]',
  created_at      timestamptz not null default now()
);

-- ---------- Opportunités ----------
create table if not exists public.opportunites (
  id           uuid primary key default gen_random_uuid(),
  titre        text not null,
  type         text not null,
  organisation text not null,
  lieu         text not null default '',
  date_limite  date not null,
  domaine      text not null,
  description  text not null default '',
  publie_par   text not null,
  auteur_id    uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ---------- Mentors favoris ----------
create table if not exists public.favoris (
  profil_id uuid not null references public.profiles (id) on delete cascade,
  mentor_id uuid not null references public.profiles (id) on delete cascade,
  primary key (profil_id, mentor_id)
);

-- =====================================================================
-- Sécurité : Row Level Security (chacun n'accède qu'à ce qui le concerne)
-- =====================================================================
alter table public.profiles     enable row level security;
alter table public.seances      enable row level security;
alter table public.messages     enable row level security;
alter table public.objectifs    enable row level security;
alter table public.opportunites enable row level security;
alter table public.favoris      enable row level security;

-- Profils : visibles par tous les utilisateurs connectés, modifiables par leur propriétaire
drop policy if exists "profils lisibles" on public.profiles;
create policy "profils lisibles" on public.profiles for select to authenticated using (true);
drop policy if exists "profil modifiable par son propriétaire" on public.profiles;
create policy "profil modifiable par son propriétaire" on public.profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Séances : visibles et modifiables par le mentor et le mentoré concernés
drop policy if exists "séances des participants" on public.seances;
create policy "séances des participants" on public.seances for select to authenticated
  using (public.mon_profil_id() in (mentor_id, mentore_id));
drop policy if exists "réserver une séance" on public.seances;
create policy "réserver une séance" on public.seances for insert to authenticated
  with check (mentore_id = public.mon_profil_id() and mentor_id <> mentore_id);
drop policy if exists "modifier ses séances" on public.seances;
create policy "modifier ses séances" on public.seances for update to authenticated
  using (public.mon_profil_id() in (mentor_id, mentore_id))
  with check (public.mon_profil_id() in (mentor_id, mentore_id));

-- Messages : lisibles par l'expéditeur et le destinataire, envoyés en son propre nom
drop policy if exists "messages des participants" on public.messages;
create policy "messages des participants" on public.messages for select to authenticated
  using (public.mon_profil_id() in (expediteur_id, destinataire_id));
drop policy if exists "envoyer un message" on public.messages;
create policy "envoyer un message" on public.messages for insert to authenticated
  with check (expediteur_id = public.mon_profil_id());

-- Objectifs : privés
drop policy if exists "objectifs privés" on public.objectifs;
create policy "objectifs privés" on public.objectifs for all to authenticated
  using (proprietaire_id = public.mon_profil_id())
  with check (proprietaire_id = public.mon_profil_id());

-- Opportunités : lisibles par tous, publiées en son propre nom
drop policy if exists "opportunités lisibles" on public.opportunites;
create policy "opportunités lisibles" on public.opportunites for select to authenticated using (true);
drop policy if exists "publier une opportunité" on public.opportunites;
create policy "publier une opportunité" on public.opportunites for insert to authenticated
  with check (auteur_id = public.mon_profil_id());

-- Favoris : privés
drop policy if exists "favoris privés" on public.favoris;
create policy "favoris privés" on public.favoris for all to authenticated
  using (profil_id = public.mon_profil_id())
  with check (profil_id = public.mon_profil_id());

-- =====================================================================
-- Temps réel : messages et séances
-- =====================================================================
do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null;
end $$;
do $$
begin
  alter publication supabase_realtime add table public.seances;
exception when duplicate_object then null;
end $$;
