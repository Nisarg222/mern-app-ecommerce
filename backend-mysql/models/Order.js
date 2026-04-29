const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Order extends Model {
  toJSON() {
    const v = super.toJSON();
    v._id = v.id;
    // Reconstruct nested shippingAddress from flat columns
    v.shippingAddress = {
      label:      v.shippingLabel,
      street:     v.shippingStreet,
      city:       v.shippingCity,
      state:      v.shippingState,
      postalCode: v.shippingPostalCode,
      country:    v.shippingCountry,
    };
    delete v.shippingLabel;
    delete v.shippingStreet;
    delete v.shippingCity;
    delete v.shippingState;
    delete v.shippingPostalCode;
    delete v.shippingCountry;
    return v;
  }
}

Order.init(
  {
    id:              { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId:         { type: DataTypes.STRING(50), allowNull: false, unique: true },
    userId:          { type: DataTypes.INTEGER, allowNull: false },

    // Shipping address (flattened)
    shippingLabel:      { type: DataTypes.STRING(50), allowNull: true },
    shippingStreet:     { type: DataTypes.STRING(255), allowNull: false },
    shippingCity:       { type: DataTypes.STRING(100), allowNull: false },
    shippingState:      { type: DataTypes.STRING(100), allowNull: false },
    shippingPostalCode: { type: DataTypes.STRING(20), allowNull: false },
    shippingCountry:    { type: DataTypes.STRING(100), defaultValue: 'India' },

    paymentMethod: {
      type:         DataTypes.ENUM('cod', 'stripe', 'razorpay', 'paypal'),
      defaultValue: 'cod',
    },
    paymentStatus: {
      type:         DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending',
    },
    paymentId: { type: DataTypes.STRING(100), defaultValue: '' },

    orderStatus: {
      type: DataTypes.ENUM(
        'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'
      ),
      defaultValue: 'pending',
    },

    subtotal:     { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    shippingCost: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    discount:     { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    tax:          { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total:        { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    notes:        { type: DataTypes.TEXT, defaultValue: '' },

    deliveredAt: { type: DataTypes.DATE, allowNull: true },
    cancelledAt: { type: DataTypes.DATE, allowNull: true },
    deletedAt:   { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    modelName:  'Order',
    tableName:  'orders',
    timestamps: true,
  }
);

module.exports = Order;
