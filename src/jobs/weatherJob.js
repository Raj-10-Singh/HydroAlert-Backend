const cron = require('node-cron');
const { fetchWeatherForAllZones } = require('../services/weatherService');

const startWeatherJob = () => {
  // Runs every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    console.log('⏰ Weather cron job triggered');
    await fetchWeatherForAllZones();
  });

  console.log('✅ Weather cron job scheduled (every 10 minutes)');
};

module.exports = { startWeatherJob };