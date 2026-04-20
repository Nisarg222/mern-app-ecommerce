const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    slug:        { type: String, unique: true },
    description: { type: String, default: '' },
    image:       { type: String, default: '' },
    isActive:    { type: Boolean, default: true },
    deletedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

// slug field already has unique:true which creates an index; only need isActive
categorySchema.index({ isActive: 1 });

categorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

module.exports = mongoose.model('Category', categorySchema);
