const $ = (s) => document.querySelector(s);
const grid = $('#grid'), dlg = $('#dlg'), form = $('#form'), msg = $('#msg');
let items = [], filter = 'All';
$('#yr').textContent = new Date().getFullYear();

function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }

function render() {
  grid.replaceChildren();
  const list = items.filter((p) => filter === 'All' || p.category === filter);
  if (!list.length) return grid.append(el('p', 'empty', 'New pieces are drying. Check back soon, or ask about a commission.'));
  for (const p of list) {
    const card = el('article', 'card'), pic = el('div', 'pic');
    if (p.image) { const i = el('img'); i.src = p.image; i.alt = p.title; i.loading = 'lazy'; pic.append(i); }
    if (p.sold) pic.append(el('span', 'sold', 'Found a home'));
    card.append(pic, el('h3', '', p.title), el('div', 'meta', `AED ${Number(p.price).toLocaleString()}`));
    if (p.description) card.append(el('p', '', p.description));
    if (!p.sold) { const b = el('button', 'btn ghost', 'Inquire to buy'); b.onclick = () => openDlg(p); card.append(b); }
    grid.append(card);
  }
}

function openDlg(p) {
  form.reset(); msg.textContent = '';
  form.product_id.value = p ? p.id : '';
  $('#dlgTitle').textContent = p ? `Inquire about "${p.title}"` : 'Start a commission';
  dlg.showModal();
}

document.querySelectorAll('[data-ask]').forEach((b) => (b.onclick = () => openDlg(null)));
document.querySelectorAll('.chip').forEach((c) => (c.onclick = () => {
  document.querySelectorAll('.chip').forEach((x) => x.classList.remove('on'));
  c.classList.add('on'); filter = c.dataset.f; render();
}));
$('#close').onclick = () => dlg.close();

form.onsubmit = async (e) => {
  e.preventDefault();
  $('#send').disabled = true; msg.textContent = 'Sending...';
  try {
    const r = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const d = await r.json();
    msg.textContent = r.ok ? 'Sent. I will reply to your email soon.' : d.error || 'Could not send. Please try again.';
    if (r.ok) form.reset();
  } catch { msg.textContent = 'Network error. Please try again.'; }
  $('#send').disabled = false;
};

fetch('/api/products').then((r) => r.json()).then((d) => { items = Array.isArray(d) ? d : []; render(); }).catch(render);
