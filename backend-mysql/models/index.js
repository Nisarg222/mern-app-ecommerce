const User = require("./User");
const UserAddress = require("./UserAddress");
const Category = require("./Category");
const Product = require("./Product");
const ProductImage = require("./ProductImage");
const ProductVariant = require("./ProductVariant");
const Cart = require("./Cart");
const CartItem = require("./CartItem");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const OrderStatusHistory = require("./OrderStatusHistory");

// ─── Associations ─────────────────────────────────────────────────────────────

User.hasMany(UserAddress, {
  foreignKey: "userId",
  as: "addresses",
  onDelete: "CASCADE",
});
UserAddress.belongsTo(User, { foreignKey: "userId" });

User.hasOne(Cart, { foreignKey: "userId", onDelete: "CASCADE" });
Cart.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Order, { foreignKey: "userId", onDelete: "RESTRICT" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

Category.hasMany(Product, { foreignKey: "categoryId", onDelete: "RESTRICT" });
Product.belongsTo(Category, { foreignKey: "categoryId", as: "category" });

Product.hasMany(ProductImage, {
  foreignKey: "productId",
  as: "images",
  onDelete: "CASCADE",
});
ProductImage.belongsTo(Product, { foreignKey: "productId" });

Product.hasMany(ProductVariant, {
  foreignKey: "productId",
  as: "variants",
  onDelete: "CASCADE",
});
ProductVariant.belongsTo(Product, { foreignKey: "productId" });

Cart.hasMany(CartItem, {
  foreignKey: "cartId",
  as: "items",
  onDelete: "CASCADE",
});
CartItem.belongsTo(Cart, { foreignKey: "cartId" });

CartItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(CartItem, { foreignKey: "productId" });

Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
  onDelete: "CASCADE",
});
OrderItem.belongsTo(Order, { foreignKey: "orderId" });

OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(OrderItem, { foreignKey: "productId" });

Order.hasMany(OrderStatusHistory, {
  foreignKey: "orderId",
  as: "statusHistory",
  onDelete: "CASCADE",
});
OrderStatusHistory.belongsTo(Order, { foreignKey: "orderId" });

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  User,
  UserAddress,
  Category,
  Product,
  ProductImage,
  ProductVariant,
  Cart,
  CartItem,
  Order,
  OrderItem,
  OrderStatusHistory,
};
