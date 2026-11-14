import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = process.env.HOST ?? '127.0.0.1';
const port = Number(process.env.PORT ?? 5173);
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'};

const server = http.createServer(async (req,res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {res.writeHead(405);res.end();return;}
    const url = new URL(req.url || '/', `http://${host}:${port}`);
    const requested = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const candidate = path.resolve(root, `.${requested}`);
    if (candidate !== root && !candidate.startsWith(root + path.sep)) {res.writeHead(403);res.end('Forbidden');return;}
    const stats = await fs.stat(candidate);
    if (!stats.isFile()) {res.writeHead(404);res.end('Not found');return;}
    const body = await fs.readFile(candidate);
    res.writeHead(200, {'Content-Type':mime[path.extname(candidate)] || 'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:body);
  } catch {res.writeHead(404);res.end('Not found');}
});
server.listen(port, host, () => console.log(`🍄 Nấm Lùn 3D: http://${host}:${port}/`));
