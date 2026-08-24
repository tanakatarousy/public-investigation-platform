import {writeFileSync} from "node:fs";
import {cases,mapRecords,sources,subjects} from "../app/data/platform.ts";

const rows=[
  ...subjects.map(value=>({id:`wanted:${value.slug}`,kind:"wanted",slug:value.slug,title:value.name,payload:value})),
  ...cases.map(value=>({id:`case:${value.slug}`,kind:"case",slug:value.slug,title:value.title,payload:value})),
  ...sources.map(value=>({id:`source:${value.id}`,kind:"source",slug:value.id,title:value.title,payload:value})),
  ...mapRecords.map(value=>({id:`map:${value.id}`,kind:"map",slug:value.id,title:value.label,payload:value})),
];
const quote=value=>`'${String(value).replaceAll("'","''")}'`;
const sql=["-- Generated from app/data/platform.ts. Regenerate with npm run db:seed-migration.",...rows.map(row=>`INSERT OR IGNORE INTO content_records (id,kind,slug,title,payload,publish_state,revision,published_at,created_at,updated_at) VALUES (${quote(row.id)},${quote(row.kind)},${quote(row.slug)},${quote(row.title)},${quote(JSON.stringify(row.payload))},'published',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);--> statement-breakpoint`),""].join("\n");
writeFileSync(new URL("../drizzle/0003_seed_public_records.sql",import.meta.url),sql,"utf8");

const registryRows=[
  ...subjects.map(value=>({id:`wanted:${value.slug}`,kind:"wanted",slug:value.slug,title:value.name,payload:value})),
  ...sources.map(value=>({id:`source:${value.id}`,kind:"source",slug:value.id,title:value.title,payload:value})),
];
const refreshSql=["-- v0.8 official wanted registry refresh. Generated from app/data/platform.ts.",...registryRows.map(row=>`INSERT INTO content_records (id,kind,slug,title,payload,publish_state,revision,published_at,created_at,updated_at) VALUES (${quote(row.id)},${quote(row.kind)},${quote(row.slug)},${quote(row.title)},${quote(JSON.stringify(row.payload))},'published',1,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET kind=excluded.kind,slug=excluded.slug,title=excluded.title,payload=excluded.payload,publish_state='published',revision=content_records.revision+1,published_at=COALESCE(content_records.published_at,CURRENT_TIMESTAMP),withdrawn_at=NULL,updated_at=CURRENT_TIMESTAMP;--> statement-breakpoint`),""].join("\n");
writeFileSync(new URL("../drizzle/0009_refresh_wanted_registry.sql",import.meta.url),refreshSql,"utf8");
