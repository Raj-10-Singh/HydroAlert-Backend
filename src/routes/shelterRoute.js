const express = require('express');
const router = express.Router();
const {
  getShelters,
  getNearbyShelters,
  createShelter,
  updateOccupancy,
  toggleShelter
} = require('../controllers/shelterController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', protect, getShelters);
router.get('/nearby', protect, getNearbyShelters);
router.post('/', protect, adminOnly, createShelter);
router.put('/:id/occupancy', protect, updateOccupancy);
router.put('/:id/toggle', protect, adminOnly, toggleShelter);

module.exports = router;