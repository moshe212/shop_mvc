import React, { useState, useContext } from "react";
import { Form, Input, Button, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Axios from "axios";
import { Redirect } from "react-router";

import "./LoginForm.css";

import OrderContext from "./OrderContext";

const success = () => {
  message.success({
    content: "הינך מועבר לדף הניהול",
    className: "custom-class",
    style: {
      marginTop: "10vh",
    },
  });
};

const Customeruccess = (existOrder) => {
  !existOrder
    ? message.success({
        content:
          "הנתונים נכונים, אנו אוספים את הנתונים שלך ומיד תועבר להמשך קניה.",
        className: "custom-class",
        style: {
          marginTop: "10vh",
          margin: "0px auto",
          width: "500px",
          height: "400px",
        },
      })
    : message.success({
        content:
          "נמצאה הזמנה בסטטוס טרם שולם בשרת, ההזמנה שהתחלתה עכשיו תבוטל ובמקומה תופיע ההזמנה שהתקבלה מהשרת.",
        className: "custom-class",
        style: {
          marginTop: "10vh",
          margin: "0px auto",
          width: "500px",
          height: "400px",
        },
      });
};

const error = () => {
  message.error({
    content: "שם המשתמש או הססמה אינם נכונים.",
    className: "custom-class",
    style: {
      marginTop: "10vh",
    },
  });
};

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 16,
  },
};
const validateMessages = {
  required: "${label} is required!",
  types: {
    email: "${label} is not validate email!",
    number: "${label} is not a validate number!",
  },
  number: {
    range: "${label} must be between ${min} and ${max}",
  },
};

const LoginForm = (props) => {
  const [State, setState] = useState({
    Redirect_MangeProducts: false,
    Redirect_Home: false,
    UserId: "",
    Name: "",
    Order: "",
    District_IsNewOrder: "",
  });

  const [form] = Form.useForm();

  // const IsNewOrder = useContext(OrderContext).data;
  const changeIsNewOrder = useContext(OrderContext).changeIsNewOrder;
  let District_IsNewOrder_Var;

  // const Context = useContext(OrderContext);

  const {
    Redirect_MangeProducts,
    Redirect_Home,
    UserId,
    Name,
    District_IsNewOrder,
  } = State;
  if (Redirect_MangeProducts) {
    return <Redirect push to="/Admin/ManageProducts" />;
  } else if (Redirect_Home) {
    return (
      <Redirect
        to={{
          pathname: "/LoginCustomer/Customer/" + Name,
          state: {
            UserId: UserId,
            District_IsNewOrder_Var: District_IsNewOrder,
          },
        }}
      />
    );
  }

  let url = "";

  if (props.WhoLogIn === "User") {
    url = "/api/login/LogInCustomer";
  } else if (props.WhoLogIn === "Admin") {
    url = "/api/login/LogInAdmin";
  }

  const onFinish = (values) => {
    message.loading("..מבצע אימות נתונים מול השרת, מיד תועבר להמשך קניה", 0);
    props.onSubmit();
    form.resetFields();
    Axios.post(url, {
      Email: values.LogIn.Username,
      Pass: values.LogIn.Password,
      TempCart: localStorage.getItem("TempCart"),
    }).then(
      (response) => {
        message.destroy();

        if (response.data[0] === "OK" || response.data === "OK") {
          localStorage.removeItem("TempCart");
          if (url === "/api/login/LogInCustomer") {
            localStorage.removeItem("LocalCustomerID");

            localStorage.setItem("LocalCustomerID", [
              response.data[1],
              response.data[2],
              response.data[4],
              response.data[5],
              response.data[6],
              response.data[7],
              response.data[8],
              response.data[9],
            ]);

            if (changeIsNewOrder) {
              if (response.data[3]) {
                changeIsNewOrder(false);
              } else {
                changeIsNewOrder(true);
              }
            } else if (response.data[3]) {
              District_IsNewOrder_Var = false;
            } else {
              District_IsNewOrder_Var = true;
            }
            Customeruccess(response.data[10]);
          } else {
            success();
          }

          setTimeout(() => {
            if (url === "/api/login/LogInCustomer") {
              const id = response.data[1];
              const name = response.data[2];
              const order = response.data[3];

              setState({
                UserId: id,
                Redirect_Home: true,
                Name: name,
                Order: order,
                District_IsNewOrder: District_IsNewOrder_Var,
              });
            } else if (url === "/api/login/LogInAdmin") {
              setState({ Redirect_MangeProducts: true });
            }
          }, 1000);
        } else {
          error();
        }
      },
      (error) => {
        console.log(error);
      }
    );
  };

  return (
    <div dir="rtl">
      <Form
        {...layout}
        form={form}
        name="nest-messages"
        onFinish={onFinish}
        validateMessages={validateMessages}
      >
        <Form.Item
          name={["LogIn", "Username"]}
          label="אימייל"
          rules={[
            {
              type: "email",
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name={["LogIn", "Password"]}
          label="ססמה"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
          <Button type="primary" htmlType="submit">
            כניסה
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;
