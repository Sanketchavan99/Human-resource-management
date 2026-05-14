const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user.model");

const BankDetail = sequelize.define("BankDetail", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true, // One-to-One
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  ifscCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accountType: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  branchName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  accountHolderName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = BankDetail;
