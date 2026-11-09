const $ = (s) => document.querySelector(s);
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x) e.textContent = x; return e; };
const say = (t) => ($('#amsg').textContent = t);
const api = (u, o = {}) => fetch(u, { ...o, headers: { 'Content-Type': 'application/json' } });

async function load() {
  const r = await api('/api/inquiries');
  if (r.status === 401) { $('#login').hidden = false; $('#panel').hidden = true; return; }
  $('#login').hidden = true; $('#panel').hidden = false;
  const inq = await r.json(), prods = await (await api('/api/products')).json();
  $('#plist').replaceChildren(...prods.map((p) => {
    const row = el('p', '', `${p.title} (AED ${p.price}) ${p.sold ? '[sold] ' : ''}`);
    const a = el('button', 'btn ghost', p.sold ? 'Mark available' : 'Mark sold');
    a.onclick = async () => { await api('/api/products?id=' + p.id, { method: 'PATCH' }); load(); };
    const d = el('button', 'btn ghost', 'Delete');
    d.onclick = async () => { if (confirm(`Delete "${p.title}"?`)) { await api('/api/products?id=' + p.id, { method: 'DELETE' }); load(); } };
    row.append(a, ' ', d); return row;
  }));
  $('#ilist').replaceChildren(...(inq.length ? inq : [{ name: '', empty: 1 }]).map((i) => {
    if (i.empty) return el('p', '', 'No inquiries yet.');
    const b = el('p'); b.append(el('strong', '', `${i.name} <${i.email}>`), ` re: ${i.product || 'commission'} on ${new Date(i.created_at).toLocaleDateString()}: `, i.message);
    return b;
  }));
}

$('#login').onsubmit = async (e) => {
  e.preventDefault();
  const r = await api('/api/login', { method: 'POST', body: JSON.stringify({ password: e.target.password.value }) });
  say(r.ok ? '' : 'Wrong password.'); e.target.reset(); if (r.ok) load();
};

// Resize photo in the browser (max 900px JPEG) so it stays small in the database
const toData = (file) => new Promise((ok) => {
  if (!file) return ok('');
  const img = new Image(); img.onload = () => {
    const s = Math.min(1, 900 / Math.max(img.width, img.height)), c = document.createElement('canvas');
    c.width = img.width * s; c.height = img.height * s; c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    ok(c.toDataURL('image/jpeg', 0.8));
  }; img.src = URL.createObjectURL(file);
});

$('#add').onsubmit = async (e) => {
  e.preventDefault(); const f = e.target;
  const body = { title: f.title.value, category: f.category.value, price: f.price.value, description: f.description.value, image: await toData(f.photo.files[0]) };
  const r = await api('/api/products', { method: 'POST', body: JSON.stringify(body) });
  say(r.ok ? 'Published.' : 'Could not save: ' + ((await r.json()).error || 'error'));
  if (r.ok) { f.reset(); load(); }
};
load();
