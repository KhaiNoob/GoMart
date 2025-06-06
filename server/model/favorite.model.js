import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },

    productDetails: {
        name: String,
        image: Array,
        price: Number,
        discount: Number,
    }
},{
    timestamps: true,
})

favoriteSchema.index({userId: 1, productId: 1}, {unique: true})

const FavoriteModel = mongoose.model('Favorite', favoriteSchema)

export default FavoriteModel
