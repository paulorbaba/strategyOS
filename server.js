import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(express.json());

/* ── PostgreSQL (optional — graceful degradation if not configured) ── */
let pool = null;

async function getPool() {
  if (pool) return pool;
  if (!process.env.DATABASE_URL) return null;
  try {
    const { default: pkg } = await import("pg");
    const { Pool } = pkg;
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query("SELECT 1"); // test connection
    await pool.query(`
      CREATE TABLE IF NOT EXISTS content (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("PostgreSQL connected and schema ready.");
    return pool;
  } catch (err) {
    console.warn("PostgreSQL unavailable:", err.message);
    pool = null;
    return null;
  }
}

/* ── Auth middleware ── */
function requireAuth(req, res, next) {
  if (!process.env.JWT_SECRET) return res.status(503).json({ error: "Auth not configured" });
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

/* ── API routes ── */
app.post("/api/auth/login", async (req, res) => {
  if (!process.env.JWT_SECRET || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) {
    return res.status(503).json({ error: "Admin not configured" });
  }
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });
  if (email !== process.env.ADMIN_EMAIL) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

app.get("/api/content", async (_req, res) => {
  const db = await getPool();
  if (!db) return res.json({}); // no DB → empty overrides, app uses defaults
  try {
    const { rows } = await db.query("SELECT id, data FROM content");
    const overrides = {};
    rows.forEach(r => { overrides[r.id] = r.data; });
    res.json(overrides);
  } catch (err) {
    console.error(err);
    res.json({});
  }
});

app.put("/api/content/:id", requireAuth, async (req, res) => {
  const db = await getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  const { id } = req.params;
  const { data } = req.body ?? {};
  if (data === undefined) return res.status(400).json({ error: "Missing data" });
  try {
    await db.query(
      `INSERT INTO content (id, data, updated_at) VALUES ($1, $2, NOW())
       ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = NOW()`,
      [id, JSON.stringify(data)]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.delete("/api/content/:id", requireAuth, async (req, res) => {
  const db = await getPool();
  if (!db) return res.status(503).json({ error: "Database not configured" });
  try {
    await db.query("DELETE FROM content WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

/* ── Serve React build ── */
app.use(express.static(join(__dirname, "dist")));
app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

/* ── Start ── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  getPool().catch(() => {}); // attempt DB connection in background
});
