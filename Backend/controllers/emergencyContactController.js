const { EmergencyContact, User } = require('../models/index');

// Create Emergency Contact
exports.createEmergencyContact = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phoneNumber, relation } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'UserId is required' });
    }

    // Check if emergency contact already exists for this user (one-to-one relationship)
    const existingContact = await EmergencyContact.findOne({ where: { userId } });
    if (existingContact) {
      return res.status(400).json({ success: false, message: 'Emergency contact already exists for this user' });
    }

    const emergencyContact = await EmergencyContact.create({ userId, name, phoneNumber, relation });
    res.status(201).json({ success: true, message: 'Emergency contact created successfully', data: emergencyContact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating emergency contact', error: error.message });
  }
};

// Get all Emergency Contacts
exports.getAllEmergencyContacts = async (req, res) => {
  try {
    const emergencyContacts = await EmergencyContact.findAll({ order: [['createdAt', 'DESC']], include: [{ model: User, attributes: ['id', 'name', 'empCode'] }] });
    res.status(200).json({ success: true, data: emergencyContacts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching emergency contacts', error: error.message });
  }
};

// Get Emergency Contact by User ID
exports.getEmergencyContactByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const emergencyContact = await EmergencyContact.findOne({ where: { userId } });

    if (!emergencyContact) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found for this user' });
    }

    res.status(200).json({ success: true, data: emergencyContact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching emergency contact', error: error.message });
  }
};

// Get My Emergency Contact (authenticated user's own emergency contact)
exports.getMyEmergencyContact = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const emergencyContact = await EmergencyContact.findOne({ where: { userId } });

    if (!emergencyContact) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found' });
    }

    res.status(200).json({ success: true, data: emergencyContact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching emergency contact', error: error.message });
  }
};

// Get Emergency Contact by ID
exports.getEmergencyContactById = async (req, res) => {
  try {
    const { id } = req.params;
    const emergencyContact = await EmergencyContact.findByPk(id);

    if (!emergencyContact) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found' });
    }

    res.status(200).json({ success: true, data: emergencyContact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching emergency contact', error: error.message });
  }
};

// Update Emergency Contact
exports.updateEmergencyContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, relation } = req.body;

    const emergencyContact = await EmergencyContact.findByPk(id);
    if (!emergencyContact) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found' });
    }

    await emergencyContact.update({ 
      name: name !== undefined ? name : emergencyContact.name,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : emergencyContact.phoneNumber,
      relation: relation !== undefined ? relation : emergencyContact.relation
    });
    
    res.status(200).json({ success: true, message: 'Emergency contact updated successfully', data: emergencyContact });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating emergency contact', error: error.message });
  }
};

// Delete Emergency Contact
exports.deleteEmergencyContact = async (req, res) => {
  try {
    const { id } = req.params;
    const emergencyContact = await EmergencyContact.findByPk(id);

    if (!emergencyContact) {
      return res.status(404).json({ success: false, message: 'Emergency contact not found' });
    }

    await emergencyContact.destroy();
    res.status(200).json({ success: true, message: 'Emergency contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting emergency contact', error: error.message });
  }
};
