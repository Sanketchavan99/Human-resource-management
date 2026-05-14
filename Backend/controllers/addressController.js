const { Address, User } = require('../models/index');

// Create Address
exports.createAddress = async (req, res) => {
  try {
    const { userId, type, addressLine, city, state, pincode } = req.body;

    if (!userId || !type) {
      return res.status(400).json({ success: false, message: 'UserId and type are required' });
    }

    if (!['Current', 'Permanent'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be either Current or Permanent' });
    }

    const address = await Address.create({ userId, type, addressLine, city, state, pincode });
    res.status(201).json({ success: true, message: 'Address created successfully', data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating address', error: error.message });
  }
};

// Get all Addresses
exports.getAllAddresses = async (req, res) => {
  try {
    const addresses = await Address.findAll({ order: [['createdAt', 'DESC']], include: [{ model: User, attributes: ['id', 'name', 'empCode'] }] });
    res.status(200).json({ success: true, data: addresses });``
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching addresses', error: error.message });
  }
};

// Get Addresses by User ID
exports.getAddressesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const addresses = await Address.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching addresses', error: error.message });
  }
};

// Get My Addresses (authenticated user's own addresses)
exports.getMyAddresses = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const addresses = await Address.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, data: addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching addresses', error: error.message });
  }
};

// Get Address by ID
exports.getAddressById = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findByPk(id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.status(200).json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching address', error: error.message });
  }
};

// Update Address
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, addressLine, city, state , pincode} = req.body;

    const address = await Address.findByPk(id);
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (type && !['Current', 'Permanent'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Type must be either Temporary or Permanent' });
    }

    await address.update({ 
      type: type || address.type,
      addressLine: addressLine !== undefined ? addressLine : address.addressLine,
      city: city !== undefined ? city : address.city,
      state: state !== undefined ? state : address.state,
      pincode: pincode !== undefined ? pincode : address.pincode
    });
    
    res.status(200).json({ success: true, message: 'Address updated successfully', data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating address', error: error.message });
  }
};

// Delete Address
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findByPk(id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await address.destroy();
    res.status(200).json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting address', error: error.message });
  }
};
