const Alert = require('../models/Alert');
const User = require('../models/user');
const { getIO } = require('../sockets/socketHandler');

// @route POST /api/alerts
// @desc  Create a new flood alert and broadcast it in real-time
const createAlert = async (req, res) => {
  try {
    const { title, message, severity, zone, longitude, latitude, radius } = req.body;

    const alert = await Alert.create({
      title,
      message,
      severity,
      zone,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      radius: radius || 5000,
      createdBy: req.user._id
    });

    // 🔥 Broadcast to all users in this zone via Socket.io
    const io = getIO();
    io.to(zone).emit('new-alert', {
      alertId: alert._id,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      zone: alert.zone,
      coordinates: [longitude, latitude]
    });

    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/alerts
// @desc  Get all active alerts
const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({ isActive: true })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/alerts/zone/:zoneId
// @desc  Get alerts for a specific zone
const getAlertsByZone = async (req, res) => {
  try {
    const alerts = await Alert.find({
      zone: req.params.zoneId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/alerts/nearby
// @desc  Get alerts near user's coordinates
const getNearbyAlerts = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query;

    const alerts = await Alert.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)  // in meters
        }
      }
    });

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/alerts/:id/deactivate
// @desc  Deactivate an alert
const deactivateAlert = async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }

    // Notify zone that alert is resolved
    const io = getIO();
    io.to(alert.zone).emit('alert-resolved', { alertId: alert._id });

    res.json({ message: 'Alert deactivated', alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/alerts/:id
// @desc  Delete an alert (admin only)
const deleteAlert = async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createAlert,
  getAlerts,
  getAlertsByZone,
  getNearbyAlerts,
  deactivateAlert,
  deleteAlert
};