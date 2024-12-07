require('dotenv').config(); 
const mongoose = require("mongoose");

mongoose
.connect(process.env.MONGO_URL)
// .connect('mongodb://127.0.0.1:27017/XYZ-Something');
.then(function(){
    console.log("Connected to MongoDB");
})
.catch(function(err){
    console.log(err);
})

module.exports = {
    JWT_SECRET: process.env.JWT_SECRET,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET,
    APP_PASSWORD: process.env.APP_PASSWORD,
    EMAIL: process.env.EMAIL,
    mongooseConnection: mongoose.connection
};
