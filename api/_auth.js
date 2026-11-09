import crypto from 'node:crypto';
const sign = (v) => crypto.createHmac('sha256', process.env.SESSION_SECRET).update(v).digest('hex');
const h = (v) => crypto.createHash('sha256').update(String(v)).digest();
export const safeEq = (a, b) => crypto.timingSafeEqual(h(a), h(b));
export const makeToken = () => { const e = String(Date.now() + 12 * 3600e3); return `${e}.${sign(e)}`; };
export function isAdmin(req) {
  const m = /(?:^|; )session=([^;]+)/.exec(req.headers.cookie || '');
  if (!m || !process.env.SESSION_SECRET) return false;
  const [e, sig] = m[1].split('.');
  return Date.now() < Number(e) && safeEq(sig, sign(e));
}
