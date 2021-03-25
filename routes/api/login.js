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

// כניסת מנהל == Mongo
router.post("/api/login/LogInAdmin", (req, res) => {
  console.log(req.body);
  const { Email, Pass } = req.body;
  console.log(Email, Pass);

  const AdminItem = User.find({ Admin: true }, (err, Adminusers) => {
    if (err) return console.error(err);
    console.log(Adminusers);
    console.log(Adminusers.length);
    for (let i = 0; i < Adminusers.length; i++) {
      const { UserName, Password } = Adminusers[i];
      console.log(UserName, Password);
      if (UserName === Email && Password === parseInt(Pass)) {
        res.status(200).send("OK");
      } else {
        res.status(200).send("Not_allow");
      }
    }
  });
});

// כניסת לקוח == Mongo
router.post("/api/login/LogInCustomer", async (req, res) => {
  console.log(req.body);
  const { Email, Pass, TempCart } = req.body;
  console.log(Email, Pass);
  let Status = "";
  let CustomerID = "";
  let CustomerFullName = "";
  let UserHome = "";
  let UserStreet = "";
  let UserCity = "";
  let UserTelephone = "";
  let UserCellPhone = "";
  let UserMail = "";
  let OrderList = "";
  let SaveTempCart = "";

  const GetOrder = (ID) => {
    console.log(ID);
    let myPromise = new Promise((resolve, reject) => {
      const Orderitem = Order.findOne(
        { CustomerID: CustomerID, Status: false },
        (err, order) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            console.log("OrderList0_LogIn", order);
            if (order != null) {
              IsOrder = true;
            } else {
              IsOrder = false;
            }
            resolve(order);
          }
        }
      );
    });
    return myPromise;
  };

  const GetCustomer = (List) => {
    console.log(List);
    let myPromise2 = new Promise((resolve, reject) => {
      for (let i = 0; i < List.length; i++) {
        const {
          UserName,
          Password,
          FullName,
          Home,
          Street,
          City,
          Telephone,
          CellPhone,
        } = List[i];

        if (UserName === Email && Password === Pass) {
          CustomerID = List[i]._id;
          CustomerFullName = FullName;
          UserHome = Home;
          UserStreet = Street;
          UserCity = City;
          UserTelephone = Telephone;
          UserCellPhone = CellPhone;
          UserMail = UserName;

          resolve(CustomerID);
          break;
        } else {
          console.log("Status", Status);
        }
      }
      resolve("Not_Found_User");
    });
    return myPromise2;
  };

  const AddProductsFromTempCart = (ID, TempCart) => {
    let myPromise = new Promise((resolve, reject) => {
      Order.findById(ID, async (err, order) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          const ThisOrder = order;
          for (let p = 0; p < JSON.parse(TempCart).length; p++) {
            await ThisOrder.Products.push({
              productid: JSON.parse(TempCart)[p]._id,
              quantity: JSON.parse(TempCart)[p].quantity,
            });
            await ThisOrder.save();
          }

          const Thisorder_ToClient = ThisOrder;

          resolve(Thisorder_ToClient);
        }
      });
    });
    return myPromise;
  };

  const CustomerItem = Customer.find(async (err, Customers) => {
    if (err) {
      console.error(err);
    } else {
      await GetCustomer(Customers).then(
        (result) => {
          if (result === "Not_Found_User") {
            Status = "Not_Allow";
            res.status(200).send(Status);
          } else {
            GetOrder(CustomerID).then(
              (result) => {
                if (result != null) {
                  IsOrder = true;
                  if (TempCart) {
                    SaveTempCart = TempCart;
                  }
                  Status = [
                    "OK",
                    CustomerID,
                    CustomerFullName,
                    IsOrder,
                    UserHome,
                    UserStreet,
                    UserCity,
                    UserTelephone,
                    UserCellPhone,
                    UserMail,
                    SaveTempCart,
                  ];

                  res.status(200).send(Status);
                } else if (TempCart) {
                  let ProductsArrayForOrder;
                  let Totals;
                  let TotalAmount = 0;

                  ProductsArrayForOrder = JSON.parse(TempCart).map(
                    (prodObj) => ({
                      productid: prodObj._id,
                      quantity: prodObj.quantity,
                    })
                  );

                  Totals = JSON.parse(TempCart).map(
                    (prodObj) => prodObj.quantity * prodObj.price
                  );

                  TotalAmount = Totals.reduce((a, b) => a + b, 0);

                  const newOrder = new Order({
                    CustomerID: CustomerID,
                    Products: [],
                    OrderDate: Date.now(),
                    RequiredDate: Date.now(),
                    ShippedDate: Date.now(),
                    ShipStreet: "",
                    ShipHome: "",
                    ShipCity: "",
                    Status: false,
                    TotalAmount: TotalAmount,
                  });
                  newOrder.save(function async(err, order) {
                    if (err) {
                      console.log(err);
                    } else {
                      AddProductsFromTempCart(order._id, TempCart).then(
                        (result) => {
                          console.log("AddProductsFromTempCartresulte", result);
                          IsOrder = true;

                          Status = [
                            "OK",
                            CustomerID,
                            CustomerFullName,
                            IsOrder,
                            UserHome,
                            UserStreet,
                            UserCity,
                            UserTelephone,
                            UserCellPhone,
                            UserMail,
                            SaveTempCart,
                          ];
                          console.log("Status", Status);
                          res.status(200).send(Status);
                        }
                      );
                    }
                  });
                } else {
                  IsOrder = false;

                  Status = [
                    "OK",
                    CustomerID,
                    CustomerFullName,
                    IsOrder,
                    UserHome,
                    UserStreet,
                    UserCity,
                    UserTelephone,
                    UserCellPhone,
                    UserMail,
                    SaveTempCart,
                  ];

                  res.status(200).send(Status);
                }
              },
              (error) => {
                console.log("error", error);
              }
            );
          }
        },
        (error) => {
          console.log("error", error);
        }
      );
    }
  });
});

