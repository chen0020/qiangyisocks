/**
 * Cloudflare Worker: Round-Robin Inquiry Router
 * Alternates inquiry emails between two sales reps via Resend API.
 * KV namespace: INQUIRY_KV  (bind as "INQUIRY_KV" in dashboard)
 */

const SALES = [
  'xanthia@yizetextile.com',
  'Eldon@qiangyitrading.com',
];

const FROM_ADDRESS = 'inquiries@qiangyisocks.com';
const RESEND_API   = 'https://api.resend.com/emails';
// RESEND_KEY is stored as a Cloudflare Worker Secret (env.RESEND_KEY), never hardcoded here.

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    if (request.method !== 'POST') {
      return corsResponse(JSON.stringify({ ok: false, error: 'Method not allowed' }), 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return corsResponse(JSON.stringify({ ok: false, error: 'Invalid JSON' }), 400);
    }

    const { name, company, email, whatsapp, product, quantity, message } = body;

    // Determine next recipient via round-robin
    let lastIdx = 0;
    try {
      const stored = await env.INQUIRY_KV.get('last_idx');
      lastIdx = stored !== null ? parseInt(stored, 10) : -1;
    } catch {}
    const nextIdx = (lastIdx + 1) % SALES.length;
    const recipient = SALES[nextIdx];

    // Save new index
    try {
      await env.INQUIRY_KV.put('last_idx', String(nextIdx));
    } catch {}

    // Build email HTML
    const html = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:8px;">
  <h2 style="color:#1a1a2e;margin-top:0;">New Inquiry from qiangyisocks.com</h2>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:8px 0;color:#555;width:130px;"><strong>Name</strong></td><td style="padding:8px 0;">${esc(name)}</td></tr>
    <tr><td style="padding:8px 0;color:#555;"><strong>Company</strong></td><td style="padding:8px 0;">${esc(company)}</td></tr>
    <tr><td style="padding:8px 0;color:#555;"><strong>Email</strong></td><td style="padding:8px 0;"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
    <tr><td style="padding:8px 0;color:#555;"><strong>WhatsApp</strong></td><td style="padding:8px 0;">${esc(whatsapp || '—')}</td></tr>
    <tr><td style="padding:8px 0;color:#555;"><strong>Product</strong></td><td style="padding:8px 0;">${esc(product)}</td></tr>
    <tr><td style="padding:8px 0;color:#555;"><strong>Quantity</strong></td><td style="padding:8px 0;">${esc(quantity)}</td></tr>
    <tr><td style="padding:8px 0;color:#555;"><strong>Message</strong></td><td style="padding:8px 0;">${esc(message || '—')}</td></tr>
  </table>
  <hr style="margin:20px 0;border:none;border-top:1px solid #ddd;">
  <p style="color:#888;font-size:12px;margin:0;">Sent via qiangyisocks.com inquiry form</p>
</div>`;

    // Send via Resend
    const res = await fetch(RESEND_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [recipient],
        reply_to: email,
        subject: `New Inquiry: ${product || 'Custom Socks'} — ${name || 'Visitor'}`,
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return corsResponse(JSON.stringify({ ok: false, error: 'Email delivery failed' }), 500);
    }

    return corsResponse(JSON.stringify({ ok: true, assignedTo: recipient }), 200);
  }
};

function esc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function corsResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'https://www.qiangyisocks.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
