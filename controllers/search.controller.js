const { Op, fn, col, literal } = require('sequelize')
const { db } = require('../utils/db')
const User = require('../models/user.model')
require('../models/Availability.model') 

const ALLOWED_SORTS = ['relevance', 'name', 'newest']


const searchUsers = async (req, res) => {
    try {
        const q = (req.query.q || '').trim()
        const role = req.query.role || ''
        const industry = req.query.industry || ''
        const day = req.query.day || ''
        const timeSlot = req.query.timeSlot || ''
        const sort = ALLOWED_SORTS.includes(req.query.sort) ? req.query.sort : 'relevance'

        const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 6, 1), 50)
        const offset = (page - 1) * limit

        const conditions = []

        if (q) {
            const like = `%${q}%`
            conditions.push({
                [Op.or]: [
                    { firstname: { [Op.like]: like } },
                    { lastname: { [Op.like]: like } },
                    { industry: { [Op.like]: like } },
                    { bio: { [Op.like]: like } }
                ]
            })
        }
        if (role) conditions.push({ role })
        if (industry) conditions.push({ industry })

        if (day || timeSlot) {

            let sub = 'EXISTS (SELECT 1 FROM availability a WHERE a.user_id = users.id'
            if (day) sub += ` AND a.day_of_week = ${db.escape(day)}`
            if (timeSlot) sub += ` AND a.time_slot = ${db.escape(timeSlot)}`
            sub += ')'
            conditions.push(literal(sub))
        }
        let relevanceSql = '0'
        if (q) {
            const like = db.escape(`%${q}%`)
            relevanceSql = `(CASE WHEN CONCAT(users.firstname, ' ', users.lastname) LIKE ${like} THEN 3 ELSE 0 END
                + CASE WHEN users.industry LIKE ${like} THEN 2 ELSE 0 END
                + CASE WHEN users.bio LIKE ${like} THEN 1 ELSE 0 END)`
        }

        const scheduleSql = `(SELECT GROUP_CONCAT(CONCAT(a.day_of_week, ' ', a.time_slot) SEPARATOR ', ')
            FROM availability a WHERE a.user_id = users.id)`

        const orderBy = {
            relevance: [[literal('relevance'), 'DESC'], ['firstname', 'ASC']],
            name: [['firstname', 'ASC'], ['lastname', 'ASC']],
            newest: [['createdAt', 'DESC'], ['id', 'DESC']]
        }[sort]
        const { count, rows } = await User.findAndCountAll({
            where: { [Op.and]: conditions },
            attributes: [
                'id', 'firstname', 'lastname', 'role', 'industry', 'bio', 'isVerified', 'createdAt',
                [literal(relevanceSql), 'relevance'],
                [literal(scheduleSql), 'schedule']
            ],
            order: orderBy,
            limit,
            offset,
            raw: true
        })

        const data = rows.map(r => ({ ...r, name: `${r.firstname} ${r.lastname}` }))

        return res.status(200).json({
            data,
            pagination: {
                page,
                limit,
                total: count,
                totalPages: Math.max(Math.ceil(count / limit), 1)
            }
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Search failed', error: err.message })
    }
}

const getFilterOptions = async (req, res) => {
    try {
        const rows = await User.findAll({
            attributes: [[fn('DISTINCT', col('industry')), 'industry']],
            where: { industry: { [Op.ne]: null } },
            order: [['industry', 'ASC']],
            raw: true
        })

        return res.status(200).json({
            roles: ['student', 'alumni'],
            industries: rows.map(r => r.industry),
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            timeSlots: ['Morning', 'Afternoon', 'Evening']
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Could not load filters' })
    }
}

module.exports = { searchUsers, getFilterOptions }