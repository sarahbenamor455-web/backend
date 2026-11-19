const db = require('../config/db');

exports.getIndustries = () =>
  db.prepare('SELECT DISTINCT industry FROM users WHERE industry IS NOT NULL ORDER BY industry')
    .all()
    .map(r => r.industry);

exports.count = (whereSql, params) =>
  db.prepare(`SELECT COUNT(*) AS total FROM users u ${whereSql}`).get(params).total;

exports.findPage = ({ whereSql, relevanceSql, orderBy, params }) =>
  db.prepare(`
    SELECT u.id, u.name, u.role, u.industry, u.bio, u.created_at,
           ${relevanceSql} AS relevance,
           (SELECT GROUP_CONCAT(a.day_of_week || ' ' || a.time_slot, ', ')
              FROM availability a WHERE a.user_id = u.id) AS schedule
    FROM users u
    ${whereSql}
    ORDER BY ${orderBy}
    LIMIT @limit OFFSET @offset
  `).all(params);