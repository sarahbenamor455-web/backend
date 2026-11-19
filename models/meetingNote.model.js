
const { DataTypes } = require('sequelize');
const db = require('../utils/bd');

const MeetingNote = db.define('MeetingNote', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    connectionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    type: {
        type: DataTypes.ENUM('text', 'image', 'video', 'audio'),
        defaultValue: 'text',
        allowNull: false
    },
    fileUrl: {
        type: DataTypes.STRING,
        allowNull: true
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    mimeType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fileSize: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = MeetingNote;
