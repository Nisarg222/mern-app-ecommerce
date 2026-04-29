const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class UserAddress extends Model {
  toJSON() {
    const v = super.toJSON();
    v._id = v.id;
    return v;
  }
}

UserAddress.init(
  {
    id:         { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId:     { type: DataTypes.INTEGER, allowNull: false },
    label:      { type: DataTypes.STRING(50), defaultValue: 'Home' },
    street:     { type: DataTypes.STRING(255), allowNull: false },
    city:       { type: DataTypes.STRING(100), allowNull: false },
    state:      { type: DataTypes.STRING(100), allowNull: false },
    postalCode: { type: DataTypes.STRING(20), allowNull: false },
    country:    { type: DataTypes.STRING(100), defaultValue: 'India' },
    isDefault:  { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName:  'UserAddress',
    tableName:  'user_addresses',
    timestamps: true,
  }
);

module.exports = UserAddress;
