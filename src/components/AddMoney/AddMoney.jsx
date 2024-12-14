import React, { useEffect, useState } from "react";
import "./style.css";
import { Button, Form } from "react-bootstrap";
import useStore from "../SideComponents/ContextStore";
import notify from "../SideComponents/Toastify";
import axios from "axios";

const apiUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const AddMoney = ({ logoutWhenUnauthorizedUser }) => {
  const { store, setStore } = useStore();

  useEffect(() => {
    logoutWhenUnauthorizedUser(store);
  }, [store]);

  const [userData, setUserData] = useState({
    amount: 500,
    password: "",
    couponCode: "",
  });

  const addMoneyApiFunc = async () => {
    setStore({ ...store, loadingSrc: true });

    var payload = {
      email: store?.userDetailsItem?.email,
      password: userData.password == "" ? null : userData.password,
      amount: userData.amount == "" ? null : userData.amount,
      couponCode: userData.couponCode == "" ? null : userData.couponCode,
    };

    var finalObj = {};

    var res = {};

    try {
      // add money
      res = await axios.post(`${apiUrl}/auth/addMoney`, payload);

      if (res?.data?.success === false) {
        setStore({ ...store, loadingSrc: false });
        notify(res?.data?.message, true);
        return;
      }

      res = res.data;

      //reload user details like account balance, investedAmount

      payload = {
        email: store?.userDetailsItem?.email,
        password: store?.userDetailsItem?.password,
      };

      res = await axios.post(`${apiUrl}/auth/specificUserDetails`, payload);
      if (res?.data?.success === false) {
        setStore({ ...store, loadingSrc: false });
        notify(res?.data?.message, true);
        return;
      }

      res = res.data;

      finalObj = {
        ...store,
        userDetailsItem: {
          ...res,
          password: store?.userDetailsItem?.password,
        },
      };
    } catch (err) {
      console.log("In add money: " + err);

      setStore({ ...store, loadingSrc: false });
      notify("In add money: " + err, true);

      return;
    }

    setStore({ ...finalObj, loadingSrc: false });
    notify("Transaction successfull");

    setUserData({
      amount: 500,
      password: "",
      couponCode: "",
    });
  };

  return (
    <>
      <div className="addMoneyOuterMainContainer">
        <div className="addMoneyInnerMainContainer">
          <div className="addMoneyInnerContainerLabel">
            <div className="addMoneyInnerContainerLabelText">
              Payment Details
            </div>
          </div>
          <div className="addMoneyInnerContainerFields">
            <Form.Label htmlFor="addMoneyPassword" className="small">
              Password
            </Form.Label>
            <Form.Control
              autoComplete="on"
              size="sm"
              type="text"
              id="addMoneyPassword"
              className="addMoneyPassword"
              placeholder="Enter your account password"
              value={userData?.password}
              onChange={(e) => {
                setUserData({ ...userData, password: e.target.value });
              }}
            />
          </div>
          <div className="addMoneyInnerContainerFields">
            <Form.Label htmlFor="addMoneyAmount" className="small">
              Select Amount
            </Form.Label>
            <Form.Select
              aria-label="Default select example"
              id="addMoneyAmount"
              className="addMoneyAmount"
              onChange={(e) => {
                setUserData({ ...userData, amount: e.target.value });
              }}
            >
              <option value="500">500 Rs</option>
              <option value="1000">1000 Rs</option>
              <option value="5000">5000 Rs</option>
            </Form.Select>
          </div>
          <div className="addMoneyInnerContainerFields">
            <Form.Label htmlFor="addMoneyCouponCode" className="small">
              Coupon Code
            </Form.Label>
            <Form.Control
              autoComplete="on"
              size="sm"
              type="text"
              id="addMoneyCouponCode"
              className="addMoneyCouponCode"
              placeholder="Enter Code"
              value={userData?.couponCode}
              onChange={(e) => {
                setUserData({ ...userData, couponCode: e.target.value });
              }}
            />
          </div>

          <div className="addMoneyWhiteBottomDividerLine"></div>

          <div className="addMoneyAvailableCouponsContainer">
            <div className="addMoneyAvailableCouponLabel">
              Available coupons
            </div>
            <div className="addMoneyAvailableCouponListContainer mt-2">
              <div
                className="addMoneyIndividualCouponContainer"
                onClick={() => {
                  setUserData({ ...userData, couponCode: "freemoney" });
                }}
              >
                <div className="addMoneyIndividualCouponLabel">
                  Code: <b>freemoney</b>
                </div>
                <div className="addMoneyIndividualCouponDescription">
                  <b>100% off</b> on your selected amount
                </div>
              </div>
              <div
                className="addMoneyIndividualCouponContainer"
                onClick={() => {
                  setUserData({ ...userData, couponCode: "freemoney" });
                }}
              >
                <div className="addMoneyIndividualCouponLabel">
                  Code: <b>random</b>
                </div>
                <div className="addMoneyIndividualCouponDescription">
                  Please use first coupon noting else works
                </div>
              </div>
            </div>
          </div>

          <div className="addMoneyWhiteBottomDividerLine"></div>

          <div className="addMoneyPageButtonContainer mt-2">
            <Button
              className="addMoneyPageButton"
              size="sm"
              variant="primary"
              onClick={addMoneyApiFunc}
            >
              Add Money
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddMoney;
