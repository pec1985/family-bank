import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
// Next evaluates route modules in parallel during builds. Keep those workers
// isolated and never read or modify the family's persisted data while building.
const building = process.env.NEXT_PHASE === 'phase-production-build';
if (!building) fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(building ? ':memory:' : path.join(dataDir, 'family-bank.sqlite'));
if (!building) db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS members (id INTEGER PRIMARY KEY, name TEXT UNIQUE NOT NULL, avatar TEXT NOT NULL, cash_cents INTEGER NOT NULL DEFAULT 0, investment_cents INTEGER NOT NULL DEFAULT 0, age INTEGER);
  CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL, amount_cents INTEGER NOT NULL, icon TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS transactions (id INTEGER PRIMARY KEY, member_id INTEGER NOT NULL REFERENCES members(id), task_id INTEGER, kind TEXT NOT NULL, amount_cents INTEGER NOT NULL, note TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS investments (id INTEGER PRIMARY KEY, member_id INTEGER NOT NULL REFERENCES members(id), name TEXT NOT NULL, icon TEXT NOT NULL DEFAULT '🌟', balance_cents INTEGER NOT NULL DEFAULT 0);
  CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`);
db.prepare('INSERT OR IGNORE INTO app_settings (key,value) VALUES (?,?)').run(
  'investment_multiplier',
  '2',
);
const memberColumns = db.prepare('PRAGMA table_info(members)').all() as { name: string }[];
if (!memberColumns.some((column) => column.name === 'age'))
  db.exec('ALTER TABLE members ADD COLUMN age INTEGER');
if (
  process.env.ADMIN_USERNAME &&
  process.env.ADMIN_PASSWORD &&
  !db.prepare('SELECT id FROM users LIMIT 1').get()
) {
  db.prepare('INSERT OR IGNORE INTO users (username,password) VALUES (?,?)').run(
    process.env.ADMIN_USERNAME,
    process.env.ADMIN_PASSWORD,
  );
}
if (process.env.PARENT_PIN && /^\d{4}$/.test(process.env.PARENT_PIN)) {
  db.prepare('INSERT OR IGNORE INTO app_settings (key,value) VALUES (?,?)').run(
    'secret_pin',
    process.env.PARENT_PIN,
  );
}
// Preserve any existing investment balance as the starting balance of the first goal.
for (const member of db.prepare('SELECT id,name,investment_cents FROM members').all() as {
  id: number;
  name: string;
  investment_cents: number;
}[]) {
  const count = (
    db.prepare('SELECT COUNT(*) count FROM investments WHERE member_id=?').get(member.id) as {
      count: number;
    }
  ).count;
  if (!count) {
    const addGoal = db.prepare(
      'INSERT INTO investments (member_id,name,icon,balance_cents) VALUES (?,?,?,?)',
    );
    addGoal.run(member.id, 'Viaje especial', '🎢', member.investment_cents);
  }
}
const taskCount = (db.prepare('SELECT COUNT(*) count FROM tasks').get() as { count: number }).count;
if (!taskCount) {
  const add = db.prepare(
    'INSERT INTO tasks (title,description,amount_cents,icon) VALUES (?,?,?,?)',
  );
  add.run('Hacer la cama', 'Deja la cama ordenada', 100, '🛏️');
  add.run('Poner la mesa', 'Prepara la mesa para comer', 150, '🍽️');
  add.run('Ordenar juguetes', 'Guarda todo en su sitio', 200, '🧸');
  add.run('Ayudar en casa', 'Una mano extra siempre ayuda', 250, '🧹');
  add.run('Leer un libro', '20 minutos de lectura', 100, '📚');
}
export default db;
