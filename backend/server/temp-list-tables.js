const db = require('./models');
(async () => {
  try {
    const [results] = await db.sequelize.query("SELECT tablename FROM pg_tables WHERE schemaname = 'public';");
    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('ERROR:', err);
    process.exit(1);
  } finally {
    await db.sequelize.close();
  }
})();
