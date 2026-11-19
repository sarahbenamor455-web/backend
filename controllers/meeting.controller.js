
const MeetingNote = require('../models/meetingNote.model');
const path = require('path');
const fs = require('fs');

const addMeetingNote = async (req, res) => {
    try {
        const content = req.body.content || '';
        const file = req.file;

        if (!content.trim() && !file) {
            return res.status(400).json({
                message: 'Write a message or attach a file'
            });
        }

        let type = 'text';

        if (file) {
            if (file.mimetype.startsWith('image/')) {
                type = 'image';
            } else if (file.mimetype.startsWith('video/')) {
                type = 'video';
            } else if (file.mimetype.startsWith('audio/')) {
                type = 'audio';
            }
        }

        const note = await MeetingNote.create({
            connectionId: req.connection.id,
            authorId: Number(req.user.id),
            content: content.trim() || null,
            type,
            fileUrl: file
                ? `/uploads/meeting/${file.filename}`
                : null,
            originalName: file ? file.originalname : null,
            mimeType: file ? file.mimetype : null,
            fileSize: file ? file.size : null
        });

        return res.status(201).json({
            message: 'Message sent successfully',
            note
        });

    } catch (error) {
        console.error('Add message error:', error);

        if (req.file) {
            fs.unlink(
                req.file.path,
                () => {}
            );
        }

        return res.status(500).json({
            message: error.message
        });
    }
};

const getMeetingNotes = async (req, res) => {
    try {
        const notes = await MeetingNote.findAll({
            where: {
                connectionId: req.connection.id
            },
            order: [['createdAt', 'ASC']]
        });

        return res.status(200).json(notes);

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const deleteMeetingNote = async (req, res) => {
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
                message: 'Note not found'
            });
        }

        if (note.fileUrl) {
            const filePath = path.join(
                __dirname,
                '..',
                note.fileUrl.replace(/^\/+/, '')
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await note.destroy();

        return res.status(200).json({
            message: 'Message deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
}

module.exports={addMeetingNote,getMeetingNotes,deleteMeetingNote};