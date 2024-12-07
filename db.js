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
        ref: "Product",
    }],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    googleId: String,
});


const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  rating: { type: Number, min:0, max:5, default:0 },
  categories:{
    type: [String],
    required: true,
    validate: {
      validator: (value)=>{
        const validCategories = {
          clothing: {
            saree: ['lehanga']
          },
          jewellery: {
            gold: ['necklace'],
            diamond: ['necklace']
          },
        };
        let currentLevel = validCategories;
        for (const category of value) {
          if (Array.isArray(currentLevel)) {
            if (!currentLevel.includes(category)) {
              return false;
            }
          } else if (typeof currentLevel === 'object' && category in currentLevel) {
            currentLevel = currentLevel[category];
          } else {
            return false; 
          }
        }
        return true;

      },
      message: ({value}) => `${value} is not a valid category path.`,
    },
  },
  brand: { type: String, default: 'Unknown' },
  images: { type: [String], default: [] },
  availability: { type: Boolean, default: true },
  price: { type: Number, required: true },
  size: {
    type: [String],
    enum: ['XS', 'S', 'M', 'L', 'XL'],
    default: [],
  },
  quantity: { type: Number, required: true, default: 0 },
  description: { type: String, default: '' },
  weight: { type: String, default: 'Not Specified' },
  createdAt: { type: Date, default: Date.now },
})


const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);

module.exports = { User, Product };