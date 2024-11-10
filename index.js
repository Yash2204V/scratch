require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const flash = require("connect-flash");
const accountRoute = require("./routes/account");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(flash());

app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");

app.get("/", (req,res)=>{
    res.render("index");
})

app.use("/account", accountRoute)

app.listen(PORT, ()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})