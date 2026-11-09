import { sql } from './_db.js';
import { isAdmin } from './_auth.js';
const CATS = ['Vases', 'Canvases', 'Other'];
export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
      return res.json(await sql`select id,title,category,price,description,image,sold from products order by created_at desc`);
    }
    if (!isAdmin(req)) return res.status(401).json({ error: 'Admin only' });
    const id = parseInt(req.query.id, 10);
    if (req.method === 'POST') {
      const b = req.body || {};
      const title = String(b.title || '').trim().slice(0, 120);
      const price = Number(b.price);
      const image = String(b.image || '');
      if (!title || !CATS.includes(b.category) || !(price >= 0)) return res.status(400).json({ error: 'Invalid fields' });
      if (image && (!image.startsWith('data:image/') || image.length > 900000)) return res.status(400).json({ error: 'Bad image' });
      const [row] = await sql`insert into products(title,category,price,description,image)
        values(${title},${b.category},${price},${String(b.description || '').slice(0, 1500)},${image}) returning id`;
      return res.status(201).json(row);
    }
    if (!id) return res.status(400).json({ error: 'id required' });
    if (req.method === 'PATCH') { await sql`update products set sold = not sold where id=${id}`; return res.json({ ok: true }); }
    if (req.method === 'DELETE') { await sql`delete from products where id=${id}`; return res.json({ ok: true }); }
    res.status(405).end();
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
}
