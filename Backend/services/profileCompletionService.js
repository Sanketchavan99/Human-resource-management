const { User, Address, BankDetail, EmergencyContact, FamilyMember, Nominee } = require('../models');

/**
 * Calculate profile completion percentage for a user
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Profile completion data
 */
const calculateProfileCompletion = async (userId) => {
  try {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'otp', 'otpExpiry'] }
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const completion = {
      totalPercentage: 0,
      sections: {},
      missingFields: []
    };

    // 1. Personal Details (20%)
    const personalDetailsFields = [
      'firstName', 'lastName', 'fatherName', 'dob', 'gender', 
      'maritalStatus', 'education', 'email', 'phoneNumber',
      'designation', 'dateOfJoining', 'salary', 'panCardNumber', 'aadharNumber'
    ];
    
    const filledPersonalFields = personalDetailsFields.filter(field => 
      user[field] !== null && user[field] !== undefined && user[field] !== ''
    );
    
    const personalDetailsPercentage = (filledPersonalFields.length / personalDetailsFields.length) * 20;
    completion.sections.personalDetails = {
      percentage: Math.round(personalDetailsPercentage),
      completed: personalDetailsPercentage === 20,
      total: personalDetailsFields.length,
      filled: filledPersonalFields.length
    };
    
    if (personalDetailsPercentage < 20) {
      const missingPersonal = personalDetailsFields.filter(field => 
        !user[field] || user[field] === ''
      );
      completion.missingFields.push({
        section: 'Personal Details',
        fields: missingPersonal
      });
    }

    // 2. Address (15%)
    const addresses = await Address.findAll({ where: { userId } });
    const addressPercentage = addresses.length >= 1 ? 15 : 0;
    completion.sections.address = {
      percentage: addressPercentage,
      completed: addressPercentage === 15,
      count: addresses.length
    };
    
    if (addressPercentage === 0) {
      completion.missingFields.push({
        section: 'Address',
        fields: ['At least one address required']
      });
    }

    // 3. Bank Details (15%)
    const bankDetail = await BankDetail.findOne({ where: { userId } });
    let bankPercentage = 0;
    if (bankDetail) {
      const bankFields = ['accountNumber', 'ifscCode', 'bankName', 'branchName', 'accountHolderName', 'accountType'];
      const filledBankFields = bankFields.filter(field => 
        bankDetail[field] !== null && bankDetail[field] !== undefined && bankDetail[field] !== ''
      );
      bankPercentage = (filledBankFields.length / bankFields.length) * 15;
    }
    
    completion.sections.bankDetails = {
      percentage: Math.round(bankPercentage),
      completed: bankPercentage === 15,
      exists: !!bankDetail
    };
    
    if (bankPercentage < 15) {
      completion.missingFields.push({
        section: 'Bank Details',
        fields: !bankDetail ? ['Bank details required'] : ['Complete all bank fields']
      });
    }

    // 4. Emergency Contact (10%)
    const emergencyContact = await EmergencyContact.findOne({ where: { userId } });
    let emergencyPercentage = 0;
    if (emergencyContact) {
      const emergencyFields = ['name', 'relation', 'phoneNumber'];
      const filledEmergencyFields = emergencyFields.filter(field => 
        emergencyContact[field] !== null && emergencyContact[field] !== undefined && emergencyContact[field] !== ''
      );
      emergencyPercentage = (filledEmergencyFields.length / emergencyFields.length) * 10;
    }
    
    completion.sections.emergencyContact = {
      percentage: Math.round(emergencyPercentage),
      completed: emergencyPercentage === 10,
      exists: !!emergencyContact
    };
    
    if (emergencyPercentage < 10) {
      completion.missingFields.push({
        section: 'Emergency Contact',
        fields: !emergencyContact ? ['Emergency contact required'] : ['Complete all emergency contact fields']
      });
    }

    // 5. Family Members (10%) - Optional but adds to completion
    const familyMembers = await FamilyMember.findAll({ where: { userId } });
    const familyPercentage = familyMembers.length >= 1 ? 10 : 0;
    completion.sections.familyMembers = {
      percentage: familyPercentage,
      completed: familyPercentage === 10,
      count: familyMembers.length,
      optional: true
    };

    // 6. Nominees (15%)
    const nominees = await Nominee.findAll({ where: { userId } });
    let nomineePercentage = 0;
    if (nominees.length > 0) {
      // Check if total share percentage equals 100
      const totalShare = nominees.reduce((sum, nominee) => sum + (nominee.sharePercentage || 0), 0);
      nomineePercentage = totalShare === 100 ? 15 : (totalShare / 100) * 15;
    }
    
    completion.sections.nominees = {
      percentage: Math.round(nomineePercentage),
      completed: nomineePercentage === 15,
      count: nominees.length
    };
    
    if (nomineePercentage < 15) {
      completion.missingFields.push({
        section: 'Nominees',
        fields: nominees.length === 0 ? ['At least one nominee required'] : ['Total share percentage must equal 100%']
      });
    }

    // 7. Documents (15%)
    let documentsPercentage = 0;
    const requiredDocs = ['aadharPath', 'panCardPath'];
    const filledRequiredDocs = requiredDocs.filter(doc => 
      user[doc] !== null && user[doc] !== undefined && user[doc] !== ''
    );
    
    if (filledRequiredDocs.length === requiredDocs.length) {
      documentsPercentage = 15;
      // Add bonus for driving license
      if (user.drivingLicensePath) {
        // Already at max for this section
      }
    } else {
      documentsPercentage = (filledRequiredDocs.length / requiredDocs.length) * 15;
    }
    
    completion.sections.documents = {
      percentage: Math.round(documentsPercentage),
      completed: documentsPercentage === 15,
      uploaded: {
        aadhar: !!user.aadharPath,
        panCard: !!user.panCardPath,
        drivingLicense: !!user.drivingLicensePath
      }
    };
    
    if (documentsPercentage < 15) {
      const missingDocs = [];
      if (!user.aadharPath) missingDocs.push('Aadhar Card');
      if (!user.panCardPath) missingDocs.push('PAN Card');
      
      completion.missingFields.push({
        section: 'Documents',
        fields: missingDocs
      });
    }

    // Calculate total percentage
    completion.totalPercentage = Math.round(
      completion.sections.personalDetails.percentage +
      completion.sections.address.percentage +
      completion.sections.bankDetails.percentage +
      completion.sections.emergencyContact.percentage +
      completion.sections.familyMembers.percentage +
      completion.sections.nominees.percentage +
      completion.sections.documents.percentage
    );

    completion.isComplete = completion.totalPercentage === 100;

    return { success: true, data: completion };

  } catch (error) {
    console.error('Error calculating profile completion:', error);
    return { success: false, message: 'Error calculating profile completion', error: error.message };
  }
};

module.exports = {
  calculateProfileCompletion
};
