const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class ProductImage extends Model {
  toJSON() {
    const v = super.toJSON();
    v._id = v.id;
    return v;
  }
}

ProductImage.init(
  {
    id:        { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    url:       { type: DataTypes.STRING(500), allowNull: false },
    publicId:  { type: DataTypes.STRING(255), defaultValue: '' },
    isMain:    { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName:  'ProductImage',
    tableName:  'product_images',
    timestamps: false,
  }
);

module.exports = ProductImage;
