const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TYPES = ['Resume Review', 'Weekly Coaching', 'Portfolio Review', 'Mock Interview', 'Career Advice'];
const SCHEDULES = ['weekdays', 'weekends', 'evenings', 'flexible'];

const MentorshipTrack = sequelize.define('MentorshipTrack', {
  alumniId: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM(...TYPES), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  schedule: { type: DataTypes.ENUM(...SCHEDULES) }
}, { tableName: 'mentorship_tracks', updatedAt: false });

module.exports = MentorshipTrack;
module.exports.TYPES = TYPES;
module.exports.SCHEDULES = SCHEDULES;