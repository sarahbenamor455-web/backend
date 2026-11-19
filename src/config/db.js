const Database = require('better-sqlite3');
const path = require('path');

const file = path.resolve(process.env.DB_FILE || 'mentorship.db');
const db = new Database(file);
db.pragma('journal_mode = WAL');

module.exports = db;