//רישום לקוח
router.post("/api/login/RegisterCustomer", async (req, res) => {
  console.log(req.body);
  const {
    Email,
    Pass,
    FullName,
    House,
    Street,
    City,
    Phone,
    CellPhone,
    TempCart,
  } = req.body;

  let CustomerID;

  const AddProductsFromTempCart = (ID, TempCart) => {
    let myPromise = new Promise((resolve, reject) => {
      Order.findById(ID, async (err, order) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          const ThisOrder = order;
          for (let p = 0; p < JSON.parse(TempCart).length; p++) {
            await ThisOrder.Products.push({
              productid: JSON.parse(TempCart)[p]._id,
              quantity: JSON.parse(TempCart)[p].quantity,
            });
            await ThisOrder.save();
          }

          const Thisorder_ToClient = ThisOrder;

          resolve(Thisorder_ToClient);
        }
      });
    });
    return myPromise;
  };

  let ProductsArrayForOrder;
  let Totals;
  let TotalAmount = 0;

  if (TempCart) {
    ProductsArrayForOrder = JSON.parse(TempCart).map((prodObj) => ({
      productid: prodObj._id,
      quantity: prodObj.quantity,
    }));

    Totals = JSON.parse(TempCart).map(
      (prodObj) => prodObj.quantity * prodObj.price
    );

    TotalAmount = Totals.reduce((a, b) => a + b, 0);
  }

  const newCustomer = new Customer({
    UserName: Email,
    Password: Pass,
    FullName: FullName,
    Home: House,
    Street: Street,
    City: City,
    Telephone: Phone,
    CellPhone: CellPhone,
  });
  newCustomer.save(function async(err, cust) {
    if (err) {
      console.log(err);
    } else {
      CustomerID = cust._id;

      if (TempCart) {
        const newOrder = new Order({
          CustomerID: CustomerID,
          Products: [],
          OrderDate: Date.now(),
          RequiredDate: Date.now(),
          ShippedDate: Date.now(),
          ShipStreet: "",
          ShipHome: "",
          ShipCity: "",
          Status: false,
          TotalAmount: TotalAmount,
        });
        newOrder.save(function async(err, order) {
          if (err) {
            console.log(err);
          } else {
            AddProductsFromTempCart(order._id, TempCart).then((result) => {
              console.log("resulte", result);

              res.status(200).send("RegOK");
            });
          }
        });
      } else {
        res.status(200).send("RegOK");
      }
    }
  });
});

module.exports = router;
