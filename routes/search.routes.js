const express = require('express')
const router = express.Router()
const authmiddelware = require('../middleware/authmiddelware')
const { searchUsers, getFilterOptions } = require('../controllers/search.controller')

router.get('/search', authmiddelware, searchUsers)
router.get('/filters', authmiddelware, getFilterOptions)

module.exports = router