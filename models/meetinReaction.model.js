const { DataTypes } = require('sequelize');
const db = require('../utils/bd');
const User = require('./user.model');

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
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
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

MeetingReaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = MeetingReaction;
