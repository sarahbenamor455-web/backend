const { generateToken } = require('../utils/generateToken')
const bcrypt = require('bcryptjs')
const User = require('../models/User.model')
const { isEduEmail } = require('../utils/emailValidator')
const Availability = require('../models/Availability.model')

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

        res.cookie('accessToken', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json({
            message: "Login successful",
            user: formatUser(user)
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Server error" })
    }
}
const formatUser = (user) => ({
    id: user.id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    profilepic: user.profilepic,
    industry: user.industry,
    bio: user.bio,
    date_of_graduation: user.date_of_graduation
})

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
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const SLOTS = ['Morning', 'Afternoon', 'Evening']

const updateProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const { firstname, lastname, industry, bio, date_of_graduation } = req.body

    
        let slots = null
        if (req.body.availability !== undefined) {
            try {
                slots = JSON.parse(req.body.availability)
            } catch {
                return res.status(400).json({ message: "availability must be valid JSON" })
            }
            const invalid = !Array.isArray(slots) ||
                slots.some(s => !DAYS.includes(s.day_of_week) || !SLOTS.includes(s.time_slot))
            if (invalid) {
                return res.status(400).json({ message: "Invalid availability" })
            }
        }
        if (req.file) {
            user.profilepic = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
        }
        if (firstname) user.firstname = firstname
        if (lastname) user.lastname = lastname
        if (industry !== undefined) user.industry = industry.trim() || null
        if (bio !== undefined) user.bio = bio.trim() || null
        if (date_of_graduation !== undefined) user.date_of_graduation = date_of_graduation || null
        await user.save()
        if (slots) {
            await Availability.destroy({ where: { user_id: user.id } })
            await Availability.bulkCreate(
                slots.map(s => ({ user_id: user.id, day_of_week: s.day_of_week, time_slot: s.time_slot }))
            )
        }

        const availability = await Availability.findAll({
            where: { user_id: user.id },
            attributes: ['day_of_week', 'time_slot'],
            raw: true
        })

        return res.status(200).json({
            message: "Profile updated",
            user: {
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                profilepic: user.profilepic,
                industry: user.industry,
                bio: user.bio,
                date_of_graduation: user.date_of_graduation,
                availability
            }
        })
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message })
    }
}
module.exports = { register, login, getMe, getAllUsers, updateProfile }