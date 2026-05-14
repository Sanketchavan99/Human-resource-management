const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const PayslipDocument = sequelize.define("PayslipDocument", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  
  // Foreign key to User (whose payslip this is)
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },

  // Foreign key to Company (to which company the employee belongs)
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Companies',
      key: 'id',
    },
  },

  // Month and Year tracking
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12,
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2000,
      max: 2100,
    },
  },

  // File URL/Path
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Path to uploaded payslip file',
  },

  // Upload tracking
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    comment: 'User ID of admin/employer who uploaded',
  },

}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'month', 'year'],
      name: 'unique_user_month_year_payslip_doc',
    },
    {
      fields: ['companyId'],
      name: 'idx_payslip_doc_company',
    },
    {
      fields: ['month', 'year'],
      name: 'idx_payslip_doc_month_year',
    },
  ],
});

module.exports = PayslipDocument;
