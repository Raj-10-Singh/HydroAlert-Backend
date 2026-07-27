const express = require('express');
const router = express.Router();
const {
  createAlert,
  getAlerts,
  getAlertsByZone,
  getNearbyAlerts,
  deactivateAlert,
  deleteAlert
} = require('../controllers/alertController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, createAlert);
router.get('/', protect, getAlerts);
router.get('/nearby', protect, getNearbyAlerts);
router.get('/zone/:zoneId', protect, getAlertsByZone);
router.put('/:id/deactivate', protect, deactivateAlert);
router.delete('/:id', protect, adminOnly, deleteAlert);

module.exports = router;