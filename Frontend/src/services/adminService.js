import userService from './userService';
import centerService from './centerService';
import companyService from './companyService';
import addressService from './addressService';
import bankDetailService from './bankDetailService';
import emergencyContactService from './emergencyContactService';
import familyMemberService from './familyMemberService';
import nomineeService from './nomineeService';

/**
 * Admin Service
 * Consolidated admin data management functions
 * Groups all admin operations for easy access
 */

const adminService = {
  // ==================== USER MANAGEMENT ====================
  users: {
    getAll: userService.getAllUsers,
    getById: userService.getUserById,
    update: userService.updateUser,
    delete: userService.deleteUser,
    bulkUpload: userService.bulkUploadUsers,
  },

  // ==================== CENTER MANAGEMENT ====================
  centers: {
    getAll: centerService.getAllCenters,
    getById: centerService.getCenterById,
    create: centerService.createCenter,
    update: centerService.updateCenter,
    delete: centerService.deleteCenter,
  },

  // ==================== COMPANY MANAGEMENT ====================
  companies: {
    getAll: companyService.getAllCompanies,
    getById: companyService.getCompanyById,
    create: companyService.createCompany,
    update: companyService.updateCompany,
    delete: companyService.deleteCompany,
  },

  // ==================== ADDRESS MANAGEMENT ====================
  addresses: {
    getAll: addressService.getAllAddresses,
    getById: addressService.getAddressById,
    getByUserId: addressService.getAddressesByUserId,
    create: addressService.createAddress,
    update: addressService.updateAddress,
    delete: addressService.deleteAddress,
  },

  // ==================== BANK DETAIL MANAGEMENT ====================
  bankDetails: {
    getAll: bankDetailService.getAllBankDetails,
    getById: bankDetailService.getBankDetailById,
    getByUserId: bankDetailService.getBankDetailByUserId,
    create: bankDetailService.createBankDetail,
    update: bankDetailService.updateBankDetail,
    delete: bankDetailService.deleteBankDetail,
  },

  // ==================== EMERGENCY CONTACT MANAGEMENT ====================
  emergencyContacts: {
    getAll: emergencyContactService.getAllEmergencyContacts,
    getById: emergencyContactService.getEmergencyContactById,
    getByUserId: emergencyContactService.getEmergencyContactByUserId,
    create: emergencyContactService.createEmergencyContact,
    update: emergencyContactService.updateEmergencyContact,
    delete: emergencyContactService.deleteEmergencyContact,
  },

  // ==================== FAMILY MEMBER MANAGEMENT ====================
  familyMembers: {
    getAll: familyMemberService.getAllFamilyMembers,
    getById: familyMemberService.getFamilyMemberById,
    getByUserId: familyMemberService.getFamilyMembersByUserId,
    create: familyMemberService.createFamilyMember,
    update: familyMemberService.updateFamilyMember,
    delete: familyMemberService.deleteFamilyMember,
  },

  // ==================== NOMINEE MANAGEMENT ====================
  nominees: {
    getAll: nomineeService.getAllNominees,
    getById: nomineeService.getNomineeById,
    getByUserId: nomineeService.getNomineesByUserId,
    create: nomineeService.createNominee,
    update: nomineeService.updateNominee,
    delete: nomineeService.deleteNominee,
  },
};

export default adminService;
