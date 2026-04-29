const { Model, DataTypes } = require("sequelize");
const slugify = require("slugify");
const sequelize = require("../config/db");

class Category extends Model {
  toJSON() {
    const v = super.toJSON();
    v._id = v.id;
    return v;
  }
}

Category.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    slug: { type: DataTypes.STRING(120), unique: true },
    description: { type: DataTypes.TEXT, defaultValue: "" },
    image: { type: DataTypes.STRING(500), defaultValue: "" },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    deletedAt: { type: DataTypes.DATE, allowNull: true, defaultValue: null },
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "categories",
    timestamps: true,
    hooks: {
      beforeSave: (category) => {
        if (category.changed("name") && category.name) {
          category.slug = slugify(category.name, { lower: true, strict: true });
        }
      },
    },
  },
);

module.exports = Category;
