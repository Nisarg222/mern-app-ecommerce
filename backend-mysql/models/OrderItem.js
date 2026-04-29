const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class OrderItem extends Model {
  toJSON() {
    const v = super.toJSON();
    v._id     = v.id;
    v.variant = { size: v.variantSize || null, color: v.variantColor || null };
    delete v.variantSize;
    delete v.variantColor;
    return v;
  }
}

OrderItem.init(
  {
    id:           { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId:      { type: DataTypes.INTEGER, allowNull: false },
    productId:    { type: DataTypes.INTEGER, allowNull: true },
    name:         { type: DataTypes.STRING(200), allowNull: false },
    image:        { type: DataTypes.STRING(500), defaultValue: '' },
    price:        { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    quantity:     { type: DataTypes.INTEGER, allowNull: false },
    variantSize:  { type: DataTypes.STRING(20), allowNull: true },
    variantColor: { type: DataTypes.STRING(50), allowNull: true },
  },
  {
    sequelize,
    modelName:  'OrderItem',
    tableName:  'order_items',
    timestamps: false,
  }
);

module.exports = OrderItem;
