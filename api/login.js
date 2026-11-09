import { safeEq, makeToken } from './_auth.js';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const pw = String(req.body?.password ?? '');
  if (!process.env.ADMIN_PASSWORD || !safeEq(pw, process.env.ADMIN_PASSWORD)) {
    await new Promise((r) => setTimeout(r, 900)); // slows brute force
    return res.status(401).json({ error: 'Wrong password' });
  }
  res.setHeader('Set-Cookie', `session=${makeToken()}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=43200`);
  res.json({ ok: true });
}
