const { Model, DataTypes } = require('sequelize');
const slugify   = require('slugify');
const sequelize = require('../config/db');

class Product extends Model {
  toJSON() {
    const v = super.toJSON();
    v._id = v.id;
    // Reconstruct nested ratings object
    v.ratings = { average: v.ratingsAverage, count: v.ratingsCount };
    delete v.ratingsAverage;
    delete v.ratingsCount;
    return v;
  }
}

Product.init(
  {
    id:               { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name:             { type: DataTypes.STRING(200), allowNull: false },
    slug:             { type: DataTypes.STRING(220), unique: true },
    description:      { type: DataTypes.TEXT, allowNull: false },
    shortDescription: { type: DataTypes.STRING(500), defaultValue: '' },
    price:            { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    comparePrice:     { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    categoryId:       { type: DataTypes.INTEGER, allowNull: false },
    stock:            { type: DataTypes.INTEGER, defaultValue: 0 },
    sku:              { type: DataTypes.STRING(100), unique: true, allowNull: true },
    brand:            { type: DataTypes.STRING(100), defaultValue: '' },
    tags:             { type: DataTypes.JSON, defaultValue: [] },
    isFeatured:       { type: DataTypes.BOOLEAN, defaultValue: false },
    isActive:         { type: DataTypes.BOOLEAN, defaultValue: true },
    ratingsAverage:   { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    ratingsCount:     { type: DataTypes.INTEGER, defaultValue: 0 },
    deletedAt:        { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    modelName:  'Product',
    tableName:  'products',
    timestamps: true,
    hooks: {
      beforeSave: (product) => {
        if (product.changed('name') && product.name) {
          product.slug = slugify(product.name, { lower: true, strict: true });
        }
      },
    },
  }
);

module.exports = Product;
