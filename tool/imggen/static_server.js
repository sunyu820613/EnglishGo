const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../../build/web');
const port = process.env.PORT || 43766;

const mime = {
  '.html': 'text/html', '.js': 'application/javascript', '.json': 'application/json',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm', '.ico': 'image/x-icon', '.webp': 'image/webp',
  '.m4a': 'audio/mp4', '.ttf': 'font/ttf', '.bin': 'application/octet-stream',
};

http.createServer((req, res) => {
  let filePath = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (req.url === '/' || !path.extname(filePath)) filePath = path.join(root, 'index.html');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, () => console.log(`Static server on ${port}, serving ${root}`));
