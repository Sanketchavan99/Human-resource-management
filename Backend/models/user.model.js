const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// Import related models
// Note: We define associations after all models are loaded to avoid circular dependency issues during definition
// But we can define the fields here.

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  // Basic Info
  empCode: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  name: { // Client Emp Name
    type: DataTypes.STRING,
    allowNull: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lastName: { // Surname
    type: DataTypes.STRING,
    allowNull: true,
  },
  fatherName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  maritalStatus: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  education: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
  // Contact Info
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isEmail: true },
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  altPhoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },

  // Employment Info
  designation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dateOfJoining: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  lastWorkingDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  salary: { // Basic Salary
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  
  // Foreign Keys (Explicitly defined for clarity, though Sequelize adds them automatically with associations)
  companyId: {
    type: DataTypes.UUID,
    allowNull: true,
    
  },
  centerId: {
    type: DataTypes.UUID,
    allowNull: true,

  },

  // Documents
  panCardNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  drivingLicenseNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  aadharNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  nameAsPerAadhar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  fatherNameAsPerAadhar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dobAsPerAadhar: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  uanNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  esicNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  panCardPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  drivingLicensePath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  aadharPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  educationDocPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passportPhotoPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  passbookPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  chequePath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // System Fields
  isPhoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  role: {
    type: DataTypes.ENUM("employee", "teamMember", "admin", "employer"),
    allowNull: false,
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneOtpHash: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneOtpExpires: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // ESIC and ID Card Management
  esicCardPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  esicUploadedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  idCardPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  idCardGeneratedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  // Offer Letter Management
  offerLetterPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  offerLetterUploadedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  offerLetterAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  offerLetterAcceptedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = User;
