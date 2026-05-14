const { 
  sequelize, 
  User, 
  Company, 
  Center, 
  BankDetail, 
  EmergencyContact, 
  Nominee, 
  Address, 
  FamilyMember 
} = require('../models/index');

async function verifyModels() {
  try {
    console.log('Checking models...');
    const models = [User, Company, Center, BankDetail, EmergencyContact, Nominee, Address, FamilyMember];
    models.forEach(m => console.log(`- ${m.name} loaded.`));

    console.log('\nChecking associations...');
    console.log('User associations:', Object.keys(User.associations));
    console.log('Company associations:', Object.keys(Company.associations));
    console.log('Center associations:', Object.keys(Center.associations));
    
    // Optional: Sync to check for SQL errors (dry run if possible, or just check definitions)
    // await sequelize.sync({ force: false }); 
    // console.log('\nDatabase sync successful (schema is valid).');

    console.log('\nVerification complete.');
  } catch (error) {
    console.error('Verification failed:', error);
  } finally {
    await sequelize.close();
  }
}

verifyModels();
