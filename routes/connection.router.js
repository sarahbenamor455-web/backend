const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middelware')
const {sendConnection,acpref,getMyConnections} = require('../controllers/connection.controller')

router.use(authenticate)
router.post('/', sendConnection)
router.patch('/:id/status', acpref)
router.get('/my-connections', getMyConnections)

module.exports = router;