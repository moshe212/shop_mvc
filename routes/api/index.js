const router = require("express").Router();

router.use("/", require("./products"));
router.use("/orders", require("./orders"));
router.use("/products", require("./products"));
router.use("/login", require("./login"));

module.exports = router;
