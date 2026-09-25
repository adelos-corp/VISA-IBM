-- VISA database schema
-- Migration 001 — initial schema

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  git_url TEXT,
  local_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_analyses (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  framework TEXT NOT NULL DEFAULT 'unknown',
  runtime TEXT NOT NULL DEFAULT 'unknown',
  port INTEGER NOT NULL DEFAULT 3000,
  health_path TEXT NOT NULL DEFAULT '/health',
  build_command TEXT NOT NULL DEFAULT '',
  env_vars_needed TEXT NOT NULL DEFAULT '[]',
  raw_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deployments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  status TEXT NOT NULL DEFAULT 'PENDING',
  attempt_number INTEGER NOT NULL DEFAULT 1,
  parent_deployment_id TEXT REFERENCES deployments(id),
  docker_image_id TEXT,
  container_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS deployment_stages (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL REFERENCES deployments(id),
  stage_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  started_at TEXT,
  completed_at TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS deployment_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  deployment_id TEXT NOT NULL REFERENCES deployments(id),
  source TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  content TEXT NOT NULL,
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_logs_deployment ON deployment_logs(deployment_id);

CREATE TABLE IF NOT EXISTS pre_check_reports (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL REFERENCES deployments(id),
  checks_json TEXT NOT NULL DEFAULT '[]',
  overall_status TEXT NOT NULL DEFAULT 'UNKNOWN',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS deployment_plans (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL REFERENCES deployments(id),
  plan_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL REFERENCES deployments(id),
  gate TEXT NOT NULL,
  decision TEXT NOT NULL,
  user_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS diagnoses (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL REFERENCES deployments(id),
  failure_type TEXT NOT NULL,
  root_cause TEXT NOT NULL,
  proposed_correction_json TEXT NOT NULL DEFAULT '{}',
  confidence REAL NOT NULL DEFAULT 0,
  rationale TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS correction_attempts (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL REFERENCES deployments(id),
  diagnosis_id TEXT NOT NULL REFERENCES diagnoses(id),
  patch_json TEXT NOT NULL DEFAULT '{}',
  validation_status TEXT NOT NULL DEFAULT 'PENDING',
  validation_notes TEXT,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS verifications (
  id TEXT PRIMARY KEY,
  deployment_id TEXT NOT NULL REFERENCES deployments(id),
  endpoint TEXT NOT NULL,
  http_status INTEGER,
  response_time_ms INTEGER,
  healthy INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  completed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT REFERENCES projects(id),
  deployment_id TEXT REFERENCES deployments(id),
  name TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT NOT NULL DEFAULT '',
  recorded_at TEXT NOT NULL DEFAULT (datetime('now'))
);
