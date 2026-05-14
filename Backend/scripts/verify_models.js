const User = require('../models/user.model');
const FamilyMember = require('../models/familyMember.model');

try {
  console.log('User model loaded:', User.name);
  console.log('FamilyMember model loaded:', FamilyMember.name);
  console.log('Associations:', Object.keys(User.associations));
  console.log('Verification successful.');
} catch (error) {
  console.error('Verification failed:', error);
}
