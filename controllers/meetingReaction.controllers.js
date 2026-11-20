
const MeetingNote = require('../models/meetingNote.model');
const MeetingReaction = require('../models/meetinReaction.model');

const allowedEmojis = ['❤️', '👍', '😂', '😮', '😢', '🔥'];

const reactToNote = async (req, res) => {
    try {
        const noteId = Number(req.params.noteId);
        const emoji = req.body.emoji;

        if (!Number.isInteger(noteId) || noteId <= 0) {
            return res.status(400).json({
                message: 'Invalid note ID'
            });
        }

        if (!allowedEmojis.includes(emoji)) {
            return res.status(400).json({
                message: 'Invalid emoji'
            });
        }

        const note = await MeetingNote.findOne({
            where: {
                id: noteId,
                connectionId: req.connection.id
            }
        });

        if (!note) {
            return res.status(404).json({
                message: 'Message not found'
            });
        }

        const [reaction] = await MeetingReaction.upsert({
            noteId,
            userId: Number(req.user.id),
            emoji
        });

        return res.status(200).json({
            message: 'Reaction saved',
            reaction
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getNoteReactions = async (req, res) => {
    try {
        const noteId = Number(req.params.noteId);

        const note = await MeetingNote.findOne({
            where: {
                id: noteId,
                connectionId: req.connection.id
            }
        });

        if (!note) {
            return res.status(404).json({
                message: 'Message not found'
            });
        }

        const reactions = await MeetingReaction.findAll({
            where: { noteId }
        });

        return res.status(200).json(reactions);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    reactToNote,
    getNoteReactions
};
