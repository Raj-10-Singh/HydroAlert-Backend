const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'HydroAlert API is running ✅' });
});

// Routes (we'll add these in Phase 2)
app.use('/api/auth', require('./src/routes/authRoute'));
app.use('/api/alerts', require('./src/routes/alertRoute'));
app.use('/api/shelters', require('./src/routes/shelterRoute'));
app.use('/api/zones',    require('./src/routes/zoneRoute'));
// app.use('/api/locations', require('./src/routes/locationRoutes'));
// app.use('/api/shelters', require('./src/routes/shelterRoutes'));

module.exports = app;