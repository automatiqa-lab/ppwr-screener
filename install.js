#!/usr/bin/env node
'use strict';

/**
 * Installs the PPWR Screener on your own n8n.
 *
 * Twelve workflows that call each other by name, eleven tables with a hundred and twelve columns
 * between them, and sixty references to the store alone. Doing that by hand is an afternoon and a
 * typo. This is the afternoon.
 *
 * What it does, in order:
 *
 *   1. Creates the eleven Data Tables the store writes to, and leaves alone any that exist.
 *   2. Pushes the twelve workflows, or updates them if they are already there by name.
 *   3. Goes back over them and points every sub-workflow reference at the copy it just created.
 *
 * The third step is separate because it has to be: half the references point at workflows that do
 * not exist until the second step finishes.
 *
 * No dependencies, nothing to install. Node 20 or newer.
 *
 *   N8N_URL=https://your-n8n N8N_API_KEY=... node install.js
 *   node install.js --tables-only     just the store
 *   node install.js --dry-run         say what it would do, change nothing
 *
 * Idempotent. Run it again after pulling a new release and it updates in place.
 *
 * Afterwards you attach three credentials by hand, because an API key cannot create those. The
 * workflows show empty slots where they belong.
 */

const fs = require('node:fs');
const path = require('node:path');

