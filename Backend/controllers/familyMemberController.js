const { FamilyMember, User } = require('../models/index');

// Create Family Member
exports.createFamilyMember = async (req, res) => {
  try {
    const { userId, name, dob, relation, isDependent, phoneNumber, occupation, aadharNumber } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'UserId is required' });
    }

    const familyMember = await FamilyMember.create({ userId, name, dob, relation, isDependent, phoneNumber, occupation, aadharNumber });
    res.status(201).json({ success: true, message: 'Family member created successfully', data: familyMember });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating family member', error: error.message });
  }
};

// Get all Family Members
exports.getAllFamilyMembers = async (req, res) => {
  try {
    const familyMembers = await FamilyMember.findAll({ order: [['createdAt', 'DESC']], include: [{ model: User, attributes: ['id', 'name', 'empCode'] }] });
    res.status(200).json({ success: true, data: familyMembers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching family members', error: error.message });
  }
};

// Get Family Members by User ID
exports.getFamilyMembersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const familyMembers = await FamilyMember.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, data: familyMembers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching family members', error: error.message });
  }
};

// Get My Family Members (authenticated user's own family members)
exports.getMyFamilyMembers = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const familyMembers = await FamilyMember.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
    res.status(200).json({ success: true, data: familyMembers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching family members', error: error.message });
  }
};

// Get Family Member by ID
exports.getFamilyMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const familyMember = await FamilyMember.findByPk(id);

    if (!familyMember) {
      return res.status(404).json({ success: false, message: 'Family member not found' });
    }

    res.status(200).json({ success: true, data: familyMember });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching family member', error: error.message });
  }
};

// Update Family Member
exports.updateFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, dob, relation, isDependent, phoneNumber, occupation, aadharNumber } = req.body;
    console.log(req.body);
    const familyMember = await FamilyMember.findByPk(id);
    if (!familyMember) {
      return res.status(404).json({ success: false, message: 'Family member not found' });
    }

    await familyMember.update({ 
      name: name !== undefined ? name : familyMember.name,
      dob: dob !== undefined ? dob : familyMember.dob,
      relation: relation !== undefined ? relation : familyMember.relation,
      isDependent: isDependent !== undefined ? isDependent : familyMember.isDependent,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : familyMember.phoneNumber,
      occupation: occupation !== undefined ? occupation : familyMember.occupation,
      aadharNumber: aadharNumber !== undefined ? aadharNumber : familyMember.aadharNumber
    });
    
    res.status(200).json({ success: true, message: 'Family member updated successfully', data: familyMember });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating family member', error: error.message });
  }
};

// Delete Family Member
exports.deleteFamilyMember = async (req, res) => {
  try {
    const { id } = req.params;
    const familyMember = await FamilyMember.findByPk(id);

    if (!familyMember) {
      return res.status(404).json({ success: false, message: 'Family member not found' });
    }

    await familyMember.destroy();
    res.status(200).json({ success: true, message: 'Family member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting family member', error: error.message });
  }
};
