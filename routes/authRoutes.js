const authmiddelware = require('../middleware/authmiddelware')
const { authorizeRoles } = require('../middleware/roleMiddelware')
const express = require('express')
const { uploadProfilePic } = require('../middleware/uploadMiddleware')
const { register, login, getMe, getAllUsers,updateProfile} = require('../controllers/user.controller')

const router = express.Router()
router.get('/me', authmiddelware, getMe)
router.get('/users', authmiddelware, authorizeRoles('admin'), getAllUsers)

router.put('/profile', authmiddelware, uploadProfilePic, updateProfile)
router.post('/register', register)
router.post('/login', login)

module.exports = router