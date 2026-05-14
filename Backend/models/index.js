const { sequelize } = require("../config/database");
const User = require("./user.model");
const Company = require("./company.model");
const Center = require("./center.model");
const BankDetail = require("./bankDetail.model");
const EmergencyContact = require("./emergencyContact.model");
const Nominee = require("./nominee.model");
const Address = require("./address.model");
const FamilyMember = require("./familyMember.model");
const Enquiry = require("./enquiry.model");
const Payslip = require("./payslip.model");
const PayslipDocument = require("./payslipDocument.model");

// Define Associations


// User - Center
User.belongsTo(Center, { foreignKey: 'centerId', as: 'center' });
Center.hasMany(User, { foreignKey: 'centerId', as: 'users' });

// User - BankDetail
User.hasOne(BankDetail, { foreignKey: 'userId', as: 'bankDetail' });
BankDetail.belongsTo(User, { foreignKey: 'userId' });

// User - EmergencyContact
User.hasOne(EmergencyContact, { foreignKey: 'userId', as: 'emergencyContact' });
EmergencyContact.belongsTo(User, { foreignKey: 'userId' });

// User - Nominee
User.hasMany(Nominee, { foreignKey: 'userId', as: 'nominees' });
Nominee.belongsTo(User, { foreignKey: 'userId' });

// User - Address
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses' });
Address.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(FamilyMember, { foreignKey: 'userId', as: 'familyMembers' });
FamilyMember.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Company, { foreignKey: 'userId', as: 'ownedCompany' });
Company.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

Company.hasMany(User, { foreignKey: 'companyId', as: 'employees' });
User.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// User - FamilyMember (Already defined in familyMember.js but good to centralize or keep consistent)
// Re-defining here for clarity if not already loaded, but since we require familyMember.js which has the association, we should be careful not to duplicate.
// Ideally, we remove the association from familyMember.js and put it here, OR we just import it.
// For now, let's keep the association in familyMember.js as it was working, but to be safe, let's ensure it's consistent.

// User - Payslip
User.hasMany(Payslip, { foreignKey: 'userId', as: 'payslips' });
Payslip.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - PayslipDocument
User.hasMany(PayslipDocument, { foreignKey: 'userId', as: 'payslipDocuments' });
PayslipDocument.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Company - PayslipDocument
Company.hasMany(PayslipDocument, { foreignKey: 'companyId', as: 'payslipDocuments' });
PayslipDocument.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

module.exports = {
  sequelize,
  User,
  Company,
  Center,
  BankDetail,
  EmergencyContact,
  Nominee,
  Address,
  FamilyMember,
  Enquiry,
  Payslip,
  PayslipDocument
};
