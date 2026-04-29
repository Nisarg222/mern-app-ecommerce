const { Model, DataTypes } = require('sequelize');
const bcrypt   = require('bcryptjs');
const sequelize = require('../config/db');

class User extends Model {
  async comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
  }

  toJSON() {
    const values = super.toJSON();
    delete values.password;
    delete values.resetPasswordToken;
    delete values.resetPasswordExpire;
    values._id = values.id;
    return values;
  }
}

User.init(
  {
    id:                  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:                { type: DataTypes.STRING(100), allowNull: false },
    email:               { type: DataTypes.STRING(255), allowNull: false, unique: true },
    password:            { type: DataTypes.STRING(255), allowNull: false },
    role:                { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
    avatar:              { type: DataTypes.STRING(500), defaultValue: '' },
    phone:               { type: DataTypes.STRING(20), defaultValue: '' },
    isActive:            { type: DataTypes.BOOLEAN, defaultValue: true },
    resetPasswordToken:  { type: DataTypes.STRING(255), allowNull: true },
    resetPasswordExpire: { type: DataTypes.DATE, allowNull: true },
  },
  {
    sequelize,
    modelName:  'User',
    tableName:  'users',
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed('password') && user.password) {
          user.password = await bcrypt.hash(user.password, 12);
        }
      },
    },
  }
);

module.exports = User;
