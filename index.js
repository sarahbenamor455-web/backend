
const fs = require('fs');
const path = require('path');
const express = require('express')
const app = express()
const PORT = 3000
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));
app.use('/api/users', require('./routes/search.routes'))


const { connectiondatabase, db } = require('./utils/db')
const User = require('./models/User.model')
const cookieParser = require('cookie-parser')
app.use(cookieParser())

app.use(express.json())
app.use('/api/auth', require('./routes/authRoutes'))

const start = async () => {
    await connectiondatabase()
    await db.sync()
    app.listen(PORT, () => console.log("server is running on port " + PORT))
}
start()

