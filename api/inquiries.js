import { sql } from './_db.js';
import { isAdmin } from './_auth.js';
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      if (!isAdmin(req)) return res.status(401).json({ error: 'Admin only' });
      return res.json(await sql`select i.id,i.name,i.email,i.message,i.created_at,p.title as product
        from inquiries i left join products p on p.id=i.product_id order by i.created_at desc limit 200`);
    }
    if (req.method !== 'POST') return res.status(405).end();
    const b = req.body || {};
    if (b.website) return res.json({ ok: true }); // honeypot: bots fill this
    const name = String(b.name || '').trim().slice(0, 100);
    const email = String(b.email || '').trim().slice(0, 150);
    const message = String(b.message || '').trim().slice(0, 2000);
    const pid = parseInt(b.product_id, 10) || null;
    if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Please check your name, email and message.' });
    await sql`insert into inquiries(name,email,product_id,message) values(${name},${email},${pid},${message})`;
    res.status(201).json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
}
