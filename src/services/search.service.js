const User = require('../models/user.model');

// ORDER BY text comes only from this fixed object, never from user input
const ORDER_BY = {
  relevance: 'relevance DESC, u.name ASC',
  name: 'u.name ASC',
  newest: 'u.created_at DESC, u.id DESC'
};

exports.searchUsers = ({ q, role, industry, day, timeSlot, sort, page, limit }) => {
  const where = [];
  const params = {};

  if (q) {
    where.push('(u.name LIKE @like OR u.industry LIKE @like OR u.bio LIKE @like)');
    params.like = `%${q}%`;
  }
  if (role) { where.push('u.role = @role'); params.role = role; }
  if (industry) { where.push('u.industry = @industry'); params.industry = industry; }
  if (day || timeSlot) {
    let sub = 'EXISTS (SELECT 1 FROM availability a WHERE a.user_id = u.id';
    if (day) { sub += ' AND a.day_of_week = @day'; params.day = day; }
    if (timeSlot) { sub += ' AND a.time_slot = @timeSlot'; params.timeSlot = timeSlot; }
    sub += ')';
    where.push(sub);
  }
  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const relevanceSql = q
    ? `(CASE WHEN u.name     LIKE @like THEN 3 ELSE 0 END
      + CASE WHEN u.industry LIKE @like THEN 2 ELSE 0 END
      + CASE WHEN u.bio      LIKE @like THEN 1 ELSE 0 END)`
    : '0';

  const total = User.count(whereSql, params);
  const offset = (page - 1) * limit;
  const data = User.findPage({
    whereSql,
    relevanceSql,
    orderBy: ORDER_BY[sort],
    params: { ...params, limit, offset }
  });

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) }
  };
};

exports.getFilterOptions = () => ({
  roles: ['student', 'alumni'],
  industries: User.getIndustries(),
  days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  timeSlots: ['Morning', 'Afternoon', 'Evening']
});

exports.ALLOWED_SORTS = Object.keys(ORDER_BY);