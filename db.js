const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URL);

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        maxlength: 50,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        minlength: 10,
        trim: true,
        lowercase: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
    }],
    orders: {
        type: Array,
        default: []
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    googleId: String,
});

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    category: {
      type: String,
      enum: ['Clothing', 'Gold', 'Diamond', 'Coming Soon'],
      required: true
    },
    subCategory: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          const validSubCategories = {
            Clothing: ['Saree', 'Suit'],
            Gold: [],
            Diamond: [],
            'Coming Soon': []
          };
  
          if (this.category in validSubCategories) {
            // Subcategory must be valid for the given category
            return validSubCategories[this.category].includes(value) || value === null;
          }
          return false;
        },
        message: props => `${props.value} is not a valid subcategory for category ${props.instance.category}`
      }
    },
    brand: { type: String, default: 'Unknown' },
    images: { type: [String], default: [] },
    availability: { type: Boolean, default: true },
    price: { type: Number, required: true },
    size: {
      type: [String],
      enum: ['XS', 'S', 'M', 'L', 'XL'],
      default: []
    },
    quantity: { type: Number, required: true, default: 0 },
    description: { type: String, default: '' },
    weight: { type: String, default: 'Not Specified' },
    createdAt: { type: Date, default: Date.now }
  });


const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);

module.exports = { User, Product };