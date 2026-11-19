require('dotenv').config();
const express=require('express')
const app=express()
const PORT=3000
const db=require('./utils/bd')
const connectionRouter = require('./routes/connection.router')
const meetingNoteRouter = require('./routes/meetingNote.router')
const http = require('http')
const { Server } = require('socket.io')
const cors=require('cors')
const jwt = require('jsonwebtoken')
const server = http.createServer(app)
const Connection = require('./models/connection.model')
const MeetingNote = require('./models/meetingNote.model')
const MeetingReaction = require('./models/meetinReaction.model')

app.use(cors({origin: 'http://localhost:4200'}))
app.use(express.json())
app.use('/uploads', express.static('uploads'))
app.use('/api/connections', connectionRouter)
app.use('/api/meeting-notes', meetingNoteRouter)
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to Alumni Mentorship Network API'
    })
})
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST']
    }
})
io.use((socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        socket.user = jwt.verify(token, process.env.JWT_SECRET);
        next();

    } catch (error) {
        next(new Error('Invalid token'));
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.user.id);

    socket.on('call:join', async ({ connectionId }, callback) => {
        try {
            const connection = await Connection.findOne({
                where: {
                    id: Number(connectionId),
                    status: 'Accepted'
                }
            });

            const userId = Number(socket.user.id);

            if (
                !connection ||
                (
                    Number(connection.studentId) !== userId &&
                    Number(connection.alumniId) !== userId
                )
            ) {
                return callback?.({
                    success: false,
                    message: 'Unauthorized connection'
                });
            }

            socket.data.connectionId = connection.id;
            socket.join(`connection-${connection.id}`);

            callback?.({ success: true });

        } catch (error) {
            callback?.({
                success: false,
                message: error.message
            });
        }
    });

    const forwardEvents = [
        'call:offer',
        'call:answer',
        'call:ice-candidate',
        'call:end'
    ];

    forwardEvents.forEach((eventName) => {
        socket.on(eventName, (data) => {
            const connectionId = socket.data.connectionId;

            if (!connectionId) return;

            socket.to(`connection-${connectionId}`).emit(
                eventName,
                data
            );
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.user.id);
    });
})
async function startServer() {
    try {
        await db.authenticate();
        console.log('MySQL connected successfully!');

        await db.sync();
        console.log('Database tables synchronized!');

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Database connection error:', error.message);
    }
}

startServer()
/*app.listen(PORT,()  => {
    console.log("this server is running !!!!!");
})*/