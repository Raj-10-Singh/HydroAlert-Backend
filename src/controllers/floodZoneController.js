const FloodZone = require('../models/floodZone');
const { getIO } = require('../sockets/socketHandler');

// @route GET /api/zones
// @desc  Get all flood zones
const getZones = async (req, res) => {
  try {
    const zones = await FloodZone.find().sort({ riskLevel: -1 });
    res.json(zones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/zones/:zoneId
// @desc  Get a single zone by zoneId string
const getZoneById = async (req, res) => {
  try {
    const zone = await FloodZone.findOne({ zoneId: req.params.zoneId });
    if (!zone) return res.status(404).json({ message: 'Zone not found' });
    res.json(zone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/zones
// @desc  Create a new flood zone (admin only)
const createZone = async (req, res) => {
  try {
    const { name, zoneId, longitude, latitude, polygon } = req.body;

    const zone = await FloodZone.create({
      name,
      zoneId,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      polygon: polygon || []
    });

    res.status(201).json(zone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/zones/:zoneId/update-risk
// @desc  Update water level + risk level, broadcast via socket
const updateZoneRisk = async (req, res) => {
  try {
    const { waterLevel, rainfall, riskLevel } = req.body;

    const zone = await FloodZone.findOneAndUpdate(
      { zoneId: req.params.zoneId },
      { waterLevel, rainfall, riskLevel, lastUpdated: Date.now() },
      { new: true, returnDocument: 'after' }
    );

    if (!zone) return res.status(404).json({ message: 'Zone not found' });

    // Broadcast updated zone status to all users in this zone
    const io = getIO();
    io.to(zone.zoneId).emit('zone-status-update', {
      zoneId: zone.zoneId,
      waterLevel: zone.waterLevel,
      rainfall: zone.rainfall,
      riskLevel: zone.riskLevel,
      lastUpdated: zone.lastUpdated
    });

    res.json(zone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getZones, getZoneById, createZone, updateZoneRisk };
