const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', message: 'Test server works!' }));
});

server.listen(3001, '0.0.0.0', () => {
    console.log('Test server running on port 3001');
});

server.on('error', (err) => {
    console.error('Server error:', err);
});
