import React from "react";
import "./OrderDetailsFromChart.css";

import dayjs from "dayjs";

const OrderDetailsFromChart = (props) => {
  const showChildDrawer = (ProductsCart, TotalPrice, id) => {
    props.showChildrenDrawer(ProductsCart, TotalPrice, id);
  };
  return (
    <div dir="rtl" className="orderDetails" id={props.id}>
      <div className="item">
        <div>שם לקוח: </div>
        <div>{props.ClientName} </div>
      </div>
      <div className="item">
        <div>תאריך הזמנה: </div>
        <div>{dayjs(props.Orderdate).format("DD/MM/YYYY")}</div>
      </div>
      <div className="item">
        <div>כמות מוצרים: </div>
        <div>{props.ProdCount}</div>
      </div>
      <div className="item">
        <div>סה"כ הזמנה: </div>
        <div>{props.TotalPrice}</div>
      </div>
      <div className="orderDetailsBtn">
        <button
          onClick={() => {
            showChildDrawer(props.ProductsList, props.TotalPrice, props.id);
          }}
        >
          פרטי הזמנה
        </button>
      </div>
    </div>
  );
};

export default OrderDetailsFromChart;
