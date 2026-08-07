// Decap CMS GitHub OAuth provider (Vercel serverless function)
// Endpoints (rewritten by vercel.json):
//   /auth?type=authorize  -> redirect to GitHub OAuth
//   /auth?type=callback   -> exchange code, hand token back to Decap CMS
const https = require('https');

function exchangeCode(code) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      client_id: process.env.OAUTH_CLIENT_ID,
      client_secret: process.env.OAUTH_CLIENT_SECRET,
      code
    }).toString();
    const req = https.request({
      hostname: 'github.com',
      path: '/login/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let d = '';
      res.on('data', c => { d += c; });
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = async (req, res) => {
  const u = new URL(req.url, 'https://' + req.headers.host);
  const type = u.searchParams.get('type');
  const provider = u.searchParams.get('provider') || 'github';
  const code = u.searchParams.get('code');

  // Decap v3 sends /auth?provider=github&site_id=...&scope=repo (no type)
  // Legacy format sends /auth?type=authorize
  if (type === 'authorize' || (!code && provider)) {
    const redirect = 'https://' + req.headers.host + '/auth?type=callback&provider=' + provider;
    const params = new URLSearchParams({
      client_id: process.env.OAUTH_CLIENT_ID,
      scope: 'repo,user',
      redirect_uri: redirect
    });
    res.writeHead(302, { Location: 'https://github.com/login/oauth/authorize?' + params.toString() });
    return res.end();
  }

  if (type === 'callback' || code) {
    if (!code) { res.statusCode = 400; return res.end('missing code'); }
    try {
      const data = await exchangeCode(code);
      const token = data.access_token;
      if (!token) { res.statusCode = 500; return res.end('no token: ' + JSON.stringify(data)); }
      const payload = JSON.stringify({ token, provider });
      const msg = JSON.stringify('authorization:' + provider + ':success:' + payload);
      const html = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' +
        '<p id="s" style="font-family:sans-serif;margin:2rem">Success &mdash; you can close this window.</p>' +
        '<script>(function(){' +
        'var m=' + msg + ';' +
        'function send(){if(window.opener){window.opener.postMessage(m,"*");setTimeout(function(){window.close();},500);}' +
        'else{document.getElementById("s").textContent="Authorized! Return to the CMS tab.";}}' +
        'send();setTimeout(send,800);setTimeout(send,2000);' +
        '})();<\/script></body></html>';
      res.setHeader('Content-Type', 'text/html');
      return res.end(html);
    } catch (e) {
      res.statusCode = 500;
      return res.end('auth error: ' + e.message);
    }
  }

  res.statusCode = 404;
  res.end('not found');
};
