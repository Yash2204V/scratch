const express = require("express");
const router = express.Router();

router.get("/shop", (req,res)=>{
    const category = req.query.category;
    // const products = await product.findAll({});
    res.render("shop", {category: category});
})

router.get("/product/:id", (req,res)=>{
    // const id = req.params.id;
    // const product = await product.findOne({_id: id});
    res.render("product");
})

router.get("/cart", (req,res)=>{
    res.render("cart");
})

module.exports = router;