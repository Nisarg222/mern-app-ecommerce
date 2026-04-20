const mongoose = require('mongoose');
const slugify = require('slugify');

const productImageSchema = new mongoose.Schema({
  url:       { type: String, required: true },
  public_id: { type: String, default: '' },
  isMain:    { type: Boolean, default: false },
});

const variantSchema = new mongoose.Schema({
  size:  String,
  color: String,
  stock: { type: Number, default: 0 },
  sku:   String,
});

const productSchema = new mongoose.Schema(
  {
    name:             { type: String, required: true, trim: true },
    slug:             { type: String, unique: true },
    description:      { type: String, required: true },
    shortDescription: { type: String, default: '' },
    price:            { type: Number, required: true, min: 0 },
    comparePrice:     { type: Number, default: 0 },
    category:         { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images:           [productImageSchema],
    variants:         [variantSchema],
    stock:            { type: Number, default: 0, min: 0 },
    sku:              { type: String, unique: true, sparse: true },
    brand:            { type: String, default: '' },
    tags:             [{ type: String }],
    isFeatured:       { type: Boolean, default: false },
    isActive:         { type: Boolean, default: true },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count:   { type: Number, default: 0 },
    },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isActive: 1, deletedAt: 1 });
// slug field already has unique:true which creates an index

productSchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Product', productSchema);
