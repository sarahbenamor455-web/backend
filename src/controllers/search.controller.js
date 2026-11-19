const searchService = require('../services/search.service');

exports.searchUsers = (req, res, next) => {
  try {
    const sort = searchService.ALLOWED_SORTS.includes(req.query.sort) ? req.query.sort : 'relevance';

    const filters = {
      q: (req.query.q || '').trim(),
      role: req.query.role || '',
      industry: req.query.industry || '',
      day: req.query.day || '',
      timeSlot: req.query.timeSlot || '',
      sort,
      page: Math.max(parseInt(req.query.page, 10) || 1, 1),
      limit: Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 50)
    };

    res.json(searchService.searchUsers(filters));
  } catch (err) {
    next(err); 
  }
};

exports.getFilterOptions = (req, res, next) => {
  try {
    res.json(searchService.getFilterOptions());
  } catch (err) {
    next(err);
  }
};