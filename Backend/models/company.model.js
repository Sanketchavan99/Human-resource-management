const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./user.model");

const Company = sequelize.define("Company", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: User,
      key: "id",
    },
  },

  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  logoPath: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  
}, {
  timestamps: true,
});

module.exports = Company;
