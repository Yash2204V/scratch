const express = require("express");
const router = express.Router();
const { Product } = require("../db");

router.get("/shop", async (req, res) => {
    try {
        const category = req.query.category; // e.g., "Clothing"
        const filter = category ? { category } : {}; // Filter by category if provided
        const products = await Product.find(filter); // Fetch products from DB
        console.log(products.subCategory);
        
        res.render("shop", { category, products });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/product/:id", (req,res)=>{
    // const id = req.params.id;
    // const product = await product.findOne({_id: id});
    res.render("product");
})

router.get("/cart", (req,res)=>{
    res.render("cart");
})

//global catch
router.use((error, req, res, next) => {
    console.error(error);
    res.status(500).send("Internal Server Error");
});

module.exports = router;