const TABLES = [
  {
    "entity": "vendor",
    "name": "ppwr_vendor",
    "columns": [
      {
        "name": "vendor_id",
        "type": "string"
      },
      {
        "name": "legal_name",
        "type": "string"
      },
      {
        "name": "contact_email",
        "type": "string"
      },
      {
        "name": "contact_name",
        "type": "string"
      },
      {
        "name": "country",
        "type": "string"
      },
      {
        "name": "language",
        "type": "string"
      },
      {
        "name": "created_at_ms",
        "type": "number"
      }
    ]
  },
  {
    "entity": "packaging_item",
    "name": "ppwr_packaging_item",
    "columns": [
      {
        "name": "item_id",
        "type": "string"
      },
      {
        "name": "vendor_id",
        "type": "string"
      },
      {
        "name": "internal_sku",
        "type": "string"
      },
      {
        "name": "description",
        "type": "string"
      },
      {
        "name": "packaging_level",
        "type": "string"
      },
      {
        "name": "primary_material",
        "type": "string"
      },
      {
        "name": "food_contact",
        "type": "boolean"
      },
      {
        "name": "intended_use",
        "type": "string"
      },
      {
        "name": "active",
        "type": "boolean"
      },
      {
        "name": "created_at_ms",
        "type": "number"
      },
      {
        "name": "vendor_sku_key",
        "type": "string"
      }
    ]
  },
  {
    "entity": "campaign",
    "name": "ppwr_campaign",
    "columns": [
      {
        "name": "campaign_id",
        "type": "string"
      },
      {
        "name": "name",
        "type": "string"
      },
      {
        "name": "ruleset_version",
        "type": "string"
      },
      {
        "name": "ruleset_sha256",
        "type": "string"
      },
      {
        "name": "due_date",
        "type": "string"
      },
      {
        "name": "reminder_days_csv",
        "type": "string"
      },
      {
        "name": "expiry_days",
        "type": "number"
      },
      {
        "name": "owner_email",
        "type": "string"
      },
      {
        "name": "created_at_ms",
        "type": "number"
      }
    ]
  },
  {
    "entity": "campaign_item",
    "name": "ppwr_campaign_item",
    "columns": [
      {
        "name": "campaign_item_id",
        "type": "string"
      },
      {
        "name": "campaign_id",
        "type": "string"
      },
      {
        "name": "item_id",
        "type": "string"
      },
      {
        "name": "state",
        "type": "string"
      },
      {
        "name": "token_hash",
        "type": "string"
      },
      {
        "name": "token_expires_at_ms",
        "type": "number"
      },
      {
        "name": "invited_at_ms",
        "type": "number"
      },
      {
        "name": "last_reminder_at_ms",
        "type": "number"
      },
      {
        "name": "reminder_count",
        "type": "number"
      },
      {
        "name": "current_submission_id",
        "type": "string"
      },
      {
        "name": "resume_page",
        "type": "number"
      },
      {
        "name": "next_revision",
        "type": "number"
      },
      {
        "name": "lock_token",
        "type": "string"
      },
      {
        "name": "lock_until_ms",
        "type": "number"
      },
      {
        "name": "updated_at_ms",
        "type": "number"
      },
      {
        "name": "campaign_item_key",
        "type": "string"
      }
    ]
  },
  {
    "entity": "submission",
    "name": "ppwr_submission",
    "columns": [
      {
        "name": "submission_id",
        "type": "string"
      },
      {
        "name": "campaign_item_id",
        "type": "string"
      },
      {
        "name": "revision",
        "type": "number"
      },
      {
        "name": "commit_state",
        "type": "string"
      },
      {
        "name": "submitted_at_ms",
        "type": "number"
      },
      {
        "name": "evaluated_at_ms",
        "type": "number"
      },
      {
        "name": "submitted_by",
        "type": "string"
      },
      {
        "name": "raw_payload_json",
        "type": "string"
      },
      {
        "name": "raw_payload_uri",
        "type": "string"
      },
      {
        "name": "normalised_json",
        "type": "string"
      },
      {
        "name": "normalised_uri",
        "type": "string"
      },
      {
        "name": "verdict",
        "type": "string"
      },
      {
        "name": "ruleset_version",
        "type": "string"
      },
      {
        "name": "engine_version",
        "type": "string"
      },
      {
        "name": "findings_sha256",
        "type": "string"
      },
      {
        "name": "engine_run_ms",
        "type": "number"
      },
      {
        "name": "submission_key",
        "type": "string"
      }
    ]
  },
  {
    "entity": "document",
    "name": "ppwr_document",
    "columns": [
      {
        "name": "document_id",
        "type": "string"
      },
      {
        "name": "submission_id",
        "type": "string"
      },
      {
        "name": "doc_type",
        "type": "string"
      },
      {
        "name": "filename",
        "type": "string"
      },
      {
        "name": "mime_type",
        "type": "string"
      },
      {
        "name": "byte_size",
        "type": "number"
      },
      {
        "name": "storage_uri",
        "type": "string"
      },
      {
        "name": "sha256",
        "type": "string"
      },
      {
        "name": "extracted_json",
        "type": "string"
      },
      {
        "name": "extracted_uri",
        "type": "string"
      },
      {
        "name": "extraction_model_id",
        "type": "string"
      },
      {
        "name": "extraction_at_ms",
        "type": "number"
      }
    ]
  },
  {
    "entity": "finding",
    "name": "ppwr_finding",
    "columns": [
      {
        "name": "finding_id",
        "type": "string"
      },
      {
        "name": "submission_id",
        "type": "string"
      },
      {
        "name": "seq",
        "type": "number"
      },
      {
        "name": "check_id",
        "type": "string"
      },
      {
        "name": "check_type",
        "type": "string"
      },
      {
        "name": "severity",
        "type": "string"
      },
      {
        "name": "status",
        "type": "string"
      },
      {
        "name": "field_ref",
        "type": "string"
      },
      {
        "name": "message",
        "type": "string"
      },
      {
        "name": "evidence_json",
        "type": "string"
      },
      {
        "name": "evidence_uri",
        "type": "string"
      },
      {
        "name": "ruleset_version",
        "type": "string"
      }
    ]
  },
  {
    "entity": "event_log",
    "name": "ppwr_event_log",
    "columns": [
      {
        "name": "event_uid",
        "type": "string"
      },
      {
        "name": "campaign_item_id",
        "type": "string"
      },
      {
        "name": "submission_id",
        "type": "string"
      },
      {
        "name": "event_type",
        "type": "string"
      },
      {
        "name": "actor",
        "type": "string"
      },
      {
        "name": "payload_json",
        "type": "string"
      },
      {
        "name": "payload_uri",
        "type": "string"
      },
      {
        "name": "created_at_ms",
        "type": "number"
      }
    ]
  },
  {
    "entity": "review",
    "name": "ppwr_review",
    "columns": [
      {
        "name": "review_id",
        "type": "string"
      },
      {
        "name": "submission_id",
        "type": "string"
      },
      {
        "name": "finding_id",
        "type": "string"
      },
      {
        "name": "reviewer",
        "type": "string"
      },
      {
        "name": "decision",
        "type": "string"
      },
      {
        "name": "rationale",
        "type": "string"
      },
      {
        "name": "rule_feedback",
        "type": "string"
      },
      {
        "name": "decided_at_ms",
        "type": "number"
      }
    ]
  },
  {
    "entity": "draft",
    "name": "ppwr_draft",
    "columns": [
      {
        "name": "draft_id",
        "type": "string"
      },
      {
        "name": "campaign_item_id",
        "type": "string"
      },
      {
        "name": "page",
        "type": "number"
      },
      {
        "name": "answers_json",
        "type": "string"
      },
      {
        "name": "answers_uri",
        "type": "string"
      },
      {
        "name": "updated_at_ms",
        "type": "number"
      },
      {
        "name": "draft_key",
        "type": "string"
      }
    ]
  },
  {
    "entity": "meta",
    "name": "ppwr_meta",
    "columns": [
      {
        "name": "meta_id",
        "type": "string"
      },
      {
        "name": "key",
        "type": "string"
      },
      {
        "name": "value",
        "type": "string"
      },
      {
        "name": "updated_at_ms",
        "type": "number"
      },
      {
        "name": "meta_key",
        "type": "string"
      }
    ]
  }
];

const REF_PREFIX = 'PPWR_REF:';

