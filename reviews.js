import { kv } from "@vercel/kv";

// All requests must include header: x-admin-password: <ADMIN_PASSWORD env var>
//
// GET    /api/admin/reviews             -> { pending: [...] }
// POST   /api/admin/reviews  body: { id, action: "approve" | "reject" }

function checkAuth(req, res) {
  const password = req.headers["x-admin-password"];
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

export default async function handler(req, res) {
  if (!checkAuth(req, res)) return;

  try {
    if (req.method === "GET") {
      const pending = (await kv.get("reviews:pending")) || [];
      const sorted = [...pending].sort((a, b) => b.createdAt - a.createdAt);
      return res.status(200).json({ pending: sorted });
    }

    if (req.method === "POST") {
      const { id, action } = req.body || {};
      if (!id || !["approve", "reject"].includes(action)) {
        return res.status(400).json({ error: "Missing id or invalid action." });
      }

      const pending = (await kv.get("reviews:pending")) || [];
      const idx = pending.findIndex((r) => r.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Review not found." });
      }

      const [review] = pending.splice(idx, 1);
      await kv.set("reviews:pending", pending);

      if (action === "approve") {
        const approved = (await kv.get("reviews:approved")) || [];
        approved.push(review);
        await kv.set("reviews:approved", approved);
      }
      // if "reject", we simply drop it (already removed from pending above)

      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("admin reviews api error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
