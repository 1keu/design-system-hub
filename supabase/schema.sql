-- Design System Hub — Supabase Schema
-- Run this in the Supabase SQL editor
--
-- Account structure:
--   User → Workspace (複数所属可) → Project (複数) → project_state

-- ===== Workspaces =====
create table if not exists workspaces (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  slug               text not null unique,        -- URL-friendly name (例: acme-corp)
  stripe_customer_id text unique,                 -- Stripe Customer ID (Workspace作成時に生成)
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

alter table workspaces enable row level security;

-- メンバーであれば閲覧可能
create policy "members can view their workspaces"
  on workspaces for select
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = id
        and wm.user_id = auth.uid()
    )
  );

-- owner / admin のみ更新可能
create policy "admins can update workspace"
  on workspaces for update
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- ===== Workspace Members (User ↔ Workspace 中間テーブル) =====
create table if not exists workspace_members (
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id      uuid references auth.users(id) on delete cascade not null,
  role         text not null default 'member'
                 check (role in ('owner', 'admin', 'member', 'viewer')),
  invited_at   timestamptz default now(),
  joined_at    timestamptz,
  primary key (workspace_id, user_id)
);

alter table workspace_members enable row level security;

-- 同一Workspaceのメンバーは互いに見える
create policy "members can view workspace members"
  on workspace_members for select
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_id
        and wm.user_id = auth.uid()
    )
  );

-- owner / admin のみメンバーを追加・変更・削除できる
create policy "admins can manage workspace members"
  on workspace_members for all
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- ===== Projects =====
create table if not exists projects (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade not null,
  name         text not null default 'Untitled Project',
  created_by   uuid references auth.users(id) not null,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table projects enable row level security;

-- Workspaceメンバーはプロジェクトを閲覧可能
create policy "workspace members can view projects"
  on projects for select
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_id
        and wm.user_id = auth.uid()
    )
  );

-- member以上であれば作成・更新可能（viewerは不可）
create policy "members can create and update projects"
  on projects for insert with check (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'member')
    )
  );

create policy "members can update projects"
  on projects for update
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'member')
    )
  );

-- owner / admin のみ削除可能
create policy "admins can delete projects"
  on projects for delete
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- ===== Project State (colors + typography + components) =====
create table if not exists project_state (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid references projects(id) on delete cascade not null unique,
  colors      jsonb,
  typography  jsonb,
  components  jsonb not null default '[]',
  updated_at  timestamptz default now()
);

alter table project_state enable row level security;

-- Workspaceメンバーであれば閲覧可能
create policy "workspace members can view project state"
  on project_state for select
  using (
    exists (
      select 1 from projects p
      join workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = project_id
        and wm.user_id = auth.uid()
    )
  );

-- member以上であれば編集可能
create policy "members can edit project state"
  on project_state for all
  using (
    exists (
      select 1 from projects p
      join workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = project_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin', 'member')
    )
  );

-- ===== Auto-update updated_at =====
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_workspaces_updated_at
  before update on workspaces
  for each row execute function update_updated_at();

create trigger trg_projects_updated_at
  before update on projects
  for each row execute function update_updated_at();

create trigger trg_project_state_updated_at
  before update on project_state
  for each row execute function update_updated_at();

-- ===== Subscriptions (Stripe連携) =====
-- plan / status は Stripe Webhook 経由で更新する
create table if not exists subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  workspace_id           uuid references workspaces(id) on delete cascade not null unique,
  plan                   text not null default 'free'
                           check (plan in ('free', 'pro', 'enterprise')),
  status                 text not null default 'active'
                           check (status in ('active', 'trialing', 'past_due', 'canceled', 'unpaid')),
  stripe_subscription_id text unique,             -- Stripe Subscription ID (Freeはnull)
  trial_ends_at          timestamptz,             -- 試用期間終了日
  current_period_end     timestamptz,             -- 現在の契約期間終了日
  cancel_at_period_end   boolean default false,   -- 期間終了時にキャンセル
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

alter table subscriptions enable row level security;

-- Workspaceのowner / adminのみ閲覧可能
create policy "admins can view subscription"
  on subscriptions for select
  using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- 更新はEdge Function（Stripe Webhook）のみ（service_roleで実行）

create trigger trg_subscriptions_updated_at
  before update on subscriptions
  for each row execute function update_updated_at();

-- ===== Realtime =====
-- ALTER PUBLICATION supabase_realtime ADD TABLE project_state;

-- ===== Edge Function: stripe-webhook =====
-- Stripe からのイベントを受信し subscriptions を更新する
-- 必要なイベント:
--   customer.subscription.created
--   customer.subscription.updated
--   customer.subscription.deleted
--   invoice.payment_failed
-- 実装場所: supabase/functions/stripe-webhook/index.ts

-- ===== Migration note =====
-- Phase 1 → Phase 2 移行時:
--   1. ユーザーのlocalStorage状態を読み取り
--   2. デフォルトWorkspace（slug = user_id）を作成
--   3. そのWorkspace内にProject "My Design System" を作成
--   4. localStorageのcolors/typography/componentsをproject_stateに移行
