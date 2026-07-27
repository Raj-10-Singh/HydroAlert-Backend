require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./src/config/db');
const { initSocket } = require('./src/sockets/socketHandler');
const { startWeatherJob } = require('./src/jobs/weatherJob');

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    startWeatherJob(); // Start weather polling after server is ready
  });
});
