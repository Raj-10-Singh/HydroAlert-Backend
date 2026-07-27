const express = require('express');
const router = express.Router();
const { getZones, getZoneById, createZone, updateZoneRisk } = require('../controllers/floodZoneController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getZones);
router.get('/:zoneId', protect, getZoneById);
router.post('/', protect, adminOnly, createZone);
router.put('/:zoneId/update-risk', protect, updateZoneRisk);

module.exports = router;