const jwt = require('jsonwebtoken')
const User = require('../models/User.model') 

const authmiddelware = async (req, res, next) => {
    try {
        const header = req.headers.authorization

        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'user not connected' })
        }

        const token = header.split(' ')[1]
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