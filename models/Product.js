import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '상품명 입력은 필수입니다.'],
      trim: true,
      minLength: [1, '상품명은 1글자 이상 입력해주세요.'],
      maxLength: [10, '상품명은 10글자 이하로 입력해주세요.']
    },
    description: {
      type: String,
      required: [true, '상품 소개 입력은 필수입니다.'],
      trim: true,
      minLength: [10, '상품 소개는 10글자 이상 입력해주세요.'],
      maxLength: [100, '상품 소개는 100글자 이하로 입력해주세요.']
    },
    price: {
      type: Number,
      required: [true, '판매 가격 입력은 필수입니다.'],
      min: [0, '판매 가격은 0원 이상 입력해주세요.'],
      validate: {
        validator: Number.isInteger,
        message: '판매 가격은 0과 자연수만 입력해주세요.'
      }
    },
    tags: {
      type: [String],
      required: true,
      validate: [
        {
          validator: tags => tags.length > 0,
          message: '태그 입력은 필수입니다.'
        },
        {
          validator: tags => tags.every(tag => tag.trim() !== ''),
          message: '태그는 1글자 이상 입력해주세요.'
        },
        {
          validator: tags => tags.every(tag => tag.trim().length <= 5),
          message: '태그는 5글자 이하로 입력해주세요.'
        },
      ]
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