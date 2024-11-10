const express = require("express");
const router = express.Router();

router.get("/shop", (req,res)=>{
    const category = req.query.category;
    res.render("shop", {category: category});
})

module.exports = router;