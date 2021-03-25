const router = require("express").Router();

router.use("/", require("./products"));
router.use("/orders", require("./orders"));
router.use("/products", require("./products"));
router.use("/login", require("./login"));

router.use(function (err, req, res, next) {
  if (err.name === "ValidationError") {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function (errors, key) {
        errors[key] = err.errors[key].message;

        return errors;
      }, {}),
    });
  }

  return next(err);
});

module.exports = router;
