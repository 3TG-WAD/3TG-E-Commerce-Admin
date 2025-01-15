const authMiddleware = async (req, res, next) => {
  if (req.session && req.session.loggedin) {
    return next();
  }

  if (req.xhr || req.headers.accept.indexOf("json") > -1) {
    return res.status(401).json({
      message: "Unauthorized. Please login first.",
      redirectTo: "/login",
    });
  }

  return res.redirect("/login");
};

module.exports = authMiddleware;
