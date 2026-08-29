import { Redis } from "@upstash/redis";
const kv = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const approved = (await kv.get("reviews:approved")) || [];
      const sorted = [...approved].sort((a, b) => b.createdAt - a.createdAt);
      return res.status(200).json({ reviews: sorted });
    }

    if (req.method === "POST") {
      const { name, rating, text, photo } = req.body || {};

      if (!name || !rating || !text) {
        return res.status(400).json({ error: "Missing name, rating, or text." });
      }
      if (String(name).length > 100 || String(text).length > 1000) {
        return res.status(400).json({ error: "Input too long." });
      }
      if (photo && (typeof photo !== "string" || !photo.startsWith("data:image/") || photo.length > 800000)) {
        return res.status(400).json({ error: "Invalid or too large photo." });
      }

      const review = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: String(name).slice(0, 100),
        rating: String(rating),
        text: String(text).slice(0, 1000),
        photo: photo || null,
        createdAt: Date.now(),
      };

      const pending = (await kv.get("reviews:pending")) || [];
      pending.push(review);
      await kv.set("reviews:pending", pending);

      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("reviews api error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
