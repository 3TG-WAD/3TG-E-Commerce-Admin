const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "password") {
    req.session.loggedin = true;
    req.session.username = username;
    return res.status(200).json({
      message: "Login successful",
      redirectTo: "/api/orders/dashboard",
    });
  } else {
    return res.status(401).json({
      message: "Invalid credentials",
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Could not log out" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

module.exports = router;
