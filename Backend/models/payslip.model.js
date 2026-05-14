const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Payslip = sequelize.define("Payslip", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  
  // Foreign key to User
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
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

  // Employee Information (from Excel)
  empCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  empName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  department: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  company: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // Document Numbers
  esiNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accountNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  uanNo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  doj: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  // Days Tracking
  workingDays: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
  },
  phDays: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
  },
  presentDays: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
  },
  weekOff: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
  },
  absent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
  },
  totalDays: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
  },

  // Earnings and Deductions (stored as JSON for flexibility)
  earningsActual: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Stores actual earnings amounts',
  },
  earningsPayable: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Stores payable earnings amounts',
  },
  deductions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'Stores all deduction components like PF, ESIC, PT, etc.',
  },

  // Totals
  grossIncome: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  grossDeduction: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },
  netAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
  },

  // File Paths
  excelFilePath: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Path to original uploaded Excel file',
  },
  pdfFilePath: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Path to generated PDF payslip',
  },

  // Upload tracking
  uploadedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    comment: 'User ID of admin/employer who uploaded',
  },

  // Remarks
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'month', 'year'],
      name: 'unique_user_month_year',
    },
    {
      fields: ['month', 'year'],
      name: 'idx_month_year',
    },
    {
      fields: ['empCode'],
      name: 'idx_emp_code',
    },
  ],
});

module.exports = Payslip;
