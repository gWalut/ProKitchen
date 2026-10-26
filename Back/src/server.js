const { app } = require('./app');
const config = require('./config/config');
const databases = [...new Set([
    require('./shared/database/db'), require('./shared/database/db-universal')
])];

const server = app.listen(config.PORT, process.env.HOST || '0.0.0.0', () => {
    const address = server.address();
    console.log(`Server is running on http://127.0.0.1:${address.port}`);
    if (process.send) process.send({ port: address.port });
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });

let stopping = false;
async function stop() {
    if (stopping) return;
    stopping = true;
    server.close(async () => {
        try { await Promise.all(databases.map(db => db.close())); }
        catch (error) { console.error(error.message); process.exitCode = 1; }
        if (process.connected) process.disconnect();
    });
    server.closeIdleConnections();
}
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
process.once('message', message => { if (message === 'shutdown') stop(); });
