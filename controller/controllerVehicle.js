const Vehicle = require('../models/vehicle');

const createVehicle = async (req, res) => {
  try {
    const { brand, model, year, price, description } = req.body;

    const vehicleData = {
      brand, model, year, price, description,
      owner: req.user.userId,
      image: req.file ? req.file.filename : null
    };

    const vehicle = await Vehicle.create(vehicleData);

    res.status(201).json({data: vehicle});

  } catch (error) {
    res.status(500).json();
  }
};

const getVehicles = async (req, res) => {
  try {
        const { brand, model, minYear, maxYear, minPrice, maxPrice, status } = req.query;

    const filter = {};
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    if (model) filter.model = { $regex: model, $options: 'i' };
    if (status) filter.status = status;

    if (minYear || maxYear) {
      filter.year = {};
      if (minYear) filter.year.$gte = Number(minYear);
      if (maxYear) filter.year.$lte = Number(maxYear);
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const vehicles = await Vehicle.find(filter)
      .select('brand model year price status image owner description')
      .sort({ createdAt: -1 })
      .populate('owner', 'name');

    res.json({
      total: vehicles.length,
      data: vehicles
    });

  } catch (error) {
    res.status(500).json();
  }
};

const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('owner', 'name');

    if (!vehicle) return res.status(404).json();

    res.json(vehicle);

  } catch (error) {
    res.status(500).json();
  }
};

const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user.userId }).populate('owner', 'name');

    res.json({ total: vehicles.length, data: vehicles });

  } catch (error) {
    res.status(500).json();
  }
};

const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) return res.status(404).json();

    if (vehicle.owner.toString() !== req.user.userId) return res.status(403).json();

    const updated = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });

    res.status(200).json(updated);

  } catch (error) {
    res.status(500).json();
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) return res.status(404).json();
    if (vehicle.owner.toString() !== req.user.userId) return res.status(403).json();

    await Vehicle.findByIdAndDelete(req.params.id);
    res.status(204).send();

  } catch (error) {
    res.status(500).json();
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getMyVehicles
};