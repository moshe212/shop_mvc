const router = require("express").Router();

const Product = require("../../models/Product");
const Order = require("../../models/Order");
const Category = require("../../models/Category");
const SubCategory = require("../../models/SubCategory");
const Customer = require("../../models/Customer");
const User = require("../../models/User");

// const mongoose = require("mongoose");

// const Product = mongoose.model("Product");
// const Order = mongoose.model("Order");
// const Category = mongoose.model("categorys");
// const SubCategory = mongoose.model("subCategorys");
// const Customer = mongoose.model("Customer");
// const User = mongoose.model("User");

//החזרת כל המוצרים או לפי חיפוש אם יש חיפוש == Mongo
router.get("/products", async (req, res) => {
  console.log("QUERY:", req.query);
  const search = req.query.search;
  const categoryName = req.query.category;
  console.log(categoryName);

  if (search) {
    const filteredProducts = await Product.find(
      { title: { $regex: search, $options: "i" } },
      (err, filteredProducts) => {
        if (err) return console.error(err);
        res.send(filteredProducts);
      }
    );
  } else if (categoryName) {
    const filteredCategory = await Category.findOne(
      { name: categoryName },
      async (err, category) => {
        if (err) return console.error(err);
        console.log(category);
        if (!category) {
          await SubCategory.findOne(
            { name: categoryName },
            async (err, subcategory) => {
              if (err) return console.error(err);
              console.log("sub", subcategory);
              const filteredProducts = await Product.find(
                { subCategoryID: subcategory._id },
                (err, filteredProductsList) => {
                  if (err) return console.error(err);
                }
              )
                .populate("subCategoryID")
                .populate("mainCategoryID")
                .exec();

              res.send(filteredProducts);
            }
          );
        } else {
          const filteredProducts = await Product.find(
            { mainCategoryID: category._id },
            (err, filteredProducts) => {
              if (err) return console.error(err);
            }
          )
            .populate("subCategoryID")
            .populate("mainCategoryID")
            .exec();

          res.send(filteredProducts);
        }
      }
    );
  } else {
    const ProductList = await Product.find((err, productItems) => {
      if (err) return console.error(err);
      // console.log(productItems);
      // res.send(productItems);
    })
      .populate("subCategoryID")
      .populate("mainCategoryID")
      .exec();

    // const x = await SubCategory.find({}).populate("categoryID");

    console.log(ProductList);
    // console.log(x);
    res.send(ProductList);
  }
});

//----------------------ניהול--------------------------------------------------------

router.get("/products/Admin/ManageProducts", (req, res) => {
  console.log("QUERY:", req.query);

  fs.readFile("product.json", (err, data) => {
    const products = JSON.parse(data);
    const Total = products.length;
    const size = req.query.per_page;
    const items = products.slice(0, size);

    const resp = {
      page: req.query.page,
      per_page: req.query.per_page,
      total: Total,
      total_pages: Math.ceil(req.query.page / req.query.per_page),
      data: items,
    };
    console.log(resp);

    res.send(resp);
  });
});

// הוספת מוצר == Mongo
router.post("/products", async (req, res) => {
  console.log(req.body);
  const title = req.body.title;
  const image = req.body.image;
  const quantity = req.body.quantity;
  const price = req.body.price;

  const newProduct = new Product({
    title: title,
    image: image,
    quantity: +quantity,
    price: +price,
  });
  await newProduct.save();
  Product.find((err, productItems) => {
    if (err) return console.error(err);
    res.send(productItems);
  });
});

//מחיקת מוצר == Mongo
router.delete("/products/:id", async (req, res) => {
  const productId = req.params.id;
  console.log(productId);
  Product.findByIdAndDelete(productId, (err, prod) => {
    if (err) {
      console.log(err);
    } else {
      console.log("delete", prod);
    }
  });

  productItems = await Product.find().exec();

  res.send(productItems);
});

// עדכון מוצר == Mongo
router.put("/products/:id", async (req, res) => {
  const productId = req.params.id;
  console.log(productId);

  Product.findByIdAndUpdate(
    productId,
    { $set: { ...req.body } },
    // (options.new = true),
    (err, prod) => {
      if (err) {
        console.log(err);
      } else {
        console.log("update", prod);
      }
    }
  );

  productItems = await Product.find().exec();

  res.send(productItems);
});

// הורדת קובץ מבנה לקבלת קובץ רשימת מוצרים להעלאה
router.get("/products/download/:file(*)", function (req, res) {
  // const file = "Test.txt";
  const file = req.params.file;
  const fileLocation = path.join("./", file);
  console.log(fileLocation);
  res.download(fileLocation, file); // Set disposition and send it.
});

// הוספת מוצרים מקובץ Csv == Mongo
router.post("/products/upload", async (req, res) => {
  console.log("upload", req.query.filename);
  let dir = "productList/";

  //checking if the upload dir exists on server, create it if not
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  let csvFile = `${dir}${Date.now()}.csv`;

  req.pipe(fs.createWriteStream(csvFile));

  setTimeout(async () => {
    if (fs.existsSync(csvFile)) console.log(`${csvFile} exists`);
    else console.log(`${csvFile} NOT exists`);

    if (req.query.filename.includes("csv")) {
      console.log("csv", csvFile);
      await csv()
        .fromFile(csvFile)
        .then((jsonObj) => {
          for (i = 0; i < jsonObj.length; i++) {
            const title = jsonObj[i].title;
            const image = jsonObj[i].image;
            const quantity = jsonObj[i].quantity;
            const price = jsonObj[i].price;

            const newProduct = new Product({
              title: title,
              image: image,
              quantity: +quantity,
              price: +price,
            });
            // console.log("newProduct", newProduct);
            newProduct.save();
          }
          Product.find((err, productItems) => {
            if (err) return console.error(err);

            res.status(200).send("OK");
          });
        });
    }
  }, 2000);
});

// הוספת מוצר עם קובץ להעלאה עבור תמונה == Mongo
router.post("/products/AddProductWithImgFile", (req, res) => {
  console.log(req.query);
  console.log(req.body);
  req.pipe(
    fs.createWriteStream(`../ShopDesign/public/Images/${req.query.filename}`)
  );
  const title = req.query.title;
  const image = `/Images/${req.query.filename}`;
  const quantity = req.query.quantity;
  const price = req.query.price;

  const newProduct = new Product({
    title: title,
    image: image,
    quantity: +quantity,
    price: +price,
  });
  newProduct.save();

  Product.find((err, productItems) => {
    if (err) return console.error(err);

    res.send(productItems);
  });
});

// עדכון מוצר עם אפשרות להעלאת תמונה כקובץ == Mongo
router.put("/products/UpdateProduct", async (req, res) => {
  console.log(req.query);
  console.log(req.body);
  if (req.query.filename.length > 0) {
    req.pipe(
      fs.createWriteStream(`../ShopDesign/public/Images/${req.query.filename}`)
    );
  }

  const Propertys = {};
  for (property in req.query) {
    if (property != "filename" && req.query[property].length > 0) {
      Propertys[property] = req.query[property];
    } else if (property === "filename" && req.query[property].length > 0) {
      Propertys["image"] = `/Images/${req.query.filename}`;
    }
  }

  console.log(Propertys);
  const productId = req.query.id;
  Product.findByIdAndUpdate(
    productId,
    { $set: { ...Propertys } },
    (err, prod) => {
      if (err) {
        console.log(err);
      } else {
        console.log("update", prod);
      }
    }
  );

  productItems = await Product.find().exec();

  res.send(productItems);
});

module.exports = router;
