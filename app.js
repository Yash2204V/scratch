require("dotenv").config();
const express = require("express");
const session = require("express-session");
const app = express();
const db = require("./db");
const PORT = process.env.PORT || 3000;

const path = require('path');
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");

const userRoute = require("./routes/user");
const productsRoute = require("./routes/products");
const accountRoute = require("./routes/account");

// Set up session middleware
app.use(session({
    secret: process.env.SECRET_KEY, // Choose a secret string for signing the session ID cookie
    resave: false, // Don't resave the session if it hasn't changed
    saveUninitialized: true, // Save uninitialized sessions
    cookie: { secure: process.env.NODE_ENV === "production" } // Set to true if you're using https
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");

// Middleware to check if the user is logged in
app.use((req, res, next) => {
    res.locals.token = req.cookies.token ? true : false;
    next();
});

app.get("/", (req,res)=>{
    const error = req.flash("error");
    const success = req.flash("success");
    res.render("index", { error, success });
})

app.use("/user", userRoute);
app.use("/products", productsRoute);
app.use("/account", accountRoute);

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})