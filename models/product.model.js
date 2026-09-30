import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        default: 0
    },

    tags: {
        type: [String],
        default: []
    },

    images: {
        type: [String],
        required: true
    },

    ownerId: {
        type: Number,
        required: true,
        default: 0
    },

    favoriteCount: {
        type: Number,
        default: 0
    },

},
    { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;