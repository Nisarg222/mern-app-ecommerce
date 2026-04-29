const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class Cart extends Model {
  toJSON() {
    const v = super.toJSON();
    v._id = v.id;
    // Compute virtual totals if items are loaded
    if (Array.isArray(v.items)) {
      v.subtotal = v.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );
      v.total = v.subtotal - (Number(v.discount) || 0);
    }
    return v;
  }
}

Cart.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    couponCode: { type: DataTypes.STRING(50), defaultValue: "" },
    discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  },
  {
    sequelize,
    modelName: "Cart",
    tableName: "carts",
    timestamps: true,
  },
);

module.exports = Cart;
