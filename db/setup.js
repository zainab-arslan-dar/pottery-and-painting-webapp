// Run once: npm run db   (reads .env)
import { neon } from '@neondatabase/serverless';
import { readFileSync } from 'node:fs';
const sql = neon(process.env.DATABASE_URL);
for (const stmt of readFileSync(new URL('./schema.sql', import.meta.url), 'utf8').split(';')) {
  if (stmt.trim()) await sql.query(stmt);
}
console.log('Tables ready.');
