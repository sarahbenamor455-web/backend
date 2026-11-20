const jwt = require('jsonwebtoken')
const User = require('../models/user.model') 

const authmiddelware = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null)

        if (!token) {
            return res.status(401).json({ message: 'user not connected' })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findByPk(decoded.id)
        if (!user) {
            return res.status(401).json({ message: 'user no longer exists' })
        }

        req.user = user 
        next()
    } catch (error) {
        return res.status(401).json({ message: 'invalid or expired token' })
    }
}

module.exports = authmiddelware