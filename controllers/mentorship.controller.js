const MentorshipTrack = require('../models/mentorship.model');
const { TYPES, SCHEDULES } = MentorshipTrack;

// POST /api/mentorship
exports.create = async (req, res) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can create tracks' });
    }
    const { title, type, description, schedule } = req.body;
    if (!title || !type || !description) {
      return res.status(400).json({ message: 'title, type and description are required' });
    }
    if (!TYPES.includes(type)) {
      return res.status(400).json({ message: 'Invalid type' });
    }
    if (schedule && !SCHEDULES.includes(schedule)) {
      return res.status(400).json({ message: 'Invalid schedule' });
    }
    const track = await MentorshipTrack.create({
      alumniId: req.user.id,   // men token, mouch men body
      title, type, description, schedule
    });
    res.status(201).json(track);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/mentorship?type=...&alumniId=...
exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.alumniId) where.alumniId = req.query.alumniId;
    const tracks = await MentorshipTrack.findAll({ where, order: [['createdAt', 'DESC']] });
    res.status(200).json(tracks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/mentorship/:id
exports.getById = async (req, res) => {
  try {
    const track = await MentorshipTrack.findByPk(req.params.id);
    if (!track) return res.status(404).json({ message: 'Track not found' });
    res.status(200).json(track);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/mentorship/:id
exports.update = async (req, res) => {
  try {
    const track = await MentorshipTrack.findByPk(req.params.id);
    if (!track) return res.status(404).json({ message: 'Track not found' });
    if (track.alumniId !== req.user.id) {
      return res.status(403).json({ message: 'Not your track' });
    }
    const { title, type, description, schedule } = req.body;
    if (type && !TYPES.includes(type)) {
      return res.status(400).json({ message: 'Invalid type' });
    }
    if (schedule && !SCHEDULES.includes(schedule)) {
      return res.status(400).json({ message: 'Invalid schedule' });
    }
    await track.update({ title, type, description, schedule });
    res.status(200).json(track);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/mentorship/:id
exports.remove = async (req, res) => {
  try {
    const track = await MentorshipTrack.findByPk(req.params.id);
    if (!track) return res.status(404).json({ message: 'Track not found' });
    if (track.alumniId !== req.user.id) {
      return res.status(403).json({ message: 'Not your track' });
    }
    await track.destroy();
    res.status(200).json({ message: 'Track deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};