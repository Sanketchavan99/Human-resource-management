const { Center } = require('../models/index');

// Create Center
exports.createCenter = async (req, res) => {
  try {
    const { name, city, state, zone } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Center name is required' });
    }

    const center = await Center.create({ name, city, state, zone });
    res.status(201).json({ success: true, message: 'Center created successfully', data: center });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating center', error: error.message });
  }
};

// Get all Centers
exports.getAllCenters = async (req, res) => {
  try {
    const centers = await Center.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, data: centers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching centers', error: error.message });
  }
};

// Get Center by ID
exports.getCenterById = async (req, res) => {
  try {
    const { id } = req.params;
    const center = await Center.findByPk(id);

    if (!center) {
      return res.status(404).json({ success: false, message: 'Center not found' });
    }

    res.status(200).json({ success: true, data: center });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching center', error: error.message });
  }
};

// Update Center
exports.updateCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, state, zone } = req.body;

    const center = await Center.findByPk(id);
    if (!center) {
      return res.status(404).json({ success: false, message: 'Center not found' });
    }

    await center.update({ 
      name: name || center.name, 
      city: city || center.city, 
      state: state || center.state, 
      zone: zone || center.zone 
    });
    
    res.status(200).json({ success: true, message: 'Center updated successfully', data: center });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating center', error: error.message });
  }
};

// Delete Center
exports.deleteCenter = async (req, res) => {
  try {
    const { id } = req.params;
    const center = await Center.findByPk(id);

    if (!center) {
      return res.status(404).json({ success: false, message: 'Center not found' });
    }

    await center.destroy();
    res.status(200).json({ success: true, message: 'Center deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting center', error: error.message });
  }
};
