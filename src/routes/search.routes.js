const router = require('express').Router();
const controller = require('../controllers/search.controller');

router.get('/', controller.searchUsers);
router.get('/filters', controller.getFilterOptions);
module.exports = router;