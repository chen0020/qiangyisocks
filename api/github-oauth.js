// Decap CMS GitHub OAuth handler
const https = require('https');

function exchangeCode(code, clientId, clientSecret) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code }).toString();
    const req = https.request({
      hostname: 'github.com',
      path: '/login/oauth/access_token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, r => {
      let d = '';
      r.on('data', c => { d += c; });
      r.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(e); } });
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
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;

  if (type === 'authorize' || (!code && provider)) {
    const redirect = 'https://' + req.headers.host + '/auth?type=callback&provider=' + provider;
    const params = new URLSearchParams({ client_id: clientId, scope: 'repo,user', redirect_uri: redirect });
    res.writeHead(302, { Location: 'https://github.com/login/oauth/authorize?' + params.toString() });
    return res.end();
  }

  if (type === 'callback' || code) {
    if (!code) { res.statusCode = 400; return res.end('missing code'); }
    try {
      const data = await exchangeCode(code, clientId, clientSecret);
      const token = data.access_token;
      if (!token) { res.statusCode = 500; return res.end('no token: ' + JSON.stringify(data)); }
      const payload = JSON.stringify({ token, provider });
      const msg = 'authorization:' + provider + ':success:' + payload;
      const html = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' +
        '<script>(function(){' +
        'var m=' + JSON.stringify(msg) + ';' +
        'if(window.opener&&!window.opener.closed){' +
        '  try{window.opener.postMessage(m,"*");setTimeout(function(){window.close();},300);return;}catch(e){}' +
        '}' +
        'try{localStorage.setItem("netlify-cms-user",m);}catch(e){}' +
        'window.location.replace("/admin/");' +
        '})();<\/script>' +
        '<p style="font-family:sans-serif;padding:2rem">Redirecting&hellip;</p>' +
        '</body></html>';
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
