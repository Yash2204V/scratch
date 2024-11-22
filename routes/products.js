const express = require("express");
const router = express.Router();
const { Product, User } = require("../db");
const { authTokenMiddleware } = require("../middleware");

router.get("/shop", async (req, res) => {
    try {
        const { sort, category } = req.query; // Fetch sorting option and category filter from query params

        // Fetch products from the database based on category (if specified)
        const products = category 
            ? await Product.find({ category }) 
            : await Product.find();

        // Sort the products
        let sortedProducts = [...products];
        if (sort === "low-high") {
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (sort === "high-low") {
            sortedProducts.sort((a, b) => b.price - a.price);
        } else if (sort === "latest") {
            sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Assumes `createdAt` field exists
        }

        // Extract unique subcategories from the products
        const subCategories = [...new Set(products.map((prod) => prod.subCategory))].filter(Boolean);

        // Render the shop page with sorted and filtered products, subcategories, and the selected category
        res.render("shop", { products: sortedProducts, subCategories, category });
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

router.get("/cart", authTokenMiddleware, async (req,res)=>{
    const id = req.userId;
    const user = await User.findOne({_id: id })
    .populate("cart");
    // let success = req.flash("success");
    res.render("cart", {user} );
})

router.get('/addtocart/:productid', authTokenMiddleware, async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await User.findOne({ _id: req.userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.cart.push(req.params.productid); // Add the product to the cart
        await user.save();
        // req.flash("success", "Added to Cart");
        res.redirect("/products/shop");
    } catch (e) {
        console.error(e); // Log the error
        res.status(500).json({ error: e.message || "Internal Server Error" });
    }
});



// ---------------------------------------------------------------------------------
// Admin

router.post("/create", async (req,res)=>{
    try{
        const newProduct = new Product({
            title: "Festive Yellow Saree",
            category: "clothing",
            subCategory: "saree",
            price: 1299,
            size: ["M", "L", "XL"],
            quantity: 30,
            description: "A vibrant yellow saree perfect for festive occasions.",
            images: ["yellow_saree1.jpg", "yellow_saree2.jpg"],
        });
          const savedProduct = await newProduct.save();
          res.status(201).json({
            "product created": savedProduct
          })
    } catch(e) {
        res.status(400).json({
            message: "Invalid Product"
        })
    }
})


//global catch
router.use((error, req, res, next) => {
    console.error(error);
    res.status(500).send("Internal Server Error");
});

module.exports = router;