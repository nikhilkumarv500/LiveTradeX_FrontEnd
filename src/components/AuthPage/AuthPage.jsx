import React, { useEffect, useState } from "react";
import "./style.css";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import axios from "axios";
import useStore from "../SideComponents/ContextStore";
import notify from "../SideComponents/Toastify";
import WebSocketConfig from "../WebSocketConfig/WebSocketConfig.jsx";
import useWsStore from "../SideComponents/WebSocketStore.jsx";
import ProjectLogo from "../../assets/ProjectLogo.png";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
const MySwal = withReactContent(Swal);

const apiUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const LoginPage = ({ setSocketOpen }) => {
  useEffect(() => {
    MySwal.fire({
      icon: "info",
      title: "Welcome!",
      html: (
        <div style={{ fontSize: "15px" }}>
          <p>
            This website does not support phone (small screen view), please view
            only in desktop (big screens)
          </p>
          <br></br>
          <p>
            If you are using a small screen laptop, please reduce the size of
            the screen to 90% or below
          </p>
          <br></br>
          <p>
            Since I am using a free service login/Register (any first service)
            may take up to 2 mins to complete
          </p>
        </div>
      ),
      showConfirmButton: true,
    }).then((result) => {
      if (result.isConfirmed || result.dismiss) {
        // Trigger the second alert
        MySwal.fire({
          title: "About website",
          icon: "info",
          html: (
            <div style={{ fontSize: "15px" }}>
              <p>20-second refresh window</p>
              <br />
              <p>
                Every stock detail will update every 20 seconds, so be quick
                while trading on the website.
              </p>
              <br />
              <p>
                This project has live updates, meaning that if you purchase a
                stock here, every user who is logged in will get the updated
                status of that stock.
              </p>
              <br />
              <p>
                You can try this out by opening two instances of the same
                website, but logging in with different accounts. Then, try to
                buy/sell the same stock, and you will see the live updates in
                the preview panel.
              </p>
              <br />
              <p>
                If you see "live server disconnected" notification, just logout
                and login
              </p>
              <br />
              <p>Thank you :)</p>
            </div>
          ),

          showConfirmButton: true,
        });
      }
    });
  }, []);

  const { store, setStore } = useStore();
  const { wsStore, setWsStore } = useWsStore();

  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    registerMode: false,
  });

  const callAuthRegisterApi = async () => {
    setStore({ ...structuredClone(store), loadingSrc: true });

    const payload = {
      email: userData?.email == "" ? null : userData?.email,
      password: userData?.password == "" ? null : userData?.password,
      name: userData?.name == "" ? null : userData?.name,
    };

    var res = {};

    try {
      res = await axios.post(`${apiUrl}/auth/registerUser`, payload);

      if (res?.data?.success === false) {
        setStore({ loadingSrc: false });
        notify(res?.data?.message, true);

        return;
      }
    } catch (err) {
      console.log("in login Auth: " + err);

      setStore({ ...structuredClone(store), loadingSrc: false });
      notify("in login Auth: " + err, true);

      return;
    }

    setStore({ ...structuredClone(store), loadingSrc: false });
    notify("Registered Successfully");

    setUserData({
      name: "",
      email: "",
      password: "",
      registerMode: false,
    });
  };

  const callAuthLoginApi = async () => {
    setStore({ ...structuredClone(store), loadingSrc: true });

    const payload = {
      email: userData?.email == "" ? null : userData?.email,
      password: userData?.password == "" ? null : userData?.password,
    };

    let finalObj = {};
    let wsFinalObj = {};

    let res = {};
    try {
      res = await axios.post(`${apiUrl}/auth/userLogin`, payload);

      if (res?.data?.success === false) {
        setStore({ ...structuredClone(store), loadingSrc: false });
        notify(res?.data?.message, true);

        return;
      }

      res = res?.data;

      finalObj = {
        userDetailsItem: res?.userDetailsItem,
        userStocksHistoryList: res?.userStocksHistoryList,
        userStocksItemList: res?.userStocksItemList,
      };

      wsFinalObj = {
        userCount: res?.userCount,
      };

      finalObj.userDetailsItem.password = userData?.password;
    } catch (err) {
      console.log("in login Auth: " + err);

      setStore({ ...structuredClone(store), loadingSrc: false });
      notify("in login Auth: " + err, true);

      return;
    }

    try {
      res = await axios.get(`${apiUrl}/stocks/listAllStocks`);

      if (res?.data?.success === false) {
        setStore({ ...structuredClone(store), loadingSrc: false });
        notify(res?.data?.message, true);

        return;
      }

      res = res?.data;

      finalObj = {
        ...finalObj,
        loadingSrc: false,
      };

      wsFinalObj = {
        ...wsFinalObj,
        listAllStocks: res,
      };
    } catch (err) {
      console.log("in login listAllStocks: " + err);

      setStore({ ...structuredClone(store), loadingSrc: false });
      notify("in login Auth listAllStocks: " + err, true);

      return;
    }

    setSocketOpen("connect");
    setStore({ ...finalObj });
    setWsStore({ ...wsFinalObj });

    notify("Login Successfull");
    notify(
      "Welcome " +
        (finalObj.userDetailsItem?.name || "user") +
        " , have a nice day :)"
    );

    navigate("/dashboardPage");

    setUserData({
      name: "",
      email: "",
      password: "",
      registerMode: false,
    });
  };

  const formAction = () => {
    if (userData.registerMode) {
      callAuthRegisterApi();
    } else {
      callAuthLoginApi();
    }
  };

  return (
    <>
      <div className="LoginContainer">
        <div className="breakHorizontallyIntoTwoLogin">
          <div className="leftHorizontalContainerLogin">
            <div className="leftSideInnerContainerLogin">
              <div className="LoginFormHeaderProjectNameImageContainer">
                <div className="LoginFormHeaderProjectImageContainer">
                  <img width="30px" height="30px" src={ProjectLogo} />
                </div>
                <div className="LoginFormHeaderProjectTextContainer">
                  LiveTradeX
                </div>
              </div>
              <div className="AuthPageWhiteBorderLineCenterContainer">
                <div className="AuthPageWhiteBorderLine"></div>
              </div>
              <div className="LoginFormHeaderCenter">
                {userData.registerMode ? <h4>Register</h4> : <h4>Login</h4>}
              </div>

              <div className="LoginPageMiddleBodyToAddPaddingFromRight">
                {userData.registerMode && (
                  <div className="">
                    <Form.Label htmlFor="LoginInputName" className="small">
                      Name
                    </Form.Label>
                    <Form.Control
                      autoComplete="on"
                      size="sm"
                      type="text"
                      id="LoginInputName"
                      className="LoginInputName"
                      placeholder="Enter your name"
                      value={userData?.name}
                      onChange={(e) => {
                        setUserData({ ...userData, name: e.target.value });
                      }}
                    />
                  </div>
                )}

                <div className="">
                  <Form.Label htmlFor="LoginInputEmail" className="small">
                    Email
                  </Form.Label>
                  <Form.Control
                    autoComplete="on"
                    size="sm"
                    type="text"
                    id="LoginInputEmail"
                    className=""
                    placeholder="Enter your email"
                    value={userData?.email}
                    onChange={(e) => {
                      setUserData({ ...userData, email: e.target.value });
                    }}
                  />
                </div>

                <div className="">
                  <Form.Label htmlFor="LoginInputPassword" className="small">
                    Password
                  </Form.Label>
                  <Form.Control
                    autoComplete="on"
                    size="sm"
                    type="text"
                    className=""
                    id="LoginInputPassword"
                    placeholder="Enter your password"
                    value={userData?.password}
                    onChange={(e) => {
                      setUserData({ ...userData, password: e.target.value });
                    }}
                  />
                </div>
              </div>

              <div className="LoginPageLeftPanelFooterMoveMiddle mt-2">
                <Button
                  className="LoginPageButton"
                  size="sm"
                  variant="primary"
                  onClick={formAction}
                >
                  {userData.registerMode ? "Register" : "Login"}
                </Button>
                {userData.registerMode && (
                  <p className="small">
                    Have an account already?
                    <div
                      onClick={() => {
                        setUserData({
                          ...userData,
                          registerMode: !userData.registerMode,
                        });
                      }}
                    >
                      Login
                    </div>
                  </p>
                )}

                {!userData.registerMode && (
                  <p className="small">
                    Don't have an account?
                    <div
                      onClick={() => {
                        setUserData({
                          ...userData,
                          registerMode: !userData.registerMode,
                        });
                      }}
                    >
                      Register
                    </div>
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="rightHorizontalContainerLogin"></div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
