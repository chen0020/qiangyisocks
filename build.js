// Regenerates products.html from content/products/*.json
// Template skeleton (HEAD/TAIL) is read from the current products.html itself.
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync('products.html', 'utf8');
const headEnd = html.indexOf("<div class='filterbar'>");
const tailStart = html.indexOf("<section class='pgroup'");
if (headEnd < 0 || tailStart < 0 || tailStart < headEnd) throw new Error('template anchors not found');
const HEAD = html.slice(0, headEnd);
const TAIL = html.slice(tailStart);

const CATS = {
  sport: {
    filter: "",
    groups: {
      running: { id: 'running', alt: '', eyebrow: 'Sport - Running', h2: 'Running' },
      football: { id: 'football', alt: 'alt', eyebrow: 'Sport - Football', h2: 'Football' },
      basketball: { id: 'basketball', alt: '', eyebrow: 'Sport - Basketball', h2: 'Basketball' },
      cycling: { id: 'cycling', alt: 'alt', eyebrow: 'Sport - Cycling', h2: 'Cycling' },
      yoga: { id: 'yoga', alt: '', eyebrow: 'Sport - Yoga and Pilates', h2: 'Yoga &amp; Pilates' },
      merino: { id: 'wool', alt: 'alt', eyebrow: 'Sport - Wool and Merino', h2: 'Wool &amp; Merino' }
    }
  },
  casual: {
    filter: "",
    groups: { casual: { id: 'casual-grid', alt: '', eyebrow: 'Casual and Fashion', h2: 'All Casual Styles' } }
  },
  kids: {
    filter: "",
    groups: { kids: { id: 'kids-grid', alt: 'alt', eyebrow: 'Kids', h2: 'Kids &amp; Infant Styles' } }
  }
};

const prods = fs.readdirSync('content/products')
  .filter(f => f.endsWith('.json'))
  .map(f => JSON.parse(fs.readFileSync(path.join('content/products', f), 'utf8')));

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function card(p) {
  const img = p.image || '/images/running/cat-running.jpg';
  const badge = p.badge ? `<span class='prodcard-badge'>${esc(p.badge)}</span>` : '';
  const mats = (p.materials || []).map(m => `<span class='ptag'>${esc(m)}</span>`).join('');
  const tech = p.technics ? `<span class='ptag'>${esc(p.technics)}</span>` : '';
  const moq = p.moq || 100;
  return `<div class='prodcard'><div class='prodcard-img'><img src='${esc(img)}' alt='${esc(p.title)}' loading='lazy'>${badge}</div><div class='prodcard-body'><div class='prodcard-tags'>${mats}${tech}<span class='ptag'>MOQ ${moq}</span></div><div class='prodcard-name'>${esc(p.title)}</div><div class='prodcard-price'>From $${esc(p.price)} <span>/ pair</span></div><div class='prodcard-moq'>Minimum Order: ${moq} pairs</div><div class='prodcard-actions'><a href='contact.html' class='btn-detail'>View Details</a><button class='btn-inquiry' onclick='openModal()'>Quick Inquiry</button></div></div></div>`;
}

function psection(g, cards) {
  return `<section class='psection${g.alt}' id='${g.id}'><div class='wrap'><div class='psection-head'><div><p class='eyebrow'>${g.eyebrow}</p><h2>${g.h2}</h2></div></div><div class='prodgrid'>${cards.join('')}</div></div></section>`;
}

let out = HEAD;
for (const grp of Object.values(CATS)) {
  const sections = [];
  for (const g of Object.values(grp.groups)) {
    const list = prods.filter(p => p.category === g.id || (g.id === 'wool' && p.category === 'merino') || (g.id === 'casual-grid' && p.category === 'casual') || (g.id === 'kids-grid' && p.category === 'kids'));
    if (list.length) sections.push(psection(g, list.map(card)));
  }
  if (sections.length) out += grp.filter + sections.join('');
}
out += TAIL;
fs.writeFileSync('products.html', out, 'utf8');
console.log('products.html regenerated:', out.length, 'bytes,', prods.length, 'products');
