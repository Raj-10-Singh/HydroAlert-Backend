const axios = require('axios');
const FloodZone = require('../models/floodZone');
const { getIO } = require('../sockets/socketHandler');

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Calculate risk level based on rainfall and water level
const calculateRiskLevel = (rainfall, waterLevel) => {
  if (rainfall > 100 || waterLevel > 300) return 'critical';
  if (rainfall > 70  || waterLevel > 200) return 'high';
  if (rainfall > 40  || waterLevel > 100) return 'medium';
  if (rainfall > 10  || waterLevel > 50)  return 'low';
  return 'safe';
};

// Fetch weather for a single zone's coordinates
const fetchWeatherForZone = async (zone) => {
  try {
    const [longitude, latitude] = zone.location.coordinates;

    const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });

    const data = response.data;

    // Extract rainfall (rain.1h = last 1 hour rainfall in mm)
    const rainfall = data.rain?.['1h'] || 0;
    const humidity = data.main?.humidity || 0;

    // Simulate water level based on rainfall + humidity (replace with real sensor later)
    const waterLevel = Math.round(rainfall * 2.5 + (humidity * 0.5));
    const riskLevel = calculateRiskLevel(rainfall, waterLevel);

    // Update zone in MongoDB
    const updatedZone = await FloodZone.findOneAndUpdate(
      { zoneId: zone.zoneId },
      {
        waterLevel,
        rainfall,
        riskLevel,
        lastUpdated: Date.now()
      },
      { new: true, returnDocument: 'after' }
    );

    // Broadcast to all users in this zone
    const io = getIO();
    io.to(zone.zoneId).emit('zone-status-update', {
      zoneId: zone.zoneId,
      waterLevel,
      rainfall,
      riskLevel,
      lastUpdated: updatedZone.lastUpdated
    });

    console.log(`🌦️  Zone ${zone.zoneId} updated: rainfall=${rainfall}mm, risk=${riskLevel}`);
    return updatedZone;
  } catch (err) {
    console.error(`❌ Weather fetch failed for zone ${zone.zoneId}:`, err.message);
  }
};

// Fetch weather for ALL zones
const fetchWeatherForAllZones = async () => {
  try {
    const zones = await FloodZone.find();

    if (zones.length === 0) {
      console.log('⚠️  No zones found in DB, skipping weather fetch');
      return;
    }

    console.log(`🌍 Fetching weather for ${zones.length} zones...`);
    await Promise.all(zones.map(fetchWeatherForZone));
    console.log('✅ Weather update complete');
  } catch (err) {
    console.error('❌ fetchWeatherForAllZones failed:', err.message);
  }
};

module.exports = { fetchWeatherForAllZones, fetchWeatherForZone };
