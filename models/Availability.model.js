const { DataTypes } = require('sequelize')
const { db } = require('../utils/db')
const User = require('./User.model')

const Availability = db.define('availability', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    day_of_week: {
        type: DataTypes.ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        allowNull: false
    },
    time_slot: {
        type: DataTypes.ENUM('Morning', 'Afternoon', 'Evening'),
        allowNull: false
    }
}, { tableName: 'availability', timestamps: false })

User.hasMany(Availability, { foreignKey: 'user_id' })
Availability.belongsTo(User, { foreignKey: 'user_id' })

module.exports = Availability