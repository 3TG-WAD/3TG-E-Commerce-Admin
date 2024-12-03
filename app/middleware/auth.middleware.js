const jwt = require("jsonwebtoken");
const AdminModel = require("../models/adminModel");

const authMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).send("Access denied.");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await AdminModel.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).send("Invalid token.");
  }
};

module.exports = authMiddleware;
