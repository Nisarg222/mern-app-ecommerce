const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class ProductVariant extends Model {
  toJSON() {
    const v = super.toJSON();
    v._id = v.id;
    return v;
  }
}

ProductVariant.init(
  {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    size:      { type: DataTypes.STRING(20), allowNull: true },
    color:     { type: DataTypes.STRING(50), allowNull: true },
    stock:     { type: DataTypes.INTEGER, defaultValue: 0 },
    sku:       { type: DataTypes.STRING(100), allowNull: true },
  },
  {
    sequelize,
    modelName:  'ProductVariant',
    tableName:  'product_variants',
    timestamps: false,
  }
);

module.exports = ProductVariant;
