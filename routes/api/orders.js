const router = require("express").Router(); // const Product = require("../models/product");

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

//הוספת הזמנה-- Mongo
router.post("/api/orders/AddOrder", async (req, res) => {
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

router.post("/api/orders/GetOpenOrderForCustomer", async (req, res) => {
  const { CustomerID } = req.body;

  const Orderitem = await Order.findOne({
    CustomerID: CustomerID,
    Status: false,
  })
    .populate("Products.productid")
    .exec();

  const getArray = async () => {
    let ProductListCartInServer = [];
    for (let i = 0; i < Orderitem.Products.length; i++) {
      const Prod = {
        id: Orderitem.Products[i].productid._id,
        title: Orderitem.Products[i].productid.title,
        image: Orderitem.Products[i].productid.image,
        quantity: Orderitem.Products[i].quantity,
        price: Orderitem.Products[i].productid.price,
      };
      ProductListCartInServer.push(Prod);
    }
    return ProductListCartInServer;
  };
  const ArrayForClient = await getArray();
  res.status(200).send(ArrayForClient);
});

//הוספת מוצר לעגלה
router.post("/api/orders/AddToCart", async (req, res) => {
  // console.log(req.query);
  console.log(req.body);
  const ProductId = req.body.ProductID;
  const Quantity = +req.body.Quantity;
  const CustomerID = req.body.CustomerID;
  const UnitPrice = req.body.UnitPrice;
  const Total = UnitPrice * Quantity;
  let Thisorder_ToClient;

  let ShipStreet;
  let ShipHome;
  let ShipCity;

  const AddToExistOrder = (ID) => {
    let myPromise = new Promise((resolve, reject) => {
      Order.find({ CustomerID: ID, Status: false }, async (err, order) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          const OrderID = order[0]._id;
          const OrderTotal = order[0].TotalAmount;
          const OrderTotalEnd = OrderTotal + Total;

          const ThisOrder = await Order.findOne({
            _id: OrderID,
          });
          let IsNewProd;
          for (i = 0; i < ThisOrder.Products.length; i++) {
            const Pid = ThisOrder.Products[i].productid;
            if (String(Pid).trim() === String(ProductId).trim()) {
              ThisOrder.Products[i].quantity =
                ThisOrder.Products[i].quantity + Quantity;
              ThisOrder.TotalAmount = OrderTotalEnd;

              IsNewProd = false;

              await ThisOrder.save();
              break;
            } else {
              IsNewProd = true;
            }
          }
          if (IsNewProd) {
            await ThisOrder.Products.push({
              productid: ProductId,
              quantity: Quantity,
            });
            ThisOrder.TotalAmount = OrderTotalEnd;
            await ThisOrder.save();
          }

          Thisorder_ToClient = ThisOrder;

          resolve(Thisorder_ToClient);
        }
      });
    });
    return myPromise;
  };

  const CreateOrderAndAddProd = () => {
    let myPromise = new Promise((resolve, reject) => {
      const newOrder = new Order({
        CustomerID: CustomerID,
        Products: { productid: ProductId, quantity: Quantity },
        OrderDate: Date.now(),
        RequiredDate: Date.now(),
        ShippedDate: Date.now(),
        ShipStreet: ShipStreet,
        ShipHome: ShipHome,
        ShipCity: ShipCity,
        Status: false,
        TotalAmount: Total,
      });
      newOrder.save();
      Thisorder_ToClient = newOrder;
      resolve(Thisorder_ToClient);
    });
    return myPromise;
  };

  const FindProductsFromOrder = (ID, quantity) => {
    let myPromise = new Promise((resolve, reject) => {
      Product.findById(ID, async (err, prod) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          const Prod = {
            id: prod._id,
            title: prod.title,
            image: prod.image,
            quantity: quantity,
            price: prod.price,
          };
          resolve(Prod);
        }
      });
    });
    return myPromise;
  };

  const UpdateQuantity = (ProductId) => {
    let myPromise = new Promise((resolve, reject) => {
      const ThisProduct = Product.findById(ProductId, async (err, prod) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          prod.quantity = prod.quantity - 1;
          await prod.save();
          resolve(prod);
        }
      });
    });
    return myPromise;
  };

  if (CustomerID) {
    await Order.find(
      { CustomerID: CustomerID, Status: false },
      (err, order) => {
        if (err) {
          console.log(err);
        } else {
          if (order.length > 0) {
            IsNewOrder = false;
          } else {
            IsNewOrder = true;
          }
        }
      }
    );
    await Customer.findById(CustomerID, async (err, customer) => {
      if (err) {
        console.log(err);
      } else {
        ShipStreet = customer.Street;
        ShipHome = customer.Home;
        ShipCity = customer.City;

        if (IsNewOrder) {
          await CreateOrderAndAddProd().then((result) => {
            console.log("result", result);
            if (result != null) {
              const promises = [];
              for (i = 0; i < result.Products.length; i++) {
                const productId = result.Products[i].productid;
                const quantity = result.Products[i].quantity;
                promises.push(FindProductsFromOrder(productId, quantity));
              }
              Promise.all(promises).then((result) => {
                if (result != null) {
                  Status = ["OK", CustomerID, result];
                  res.status(200).send(Status);
                } else {
                  console.log("Can not CreateProductListToClient");
                }
              });
            }
          });
        } else {
          console.log("not new");

          await AddToExistOrder(CustomerID).then((result) => {
            if (result != null) {
              const promises = [];
              for (i = 0; i < result.Products.length; i++) {
                const productId = result.Products[i].productid;
                const quantity = result.Products[i].quantity;
                promises.push(FindProductsFromOrder(productId, quantity));
              }
              Promise.all(promises).then((result) => {
                console.log("result_FindProductsFromOrder", result);
                if (result != null) {
                  Status = ["OK", CustomerID, result];
                  res.status(200).send(Status);
                } else {
                  console.log("Can not CreateProductListToClient");
                }
              });
            }
          });
        }
        await UpdateQuantity(ProductId);
      }
    });
  }

  // io.emit("UpdateQuantity", { id: productId, quantity: Quantity });
});

