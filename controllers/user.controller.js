const { generateToken } = require('../utils/generateToken')
const bcrypt = require('bcryptjs')
const User = require('../models/User.model')
const { isEduEmail } = require('../utils/emailValidator')

// One place that builds the user sent to the frontend (never includes the password)
const formatUser = (user) => ({
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    profilepic: user.profilepic,
    date_of_graduation: user.date_of_graduation
})

const register = async (req, res) => {
    try {
        const { firstname, lastname, email, password, role, date_of_graduation } = req.body

        if (!firstname || !lastname || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must have at least 6 characters" })
        }

        if (role && !['student', 'alumni'].includes(role)) {
            return res.status(400).json({ message: "Invalid role" })
        }

        const cleanEmail = email.trim().toLowerCase()

        if (!isEduEmail(cleanEmail)) {
            return res.status(400).json({ message: "A .edu email is required" })
        }

        const exists = await User.findOne({ where: { email: cleanEmail } })
        if (exists) {
            return res.status(409).json({ message: "Email already in use" })
        }

        const hash = await bcrypt.hash(password, 10)

        const user = await User.create({
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            email: cleanEmail,
            password: hash,
            isVerified: true,
            role: role || 'student',
            date_of_graduation: date_of_graduation || null
        })

        return res.status(201).json({
            message: "Account created",
            user: formatUser(user)
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Server error" })
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        const user = await User.findOne({ where: { email: email.trim().toLowerCase() } })
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(401).json({ message: "Invalid email or password" })
        }

        const token = generateToken(user)

        return res.status(200).json({
            message: "Login successful",
            token,
            user: formatUser(user)
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Server error" })
    }
}

const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        return res.status(200).json({ user: formatUser(user) })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Server error" })
    }
}

const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password', 'profilepic'] }
        })
        return res.status(200).json({ users })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Server error" })
    }
}

module.exports = { register, login, getMe, getAllUsers }