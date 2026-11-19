
const { DataTypes } = require('sequelize');
const db = require('../utils/bd');

const MeetingReaction = db.define('MeetingReaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    noteId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    emoji: {
        type: DataTypes.STRING(10),
        allowNull: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['noteId', 'userId']
        }
    ]
});

module.exports = MeetingReaction;
