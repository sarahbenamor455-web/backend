const { DataTypes } = require('sequelize')
const { Database } = require('sequelize')
const { db } = require('../utils/db')

const user = db.define("users", {
    firstname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date_of_graduation: {
        type: DataTypes.DATEONLY,
        allowNull: true


    },
    profilepic: {
        type: DataTypes.TEXT('long'),
        allowNull: true,

    },
    role: {
        type: DataTypes.ENUM("student", "alumni", "admin"),
        defaultValue: 'student',
        allowNull: true
    },
    industry: {
    type: DataTypes.STRING,
    allowNull: true
    },
    bio: {
    type: DataTypes.TEXT,
    allowNull: true
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
})
module.exports = user