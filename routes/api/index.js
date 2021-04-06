// const router = require("express").Router();

// router.use("/", require("./products"));
// router.use("/orders", require("./orders"));
// router.use("/products", require("./products"));
// router.use("/login", require("./login"));

// module.exports = router;

const router = require("express").Router();

router
  .get("/", function (req, res) {
    res.json({
      status: "API Its Working",
      message: "Welcome to shop!",
    });
  })
  .use("/", require("./products"))
  .use("/orders", require("./orders"))
  .use("/products", require("./products"))
  .use("/login", require("./login"));

module.exports = router;
