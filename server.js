require('dotenv').config();
const express = require('express');
const cors = require('cors');
require('./src/config/schema'); // creates tables and seed data

const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:4200' }));
app.use(express.json());

app.use('/api/users', require('./src/routes/users.routes'));
app.use('/api/mentorship', require('./src/routes/mentorship.routes'));
app.use('/api/connections', require('./src/routes/connections.routes'));
app.use('/api/notes', require('./src/routes/notes.routes'));
app.use('/api/search', require('./src/routes/search.routes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));