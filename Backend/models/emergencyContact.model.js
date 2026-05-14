const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const EmergencyContact = sequelize.define("EmergencyContact", {
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
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  relation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});

module.exports = EmergencyContact;
