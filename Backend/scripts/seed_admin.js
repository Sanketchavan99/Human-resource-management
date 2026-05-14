const bcrypt = require('bcryptjs');
const { User, sequelize } = require('../models/index');

async function seedAdmin() {
  try {
    // await sequelize.sync({ alter: true }); // Ensure tables exist and are updated

    const adminCode = 'ADMIN001';

  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      console.log(hashedPassword, typeof hashedPassword);

      // admin = await User.create({
      //   empCode: adminCode,
      //   name: 'System Admin',
      //   email: 'admin@hirelyft.com',
      //   role: 'admin',
      //   isPhoneVerified: true,
      //   password: hashedPassword
      // });
      console.log('Admin user created:', adminCode);
   
  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await sequelize.close();
  }
}

seedAdmin();
