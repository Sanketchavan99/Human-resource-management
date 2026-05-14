const { Nominee, User } = require('../models/index');

// Create Nominee
exports.createNominee = async (req, res) => {
  try {
    const { userId, name, city, state, relation, dob, phoneNumber, address, sharePercentage } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'UserId is required' });
    }

    // Add the share perecentage to the total share percentage of this user
    const totalSharePercentage = await Nominee.sum('sharePercentage', { where: { userId } });
    if (totalSharePercentage + sharePercentage > 100) {
      return res.status(400).json({ success: false, message: 'Total share percentage cannot exceed 100' });
    }
    const nominee = await Nominee.create({ userId, name, city, state, relation, dob, phoneNumber, address, sharePercentage });
    res.status(201).json({ success: true, message: 'Nominee created successfully', data: nominee });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Error creating nominee', error: error.message });
  }
};

// Get all Nominees
exports.getAllNominees = async (req, res) => {
  try {
    const nominees = await Nominee.findAll({ order: [['createdAt', 'DESC']], include: [{ model: User, attributes: ['id', 'name', 'empCode'] }] });
    res.status(200).json({ success: true, data: nominees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching nominees', error: error.message });
  }
};

// Get Nominees by User ID
exports.getNomineesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const nominees = await Nominee.findAll({ where: { userId } });

    if (!nominees) {
      return res.status(404).json({ success: false, message: 'Nominee not found for this user' });
    }

    res.status(200).json({ success: true, data: nominees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching nominee', error: error.message });
  }
};

// Get My Nominee (authenticated user's own nominee)
exports.getMyNominees  = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const nominees = await Nominee.findAll({ where: { userId } });

    if (!nominees) {
      return res.status(404).json({ success: false, message: 'Nominee not found' });
    }

    res.status(200).json({ success: true, data: nominees });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching nominee', error: error.message });
  }
};

// Get Nominee by ID
exports.getNomineeById = async (req, res) => {
  try {
    const { id } = req.params;
    const nominee = await Nominee.findByPk(id);

    if (!nominee) {
      return res.status(404).json({ success: false, message: 'Nominee not found' });
    }

    res.status(200).json({ success: true, data: nominee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching nominee', error: error.message });
  }
};

// Update Nominee
exports.updateNominee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, state, relation, dob, phoneNumber, address, sharePercentage } = req.body;

    const nominee = await Nominee.findByPk(id);
    if (!nominee) {
      return res.status(404).json({ success: false, message: 'Nominee not found' });
    }

    await nominee.update({ 
      name: name !== undefined ? name : nominee.name,
      city: city !== undefined ? city : nominee.city,
      state: state !== undefined ? state : nominee.state,
      relation: relation !== undefined ? relation : nominee.relation,
      dob: dob !== undefined ? dob : nominee.dob,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : nominee.phoneNumber,
      address: address !== undefined ? address : nominee.address,
      sharePercentage: sharePercentage !== undefined ? sharePercentage : nominee.sharePercentage
    });
    
    res.status(200).json({ success: true, message: 'Nominee updated successfully', data: nominee });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating nominee', error: error.message });
  }
};

// Delete Nominee
exports.deleteNominee = async (req, res) => {
  try {
    const { id } = req.params;
    const nominee = await Nominee.findByPk(id);

    if (!nominee) {
      return res.status(404).json({ success: false, message: 'Nominee not found' });
    }

    await nominee.destroy();
    res.status(200).json({ success: true, message: 'Nominee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting nominee', error: error.message });
  }
};
