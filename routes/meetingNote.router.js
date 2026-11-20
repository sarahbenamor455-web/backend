const express = require('express');
const router = express.Router();
const {addMeetingNote,getMeetingNotes,deleteMeetingNote} = require('../controllers/meeting.controller');
const authenticate = require('../middleware/auth.middelware');
const authConnection = require('../middleware/authorizeConnection.middelware');
const upload = require('../middleware/upload.middleware');
const {reactToNote,getNoteReactions} = require('../controllers/meetingReaction.controllers');

router.use(authenticate)
router.post('/:id',authConnection, upload.single('file'),addMeetingNote)
router.get('/:id', authConnection,getMeetingNotes)
router.delete('/:id/:noteId', authConnection,deleteMeetingNote)
router.post('/:id/:noteId/reactions',authConnection,reactToNote)
router.get('/:id/:noteId/reactions',authConnection,getNoteReactions)

module.exports = router;
