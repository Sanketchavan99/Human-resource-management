const { BankDetail, User } = require('../models/index');

// Create Bank Detail
exports.createBankDetail = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const { bankName, accountNumber, ifscCode, accountType, branchName, accountHolderName } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'UserId is required' });
    }

    // Check if bank detail already exists for this user (one-to-one relationship)
    const existingBankDetail = await BankDetail.findOne({ where: { userId } });
    if (existingBankDetail) {
      return res.status(400).json({ success: false, message: 'Bank detail already exists for this user' });
    }

    const bankDetail = await BankDetail.create({ userId, bankName, accountNumber, ifscCode, accountType, branchName, accountHolderName });
    res.status(201).json({ success: true, message: 'Bank detail created successfully', data: bankDetail });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating bank detail', error: error.message });
  }
};

// Get all Bank Details
exports.getAllBankDetails = async (req, res) => {
  try {
    const bankDetails = await BankDetail.findAll({ order: [['createdAt', 'DESC']], include: [{ model: User, attributes: ['id', 'name', 'empCode'] }] });
    res.status(200).json({ success: true, data: bankDetails });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bank details', error: error.message });
  }
};

// Get Bank Detail by User ID
exports.getBankDetailByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const bankDetail = await BankDetail.findOne({ where: { userId } });

    if (!bankDetail) {
      return res.status(404).json({ success: false, message: 'Bank detail not found for this user' });
    }

    res.status(200).json({ success: true, data: bankDetail });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bank detail', error: error.message });
  }
};

// Get My Bank Detail (authenticated user's own bank detail)
exports.getMyBankDetail = async (req, res) => {
  try {
    const userId = req.user.id; // Get from authenticated user
    const bankDetail = await BankDetail.findOne({ where: { userId } });

    if (!bankDetail) {
      return res.status(404).json({ success: false, message: 'Bank detail not found' });
    }

    res.status(200).json({ success: true, data: bankDetail });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bank detail', error: error.message });
  }
};

// Get Bank Detail by ID
exports.getBankDetailById = async (req, res) => {
  try {
    const { id } = req.params;
    const bankDetail = await BankDetail.findByPk(id);

    if (!bankDetail) {
      return res.status(404).json({ success: false, message: 'Bank detail not found' });
    }

    res.status(200).json({ success: true, data: bankDetail });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bank detail', error: error.message });
  }
};

// Update Bank Detail
exports.updateBankDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { bankName, accountNumber, ifscCode, accountType, branchName, accountHolderName } = req.body;

    const bankDetail = await BankDetail.findByPk(id);
    if (!bankDetail) {
      return res.status(404).json({ success: false, message: 'Bank detail not found' });
    }

    await bankDetail.update({ 
      bankName: bankName !== undefined ? bankName : bankDetail.bankName,
      accountNumber: accountNumber !== undefined ? accountNumber : bankDetail.accountNumber,
      ifscCode: ifscCode !== undefined ? ifscCode : bankDetail.ifscCode,
      accountType: accountType !== undefined ? accountType : bankDetail.accountType,
      branchName: branchName !== undefined ? branchName : bankDetail.branchName,
      accountHolderName: accountHolderName !== undefined ? accountHolderName : bankDetail.accountHolderName,
    });
    
    res.status(200).json({ success: true, message: 'Bank detail updated successfully', data: bankDetail });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating bank detail', error: error.message });
  }
};

// Delete Bank Detail
exports.deleteBankDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const bankDetail = await BankDetail.findByPk(id);

    if (!bankDetail) {
      return res.status(404).json({ success: false, message: 'Bank detail not found' });
    }

    await bankDetail.destroy();
    res.status(200).json({ success: true, message: 'Bank detail deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting bank detail', error: error.message });
  }
};
