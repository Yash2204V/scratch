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
    // console.log(req.body);
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
        res.redirect("/login");
      } else {
        res.status(201).json({ message: "Signup successful! Verify your email." });
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
    res.send("Email verified successfully!");
  } catch (error) {
    res.status(400).send("Invalid or expired token");
  }
});

// 3. Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });
    if (!user.isVerified) return res.status(400).json({ error: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = createToken({ id: user._id, email: user.email });
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000, // 1 hour
      })
      .redirect("/account");
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
      return res.redirect("/account");
    }
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
      .redirect("/account");
  }
);

// 6. Logout
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

router.get("/signup-page", (req, res)=>{
  if(req.cookies.token){
    res.render("account");
  }
  res.render("signup");
})

router.get("/login-page", (req, res) => {
  if (req.cookies.token) {
    return res.render("account"); 
  }
  res.render("login");
});
module.exports = router;