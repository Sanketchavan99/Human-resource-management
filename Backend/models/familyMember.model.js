const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user.model");

const FamilyMember = sequelize.define("FamilyMember", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  relation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  aadharNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isDependent: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  isMarried: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  occupation: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  timestamps: true,
});



module.exports = FamilyMember;
