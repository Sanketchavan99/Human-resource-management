const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Enquiry } = require('../models/index');

// Mock function to send OTP
const sendMessage = (otp) => {
  console.log(`[MOCK SMS] OTP sent: ${otp}`);
};

const verifyOtp = (otp, phoneOtpHash) => {
  if(process.env.NODE_ENV === 'development') {
    return (otp === "123456");
  }
  const hash = crypto.createHash('sha256').update(otp).digest('hex');
  
  return hash === phoneOtpHash;
};

exports.register = async (req, res) => {
  try {
    const { empCode } = req.body;
    const user = await User.findOne({ where: { empCode } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found with this Employee Code' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash OTP using crypto
    const hash = crypto.createHash('sha256').update(otp).digest('hex');
    
    user.phoneOtpHash = hash; 
    user.phoneOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    sendMessage(otp);

    res.status(200).json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending OTP', error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { empCode, otp } = req.body;
    const user = await User.findOne({ where: { empCode } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Hash incoming OTP to compare
    const hash = crypto.createHash('sha256').update(otp).digest('hex');

    if (!verifyOtp(otp, user.phoneOtpHash) || user.phoneOtpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    // Clear OTP
    user.phoneOtpHash = null;
    user.phoneOtpExpires = null;
    user.isPhoneVerified = true;
    await user.save();

    // Generate JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1d' });

    // Return user without password
    const userResponse = {
      id: user.id,
      empCode: user.empCode,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      designation: user.designation,
      companyId: user.companyId,
      offerLetterPath: user.offerLetterPath,
      offerLetterUploadedAt: user.offerLetterUploadedAt,
      offerLetterAccepted: user.offerLetterAccepted,
      offerLetterAcceptedAt: user.offerLetterAcceptedAt
    };

    res.status(200).json({ success: true, message: 'OTP verified successfully', token, user: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying OTP', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { empCode, password } = req.body;
    const user = await User.findOne({ where: { empCode } });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.password) {
      return res.status(400).json({ success: false, message: 'Password not set. Please register first.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1d' });

    // Return user without password
    const userResponse = {
      id: user.id,
      empCode: user.empCode,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      designation: user.designation,
      companyId: user.companyId,
      offerLetterPath: user.offerLetterPath,
      offerLetterUploadedAt: user.offerLetterUploadedAt,
      offerLetterAccepted: user.offerLetterAccepted,
      offerLetterAcceptedAt: user.offerLetterAcceptedAt
    };

    res.status(200).json({ success: true, message: 'Login successful', token, user: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
  }
};

exports.setPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const user = req.user; // From authMiddleware

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.status(200).json({ success: true, message: 'Password set successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error setting password', error: error.message });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating password', error: error.message });
  }
};

exports.createEnquiry = async (req, res) => {
  try {
    const { name, mailId, phoneNumber, companyName } = req.body;
    const enquire = await Enquiry.create({
      name,
      mailId,
      phoneNumber,
      companyName,
    });
    return res.status(201).json({
      success: true,
      message: "Enquiry created successfully",
      enquire,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating enquiry",
      error: error.message,
    });
  }
};

exports.getEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll({ order: [["createdAt", "DESC"]], raw: true });
    const enquiriesWithEmpCode = await Promise.all(enquiries.map(async (enquiry) => {
      const user = await User.findOne({ where: { phoneNumber: enquiry.phoneNumber } });
      enquiry.empCode = user ? user.empCode : null;
      return enquiry;
    }));

    return res.status(200).json({ success: true, enquiries: enquiriesWithEmpCode });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch enquiries" });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const { Company } = require('../models/index');
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['phoneOtpHash', 'phoneOtpExpires'] },
      include: [
        { model: Company, as: 'company', attributes: ['id', 'name'] }
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return user data
    const userResponse = {
      id: user.id,
      empCode: user.empCode,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      designation: user.designation,
      companyId: user.companyId,
      company: user.company,
      offerLetterPath: user.offerLetterPath,
      offerLetterUploadedAt: user.offerLetterUploadedAt,
      offerLetterAccepted: user.offerLetterAccepted,
      offerLetterAcceptedAt: user.offerLetterAcceptedAt,
      hasPassword: !!user.password
    };

    res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching current user', error: error.message });
  }
};