import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 1,
      maxLength: 10
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minLength: 10,
      maxLength: 100
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger
      }
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: tags => {
          if (
            tags.length < 1
            || tags.every(tag => tag.trim() === '')
            || !tags.every(tag => tag.trim().length <= 5)
          ) {
            return false;
          }
          return true;
        }
      }
    },
  },
  {
    timestamps: true
  }
);

productSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;