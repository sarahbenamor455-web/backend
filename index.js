
require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
 
const app = express()
const server = http.createServer(app)
const PORT = 3000
 
const { db } = require('./utils/db')
 
// Models must be required here, otherwise db.sync() does not create their tables
require('./models/user.model')
require('./models/Availability.model')
const Connection = require('./models/connection.model')
require('./models/meetingNote.model')
require('./models/meetinReaction.model')
 
// Middlewares (BEFORE the routes)
app.use(cors({ origin: 'http://localhost:4200', credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static('uploads'))
 
// Routes
app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/users', require('./routes/search.routes'))
app.use('/api/connections', require('./routes/connection.router'))
app.use('/api/meeting-notes', require('./routes/meetingNote.router'))
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to Alumni Mentorship Network API' })
})
 

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:4200',
        methods: ['GET', 'POST'],
        credentials: true
    }
})
 

const getCookie = (header, name) => {
    if (!header) return null
    const part = header.split(';').map(c => c.trim()).find(c => c.startsWith(name + '='))
    return part ? decodeURIComponent(part.slice(name.length + 1)) : null
}
 
io.use((socket, next) => {
    try {
        
        const token = getCookie(socket.handshake.headers.cookie, 'accessToken')
 
        if (!token) {
            return next(new Error('Authentication required'))
        }
 
        socket.user = jwt.verify(token, process.env.JWT_SECRET)
        next()
    } catch (error) {
        next(new Error('Invalid token'))
    }
})
 
io.on('connection', (socket) => {
    console.log('User connected:', socket.user.id)
 
    socket.on('call:join', async ({ connectionId }, callback) => {
        try {
            const connection = await Connection.findOne({
                where: { id: Number(connectionId), status: 'Accepted' }
            })
 
            const userId = Number(socket.user.id)
 
            if (
                !connection ||
                (Number(connection.studentId) !== userId && Number(connection.alumniId) !== userId)
            ) {
                return callback?.({ success: false, message: 'Unauthorized connection' })
            }
 
            socket.data.connectionId = connection.id
            socket.join(`connection-${connection.id}`)
 
            callback?.({ success: true })
        } catch (error) {
            callback?.({ success: false, message: error.message })
        }
    })
 
    const forwardEvents = ['call:offer', 'call:answer', 'call:ice-candidate', 'call:end']
 
    forwardEvents.forEach((eventName) => {
        socket.on(eventName, (data) => {
            const connectionId = socket.data.connectionId
            if (!connectionId) return
            socket.to(`connection-${connectionId}`).emit(eventName, data)
        })
    })
 
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.user.id)
    })
})
 
async function startServer() {
    try {
        await db.authenticate()
        console.log('MySQL connected successfully!')
 
        await db.sync()
        console.log('Database tables synchronized!')
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (error) {
        console.error('Database connection error:', error.message)
    }
}
 
startServer()