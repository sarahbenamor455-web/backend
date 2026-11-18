const authmiddelware = require('../middleware/authmiddelware')
const { authorizeRoles } = require('../middleware/roleMiddelware')
const express = require('express')
const { register, login, getMe, getAllUsers} = require('../controllers/user.controller')

const router = express.Router()
router.get('/me', authmiddelware, getMe)
router.get('/users', authmiddelware, authorizeRoles('admin'), getAllUsers)


router.post('/register', register)
router.post('/login', login)

module.exports = router