function config() {
  let url = String(process.env.N8N_URL || '');
  while (url.endsWith('/')) url = url.slice(0, -1);
  const key = process.env.N8N_API_KEY || '';
  if (!url || !key) {
    console.error('Set N8N_URL and N8N_API_KEY first.');
    console.error('An API key comes from Settings, n8n API, in your own instance.');
    process.exit(1);
  }
  return { base: url + '/api/v1', key };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(cfg, method, route, body, attempt = 0) {
  let res;
  try {
    res = await fetch(cfg.base + route, {
      method,
      headers: Object.assign({ 'X-N8N-API-KEY': cfg.key }, body ? { 'Content-Type': 'application/json' } : {}),
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    // The largest workflow here is three quarters of a megabyte, and a slow hop times out on it
    // now and then. Aborting mid install leaves half the references pointing at nothing, which is
    // a worse state than not having started.
    if (attempt < 5) {
      await sleep(3000 * (attempt + 1));
      return api(cfg, method, route, body, attempt + 1);
    }
    throw new Error(method + ' ' + route + ' -> ' + (err && err.message ? err.message : err));
  }

  const text = await res.text();

  if (!res.ok) {
    // Some instances rate limit writes, and pushing twelve workflows trips it. Being told to slow
    // down is not a failure. Stopping half way through, leaving references dangling, is.
    if (text.includes('too many requests') && attempt < 6) {
      await sleep(4000 * (attempt + 1));
      return api(cfg, method, route, body, attempt + 1);
    }
    throw new Error(method + ' ' + route + ' -> ' + res.status + ': ' + text.slice(0, 300));
  }

  return text ? JSON.parse(text) : null;
}

/** Replaces every PPWR_REF:<name> with the id of the workflow of that name. */
function resolve(value, ids) {
  if (Array.isArray(value)) return value.map((v) => resolve(v, ids));
  if (typeof value === 'string' && value.startsWith(REF_PREFIX)) {
    const name = value.slice(REF_PREFIX.length);
    if (!ids[name]) throw new Error('No workflow called "' + name + '" to reference');
    return ids[name];
  }
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const [k, v] of Object.entries(value)) out[k] = resolve(v, ids);
  return out;
}

function countRefs(workflow) {
  return (JSON.stringify(workflow).split(REF_PREFIX).length - 1);
}

function payload(workflow) {
  return {
    name: workflow.name,
    nodes: workflow.nodes,
    connections: workflow.connections,
    settings: workflow.settings || {},
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const cfg = config();

  const existing = {};
  for (const t of (await api(cfg, 'GET', '/data-tables?limit=200')).data || []) existing[t.name] = t.id;

  console.log('Tables');
  for (const table of TABLES) {
    if (existing[table.name]) {
      console.log('  ' + table.name.padEnd(24) + 'exists');
      continue;
    }
    if (dryRun) {
      console.log('  ' + table.name.padEnd(24) + 'would create, ' + table.columns.length + ' columns');
      continue;
    }
    const made = await api(cfg, 'POST', '/data-tables', { name: table.name, columns: table.columns });
    existing[table.name] = made.id;
    console.log('  ' + table.name.padEnd(24) + 'created ' + made.id);
  }

  if (args.includes('--tables-only')) return;

  const dir = path.join(__dirname, 'workflows');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();

  const ids = {};
  for (const w of (await api(cfg, 'GET', '/workflows?limit=250')).data || []) ids[w.name] = w.id;

  console.log('');
  console.log('Workflows');

  const pushed = [];
  for (const file of files) {
    const source = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));

    if (dryRun) {
      console.log('  ' + file.padEnd(34) + (ids[source.name] ? 'would update' : 'would create')
        + ', ' + countRefs(source) + ' references');
      continue;
    }

    if (ids[source.name]) {
      await api(cfg, 'PUT', '/workflows/' + ids[source.name], payload(source));
      console.log('  ' + file.padEnd(34) + 'updated');
    } else {
      const made = await api(cfg, 'POST', '/workflows', payload(source));
      ids[source.name] = made.id;
      console.log('  ' + file.padEnd(34) + 'created');
    }
    pushed.push({ file, name: source.name });
  }

  if (dryRun) return;

  console.log('');
  console.log('References');
  let total = 0;
  for (const { file, name } of pushed) {
    const source = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const refs = countRefs(source);
    if (refs === 0) continue;
    await api(cfg, 'PUT', '/workflows/' + ids[name], payload(resolve(source, ids)));
    console.log('  ' + file.padEnd(34) + refs + ' resolved');
    total += refs;
  }

  console.log('');
  console.log(total + ' references now point at your own copies.');
  console.log('');
  console.log('Left to do by hand, because an API key cannot create a credential:');
  console.log('  a mail credential          on the nodes that write to a vendor');
  console.log('  an HTTP header credential  on the nodes that call your model endpoint');
  console.log('  a crypto credential        for signing the vendor form links');
  console.log('');
  console.log('Then put your endpoint and reviewer address in the ppwr_meta table, and activate.');
}

main().catch((err) => {
  console.error(err && err.message ? err.message : err);
  process.exitCode = 1;
});
