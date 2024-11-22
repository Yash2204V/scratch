require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./db");
const PORT = process.env.PORT || 3000;

const path = require('path');
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");

const userRoute = require("./routes/user");
const productsRoute = require("./routes/products");
const accountRoute = require("./routes/account");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");

app.get("/", (req,res)=>{
    res.render("index");
})

app.use("/user", userRoute);
app.use("/products", productsRoute);
app.use("/account", accountRoute);

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})