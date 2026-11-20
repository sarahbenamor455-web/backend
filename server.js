require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');
require('./models/mentorship.model');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/mentorship', require('./routes/mentorship.routes'));

sequelize.sync()
  .then(() => app.listen(3000, () => console.log('Backend: http://localhost:3000')))
  .catch(err => console.error('Erreur base:', err));