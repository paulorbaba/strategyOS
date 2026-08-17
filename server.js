import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pkg from "pg";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const { Pool } = pkg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS content (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(auth.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });
  if (email !== process.env.ADMIN_EMAIL) return res.status(401).json({ error: "Invalid credentials" });
  const valid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

app.get("/api/content", async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, data FROM content");
    const overrides = {};
    rows.forEach(r => { overrides[r.id] = r.data; });
    res.json(overrides);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.put("/api/content/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { data } = req.body ?? {};
  if (data === undefined) return res.status(400).json({ error: "Missing data" });
  try {
    await pool.query(
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
  try {
    await pool.query("DELETE FROM content WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

app.use(express.static(join(__dirname, "dist")));
app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
initDB()
  .then(() => app.listen(PORT, () => console.log(`Server on port ${PORT}`)))
  .catch(err => { console.error("DB init failed:", err); process.exit(1); });
