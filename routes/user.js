require('dotenv').config();
const express = require("express");
const router = express.Router();
const { JWT_SECRET,GOOGLE_CLIENT_SECRET,GOOGLE_CLIENT_ID, EMAIL, APP_PASSWORD  } = require('../config');
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const { User } = require('../db');
const PORT = process.env.PORT;
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

router.use(cookieParser());
router.use(passport.initialize());

// Email Transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: APP_PASSWORD,
    },
});

// JWT Helper Functions
const createToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

// 1. Signup
router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    const user = await User.findOne({ email });
      if (user) {
        req.flash("error", "Email already exists");
        return res.status(400).redirect("/user/login-page");
      }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await User.create({ username, email, password: hashedPassword });
      // console.log(newUser);
      const verificationToken = createToken({ email });
      // console.log(verificationToken);
      const verificationLink = `http://localhost:${PORT}/user/verify?token=${verificationToken}`;
      await transporter.sendMail({
        from: EMAIL,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
      });
  
      if (newUser.isVerified) {
        req.flash("success", "Already verified. Please login.");
        res.redirect("/user/login-page");
      } else {
        req.flash("success", "Signup successful! Please check your email to verify your account.");
        res.status(201).redirect("/user/login-page");
      }
    } catch (error) {
      res.status(400).json({ error: error });
    }
  });

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);
// 2. Email Verification
router.get("/verify", async (req, res) => {
  const { token } = req.query;
  try {
    const { email } = verifyToken(token);
    await User.updateOne({ email }, { isVerified: true });
    res.render("verify");
  } catch (error) {
    res.status(400).send("Invalid or expired token");
  }
});

// 3. Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      req.flash("error", "Invalid credentials");
      return res.status(400).redirect("/user/login-page");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch){
      req.flash("error", "Invalid credentials");
      return res.status(400).redirect("/user/login-page");
    } 
    const token = createToken({ id: user._id, email: user.email });
    req.flash("success", "Logged in successfully");
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000, // 1 hour
      })
      .redirect("/");
  } catch (error) {
    res.status(400).json({ error: "Error logging in" });
  }
});

// 4. Google OAuth
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/user/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          username: profile.displayName,
          email: profile.emails[0].value,
          password: bcrypt.hashSync(profile.id, 10), // default password
          isVerified: true,
        });
      }
      done(null, user);
    }
  )
);

router.get(
  "/auth/google",
  async (req, res, next) => {
    if (req.cookies.token) {
      req.flash("success", "You are already logged in");
      return res.redirect("/");
    }
    req.flash("success", "Logged in successfully");
    next();
  },
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// 5. Auth Callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" , session: false }),
  (req, res) => {
    const token = createToken({ id: req.user._id, email: req.user.email });
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000,
      })
      .redirect("/");
  }
);

// 6. Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

router.get("/signup-page", (req, res)=>{
  const error = req.flash('error') || [];  
  const success = req.flash('success') || [];
  if (req.cookies.token) {
    return res.render("account"); 
  }
  res.render("signup", { error, success });
})

router.get("/login-page", (req, res) => {
  const error = req.flash('error') || [];  
  const success = req.flash('success') || [];
  if (req.cookies.token) {
    return res.render("account"); 
  }
  res.render("login", { error, success });
});

module.exports = router;