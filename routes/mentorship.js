const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const c = require('../controllers/mentorship.controller');

router.post('/', requireAuth, c.create);
router.get('/', requireAuth, c.getAll);
router.get('/:id', requireAuth, c.getById);
router.put('/:id', requireAuth, c.update);
router.delete('/:id', requireAuth, c.remove);

module.exports = router;