router.post("/api/orders/OrderPay", async (req, res) => {
  console.log(req.body);
  const CustomerID = req.body.CustomerID;
  const Orderitem = Order.findOne(
    { CustomerID: CustomerID, Status: false },
    async (err, order) => {
      if (err) {
        console.log(err);
      } else {
        order.Status = true;
        await order.save();
        res.status(200).send("OK");
      }
    }
  );
});

// -----------------------ניהול------------------------------

//החזרת כל ההזמנות או לפי חיפוש אם יש חיפוש == Mongo
router.get("/api/orders", async (req, res) => {
  console.log("QUERY:", req.query);
  const search = req.query.search;
  console.log(search);

  if (search) {
    const StartDate = new Date(search);
    const NextDay = new Date(+StartDate);
    const DayValue = NextDay.getDate() + 1;
    const NextDayDate = NextDay.setDate(DayValue);
    console.log("NextDayDate", NextDayDate, new Date(NextDayDate));
    const filteredOrders = await Order.find(
      {
        OrderDate: { $gte: new Date(StartDate), $lt: new Date(NextDayDate) },
      },
      (err, filtered) => {
        if (err) return console.error(err);
        // console.log(filteredOrders);
      }
    )
      .populate("Products.productid")
      .populate("CustomerID")
      .exec();

    // console.log(filtered);
    res.send(filteredOrders);
  } else {
    const OrdersList = await Order.find((err, orderItems) => {
      if (err) return console.error(err);
      // console.log(orderItems);
      // res.send(orderItems);
    })
      .populate("CustomerID")
      .exec();

    // const getArray = async () => {
    //   let ProductListCartInServer = [];
    //   for (let i = 0; i < Orderitem.Products.length; i++) {
    //     const Prod = {
    //       id: Orderitem.Products[i].productid._id,
    //       title: Orderitem.Products[i].productid.title,
    //       image: Orderitem.Products[i].productid.image,
    //       quantity: Orderitem.Products[i].quantity,
    //       price: Orderitem.Products[i].productid.price,
    //     };
    //     ProductListCartInServer.push(Prod);
    //   }
    //   return ProductListCartInServer;
    // };
    // const ArrayForClient = await getArray();
    // res.status(200).send(ArrayForClient);
    console.log("OrdersList", OrdersList);
    res.send(OrdersList);
  }
});

//החזרת לקוחות לפי ביצוע הזמנות לפי תאריך
router.get("/api/orders/orders_customers", async (req, res) => {
  const search = req.query.search.replace("'", "");
  const month = search.split("-")[1].replace("'", "");
  const year = search.split("-")[0];
  console.log("search", search);
  console.log(month, year);

  const filteredOrders = await Order.aggregate([
    {
      $addFields: {
        month: { $month: "$OrderDate" },
        year: { $year: "$OrderDate" },
        count: 1,
      },
    },
    { $match: { month: +month } },
    { $match: { year: +year } },
    // {
    //   $group: {
    //     _id: { CustomerID: "$CustomerID" },
    //     'סה"כ הזמנות': { $sum: 1 },
    //   },
    // },
    {
      $lookup: {
        from: "customers",
        localField: "CustomerID",
        foreignField: "_id",
        as: "CustomerDetails",
      },
    },
    {
      $lookup: {
        from: "products",
        localField: "Products.productid",
        foreignField: "_id",
        as: "ProductsDetails",
      },
    },
  ]);

  res.send(filteredOrders);
});

