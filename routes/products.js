const express = require("express");
const router = express.Router();
const { Product, User } = require("../db");
const { authTokenMiddleware } = require("../middleware");

router.get("/shop", async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 30; // Default to 30 products per page
    const skip = (page - 1) * limit;
// --------------------------------------------------------------------------
    try {
        const error = req.flash("error") || [];
        const success = req.flash("success") || [];
        const { sort, category } = req.query; 
        
// --------------------------------------------------------------------------
    // Pagination!
        const products = category
            ? await Product.find({ "categories.0": category })
            : await Product.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // You can sort based on other criteria
    
            const totalProducts = await Product.countDocuments();
            const totalPages = Math.ceil(totalProducts / limit);
// ------------------------------------------------------------------------
        let sortedProducts = [...products];
        if (sort === "low-high") {
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (sort === "high-low") {
            sortedProducts.sort((a, b) => b.price - a.price);
        } else if (sort === "latest") {
            sortedProducts.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            ); 
        }

        const categories = [
            ...new Set(products.map((prod) => JSON.stringify(prod.categories))),
        ].map((item) => JSON.parse(item));

        const groupedProducts = categories.reduce((acc, categoryArray) => {
            const [category, subCategory, item] = categoryArray;
            if (!acc[category]) {
                acc[category] = {};
            }
            if (!acc[category][subCategory]) {
                acc[category][subCategory] = []; 
            }
            acc[category][subCategory].push(item); 
            return acc;
        }, {});

        const subCategories = [
            ...new Set(products.map((prod) => prod.categories[1])),
        ].filter(Boolean);
// -------------------------------------------------

        res.render("shop", {
            products: sortedProducts,
            subCategories,
            category,
            error,
            success,
            groupedProducts,
            products,
            currentPage: page,
            totalPages
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).send("Internal Server Error");
    }
});


router.get("/product/:id", async (req,res)=>{
    const id = req.params.id;
    const product = await Product.findOne({_id: id});
    res.render("product", {product});
})

router.get("/cart", authTokenMiddleware, async (req,res)=>{
    const error = req.flash('error') || [];  
    const success = req.flash('success') || [];
    try{
        const id = req.userId;
        const user = await User.findOne({_id: id })
        .populate("cart");        
        res.render("cart", {user: user || "", error, success} );
    }
    catch(e){
        res.send("Cart Error")
    }
})

router.get("/addtocart/:productid", authTokenMiddleware, async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const user = await User.findOne({ _id: req.userId });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.cart.push(req.params.productid); 
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


router.post('/create', async (req, res) => {
    try {
      // Expecting the product data in the body
      const productData = req.body;
  
      // Create a new product instance
      const product = await Product.create(productData);
  
      // Save the product to the database
      await product.save();
      res.status(201).json({
        message: 'Product added successfully!',
        product,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});


router.post("/products!!", async (req,res)=>{
    const product =  req.body;

    const products = [
        {
          title: 'Red Saree',
          rating: 4.5,
          categories: ['clothing', 'saree', 'lehanga'],
          brand: 'FabIndia',
          images: ['image1.jpg'],
          availability: true,
          price: 2000,
          size: ['M', 'L'],
          quantity: 100,
          description: 'A beautiful red saree for all occasions.',
          weight: '500g',
        },
        {
          title: 'Diamond Necklace',
          rating: 5,
          categories: ['jewellery', 'diamond', 'necklace'],
          brand: 'Tanishq',
          images: ['image2.jpg'],
          availability: true,
          price: 10000,
          size: [],
          quantity: 50,
          description: 'A classic diamond necklace for weddings.',
          weight: '200g',
        },
        {
          title: 'Pink Saree',
          rating: 4.2,
          categories: ['clothing', 'saree', 'lehanga'],
          brand: 'SareeWorld',
          images: ['image3.jpg'],
          availability: true,
          price: 2500,
          size: ['M', 'L'],
          quantity: 80,
          description: 'Elegant pink saree for special occasions.',
          weight: '600g',
        },
        {
          title: 'Gold Chain',
          rating: 4.8,
          categories: ['jewellery', 'gold', 'necklace'],
          brand: 'Kalyan',
          images: ['image4.jpg'],
          availability: true,
          price: 8000,
          size: [],
          quantity: 40,
          description: 'A delicate gold chain for everyday wear.',
          weight: '150g',
        },
        {
          title: 'Yellow Saree',
          rating: 4.3,
          categories: ['clothing', 'saree', 'lehanga'],
          brand: 'Kanchipuram',
          images: ['image5.jpg'],
          availability: true,
          price: 3000,
          size: ['M', 'L'],
          quantity: 90,
          description: 'Traditional yellow saree with intricate design.',
          weight: '550g',
        },
        {
          title: 'Diamond Necklace',
          rating: 5,
          categories: ['jewellery', 'gold', 'necklace'],
          brand: 'Malabar Gold',
          images: ['image6.jpg'],
          availability: true,
          price: 20000,
          size: [],
          quantity: 20,
          description: 'A sparkling diamond necklace for special events.',
          weight: '300g',
        },
        {
          title: 'Green Saree',
          rating: 4.7,
          categories: ['clothing', 'saree', 'lehanga'],
          brand: 'FabIndia',
          images: ['image7.jpg'],
          availability: true,
          price: 2200,
          size: ['M', 'L'],
          quantity: 120,
          description: 'A green saree with intricate embroidery.',
          weight: '650g',
        },
        {
          title: 'Gold Pendant',
          rating: 4.6,
          categories: ['jewellery', 'gold', 'necklace'],
          brand: 'Tanishq',
          images: ['image8.jpg'],
          availability: true,
          price: 12000,
          size: [],
          quantity: 60,
          description: 'A stunning gold pendant to complement your look.',
          weight: '100g',
        },
        {
          title: 'Blue Saree',
          rating: 4.4,
          categories: ['clothing', 'saree', 'lehanga'],
          brand: 'SareeCraft',
          images: ['image9.jpg'],
          availability: true,
          price: 1800,
          size: ['M', 'L'],
          quantity: 70,
          description: 'A beautiful blue saree for festive occasions.',
          weight: '600g',
        },
        {
          title: 'Gold Bracelet',
          rating: 4.9,
          categories: ['jewellery', 'gold', 'necklace'],
          brand: 'Kalyan',
          images: ['image10.jpg'],
          availability: true,
          price: 7000,
          size: [],
          quantity: 30,
          description: 'A gold bracelet to add elegance to your wrist.',
          weight: '180g',
        },
    ];

      try {
        const createdProducts = await Product.insertMany(product);
        res.status(200).json({
          message: 'Products added successfully!',
          products: createdProducts,
        });
      } catch (error) {
        res.status(500).json({
          message: 'Error adding products',
          error: error.message,
        });
      }
})


//global catch
router.use((error, req, res, next) => {
    console.error(error);
    res.status(500).send("Internal Server Error");
});

module.exports = router;