const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class OrderStatusHistory extends Model {
  toJSON() {
    const v = super.toJSON();
    v._id = v.id;
    return v;
  }
}

OrderStatusHistory.init(
  {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId:   { type: DataTypes.INTEGER, allowNull: false },
    status:    { type: DataTypes.STRING(50), allowNull: false },
    note:      { type: DataTypes.TEXT, defaultValue: '' },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName:  'OrderStatusHistory',
    tableName:  'order_status_history',
    timestamps: false,
  }
);

module.exports = OrderStatusHistory;
