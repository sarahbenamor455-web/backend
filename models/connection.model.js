const { DataTypes } = require('sequelize');
const db = require('../utils/bd');
const User = require('./user.model');

// Ensure User is accessible globally for teammate's controllers that reference User directly
global.User = User;

const Connection = db.define('Connection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  alumniId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Accepted', 'Rejected'),
    defaultValue: 'Pending',
    allowNull: false
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'alumniId']
    }
  ]
});

Connection.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
Connection.belongsTo(User, { as: 'alumni', foreignKey: 'alumniId' });

module.exports = Connection;