//החזרת כמות הזמנות לפי תאריך
router.get("/api/orders/dates", async (req, res) => {
  console.log("here");
  const search = req.query.search;
  const OrdersCount = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$OrderDate" } },
        // _id: { $dayOfYear: "$OrderDate" },
        'סה"כ הזמנות': { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  console.log(OrdersCount);

  res.send(OrdersCount);
});

//החזרת סהכ הכנסות לחודש
router.get("/api/orders/total_income", async (req, res) => {
  const search = req.query.search;
  const OrdersTotalIncome = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$OrderDate" } },
        // _id: "ProductID",
        'סה"כ הכנסות': { $sum: "$TotalAmount" },
      },
    },

    { $sort: { _id: 1 } },
  ]);
  // const day = await Order.aggregate([
  //   { $project: { day: OrdersCount[0]._id } },
  // ]);
  // console.log(day);

  console.log(OrdersTotalIncome);

  res.send(OrdersTotalIncome);
});

//פרטי עגלה ללקוח - ניהול
router.post("/api/orders/GetOrderForCustomer_Admin", async (req, res) => {
  const { OrderID } = req.body;

  const Orderitem = await Order.findOne({
    _id: OrderID,
  })
    .populate("Products.productid")
    .exec();

  const getArray = async () => {
    let ProductListCartInServer = [];
    for (let i = 0; i < Orderitem.Products.length; i++) {
      const Prod = {
        id: Orderitem.Products[i].productid._id,
        title: Orderitem.Products[i].productid.title,
        image: Orderitem.Products[i].productid.image,
        quantity: Orderitem.Products[i].quantity,
        price: Orderitem.Products[i].productid.price,
      };
      ProductListCartInServer.push(Prod);
    }
    return ProductListCartInServer;
  };
  const ArrayForClient = await getArray();
  res.status(200).send(ArrayForClient);
});

//מחיקת הזמנה - ניהול == Mongo
router.delete("/api/orders/:id", async (req, res) => {
  const orderId = req.params.id;
  console.log(req.params.id);
  Order.findByIdAndDelete(orderId, (err, order) => {
    if (err) {
      console.log(err);
    } else {
      console.log("delete", order);
    }
  });

  orderItems = await Order.find().exec();

  res.send(orderItems);
});

// עדכון הזמנה - ניהול == Mongo
router.put("/api/orders/:id", async (req, res) => {
  const orderId = req.params.id;
  console.log(req.body);

  Order.findByIdAndUpdate(
    orderId,
    { $set: { ...req.body } },
    // (options.new = true),
    (err, order) => {
      if (err) {
        console.log(err);
      } else {
        console.log("update", order);
      }
    }
  );

  orderItems = await Order.find().exec();

  res.send(orderItems);
});

//טבלת ניהול לקוחות
router.post("/api/orders/GetClients_Admin", async (req, res) => {
  console.log("req.body", req.body);
  // const limitRows = req.body.limit;
  const Clients = await Customer.find((err, customerItems) => {
    if (err) return console.error(err);
  });

  const getArrayOfClientOrders = async (CustID) => {
    const OrderList = await Order.find(
      { CustomerID: CustID },
      (err, orders) => {
        if (err) {
          console.log(err);
        } else {
          console.log("orders", orders);
        }
      }
    );

    return OrderList;
  };

  const getArrayOfClients = async () => {
    let ClientWithOrdersBelong = [];
    for (let i = 0; i < Clients.length; i++) {
      const Clientorders = await getArrayOfClientOrders(Clients[i]._id);

      const Client = {
        id: Clients[i]._id,
        UserName: Clients[i].UserName,
        FullName: Clients[i].FullName,
        Home: Clients[i].Home,
        Street: Clients[i].Street,
        City: Clients[i].City,
        Telephone: Clients[i].Telephone,
        CellPhone: Clients[i].CellPhone,
        Orders: Clientorders,
      };
      ClientWithOrdersBelong.push(Client);
    }
    return ClientWithOrdersBelong;
  };

  const ArrayOfClient = await getArrayOfClients();
  res.status(200).send(ArrayOfClient);
});

module.exports = router;
