const db = require('./src/models/db-universal');

(async () => {
    const ings = await db.all('SELECT id, name FROM ingredients ORDER BY name');
    console.log('📦 Все ингредиенты в БД:\n');
    ings.forEach(i => console.log(`  ${i.id}. ${i.name}`));
    process.exit(0);
})();
