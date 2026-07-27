const Shelter = require('../models/Shelter');

// @route GET /api/shelters
// @desc  Get all open shelters
const getShelters = async (req, res) => {
  try {
    const shelters = await Shelter.find({ isOpen: true });
    res.json(shelters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/shelters/nearby
// @desc  Get shelters near user's coordinates
const getNearbyShelters = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ message: 'longitude and latitude are required' });
    }

    const shelters = await Shelter.find({
      isOpen: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    });

    res.json(shelters);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/shelters
// @desc  Add a new shelter (admin only)
const createShelter = async (req, res) => {
  try {
    const { name, address, longitude, latitude, capacity, contactNumber, facilities } = req.body;

    const shelter = await Shelter.create({
      name,
      address,
      location: { type: 'Point', coordinates: [longitude, latitude] },
      capacity,
      contactNumber,
      facilities: facilities || []
    });

    res.status(201).json(shelter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/shelters/:id/occupancy
// @desc  Update shelter occupancy
const updateOccupancy = async (req, res) => {
  try {
    const { currentOccupancy } = req.body;

    const shelter = await Shelter.findByIdAndUpdate(
      req.params.id,
      { currentOccupancy },
      { new: true, returnDocument: 'after' }
    );

    if (!shelter) {
      return res.status(404).json({ message: 'Shelter not found' });
    }

    res.json(shelter);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/shelters/:id/toggle
// @desc  Open or close a shelter
const toggleShelter = async (req, res) => {
  try {
    const shelter = await Shelter.findById(req.params.id);
    if (!shelter) return res.status(404).json({ message: 'Shelter not found' });

    shelter.isOpen = !shelter.isOpen;
    await shelter.save();

    res.json({ message: `Shelter ${shelter.isOpen ? 'opened' : 'closed'}`, shelter });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getShelters, getNearbyShelters, createShelter, updateOccupancy, toggleShelter };