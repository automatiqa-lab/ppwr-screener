-- Generated from src/store/schema.js. Do not edit by hand.
-- Regenerate with: node scripts/generate-migration.js
create table if not exists "ppwr_vendor" (
  "vendor_id" uuid primary key,
  "legal_name" text,
  "contact_email" text,
  "contact_name" text,
  "country" text,
  "language" text,
  "created_at_ms" bigint,
  "id" bigserial,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "ppwr_packaging_item" (
  "item_id" uuid primary key,
  "vendor_id" uuid,
  "internal_sku" text,
  "description" text,
  "packaging_level" text,
  "primary_material" text,
  "food_contact" boolean,
  "intended_use" text,
  "active" boolean,
  "created_at_ms" bigint,
  "vendor_sku_key" text,
  "id" bigserial,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create unique index if not exists "ppwr_packaging_item_vendor_sku_key_uq" on "ppwr_packaging_item" ("vendor_id", "internal_sku");
create index if not exists "ppwr_packaging_item_vendor_id_idx" on "ppwr_packaging_item" ("vendor_id");

create table if not exists "ppwr_campaign" (
  "campaign_id" uuid primary key,
  "name" text,
  "ruleset_version" text,
  "ruleset_sha256" text,
  "due_date" date,
  "reminder_days_csv" text,
  "expiry_days" integer,
  "owner_email" text,
  "created_at_ms" bigint,
  "id" bigserial,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists "ppwr_campaign_item" (
  "campaign_item_id" uuid primary key,
  "campaign_id" uuid,
  "item_id" uuid,
  "state" text,
  "token_hash" text,
  "token_expires_at_ms" bigint,
  "invited_at_ms" bigint,
  "last_reminder_at_ms" bigint,
  "reminder_count" integer,
  "current_submission_id" uuid,
  "resume_page" integer,
  "next_revision" integer,
  "lock_token" text,
  "lock_until_ms" bigint,
  "updated_at_ms" bigint,
  "campaign_item_key" text,
  "id" bigserial,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create unique index if not exists "ppwr_campaign_item_campaign_item_key_uq" on "ppwr_campaign_item" ("campaign_id", "item_id");
create index if not exists "ppwr_campaign_item_campaign_id_idx" on "ppwr_campaign_item" ("campaign_id");
create index if not exists "ppwr_campaign_item_item_id_idx" on "ppwr_campaign_item" ("item_id");
create index if not exists "ppwr_campaign_item_current_submission_id_idx" on "ppwr_campaign_item" ("current_submission_id");

create table if not exists "ppwr_submission" (
  "submission_id" uuid primary key,
  "campaign_item_id" uuid,
  "revision" integer,
  "commit_state" text,
  "submitted_at_ms" bigint,
  "evaluated_at_ms" bigint,
  "submitted_by" text,
  "raw_payload_json" jsonb,
  "raw_payload_uri" text,
  "normalised_json" jsonb,
  "normalised_uri" text,
  "verdict" text,
  "ruleset_version" text,
  "engine_version" text,
  "findings_sha256" text,
  "engine_run_ms" integer,
  "submission_key" text,
  "id" bigserial,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create unique index if not exists "ppwr_submission_submission_key_uq" on "ppwr_submission" ("campaign_item_id", "revision");
create index if not exists "ppwr_submission_campaign_item_id_idx" on "ppwr_submission" ("campaign_item_id");

create table if not exists "ppwr_document" (
  "document_id" uuid primary key,
  "submission_id" uuid,
  "doc_type" text,
  "filename" text,
  "mime_type" text,
  "byte_size" integer,
  "storage_uri" text,
  "sha256" text,
  "extracted_json" jsonb,
  "extracted_uri" text,
  "extraction_model_id" text,
  "extraction_at_ms" bigint,
  "id" bigserial,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists "ppwr_document_submission_id_idx" on "ppwr_document" ("submission_id");

create table if not exists "ppwr_finding" (
  "finding_id" uuid primary key,
  "submission_id" uuid,
  "seq" integer,
  "check_id" text,
  "check_type" text,
  "severity" text,
  "status" text,
  "field_ref" text,
  "message" text,
  "evidence_json" jsonb,
  "evidence_uri" text,
  "ruleset_version" text,
  "id" bigserial,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists "ppwr_finding_submission_id_idx" on "ppwr_finding" ("submission_id");

create table if not exists "ppwr_event_log" (
  "event_uid" uuid primary key,
  "campaign_item_id" uuid,
  "submission_id" uuid,
  "event_type" text,
  "actor" text,
  "payload_json" jsonb,
  "payload_uri" text,
  "created_at_ms" bigint,
  "id" bigserial,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists "ppwr_event_log_campaign_item_id_idx" on "ppwr_event_log" ("campaign_item_id");
create index if not exists "ppwr_event_log_submission_id_idx" on "ppwr_event_log" ("submission_id");

create table if not exists "ppwr_review" (
  "review_id" uuid primary key,
  "submission_id" uuid,
  "finding_id" uuid,
  "reviewer" text,
  "decision" text,
  "rationale" text,
  "rule_feedback" text,
  "decided_at_ms" bigint,
  "id" bigserial,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create index if not exists "ppwr_review_submission_id_idx" on "ppwr_review" ("submission_id");
create index if not exists "ppwr_review_finding_id_idx" on "ppwr_review" ("finding_id");

create table if not exists "ppwr_draft" (
  "draft_id" uuid primary key,
  "campaign_item_id" uuid,
  "page" integer,
  "answers_json" jsonb,
  "answers_uri" text,
  "updated_at_ms" bigint,
  "draft_key" text,
  "id" bigserial,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create unique index if not exists "ppwr_draft_draft_key_uq" on "ppwr_draft" ("campaign_item_id");
create index if not exists "ppwr_draft_campaign_item_id_idx" on "ppwr_draft" ("campaign_item_id");

create table if not exists "ppwr_meta" (
  "meta_id" uuid primary key,
  "key" text,
  "value" text,
  "updated_at_ms" bigint,
  "meta_key" text,
  "id" bigserial,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create unique index if not exists "ppwr_meta_meta_key_uq" on "ppwr_meta" ("key");
