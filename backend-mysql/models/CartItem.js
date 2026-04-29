const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class CartItem extends Model {
  toJSON() {
    const v = super.toJSON();
    v._id = v.id;
    v.variant = { size: v.variantSize || null, color: v.variantColor || null };
    delete v.variantSize;
    delete v.variantColor;
    return v;
  }
}

CartItem.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cartId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    variantSize: { type: DataTypes.STRING(20), allowNull: true },
    variantColor: { type: DataTypes.STRING(50), allowNull: true },
  },
  {
    sequelize,
    modelName: "CartItem",
    tableName: "cart_items",
    timestamps: false,
  },
);

module.exports = CartItem;
