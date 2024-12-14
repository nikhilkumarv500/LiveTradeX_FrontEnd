import React, { useEffect, useState } from "react";
import AuthPage from "./AuthPage/AuthPage.jsx";
import Header from "./Header/Header.jsx";
import Footer from "./Footer/Footer.jsx";
import BuyStock from "./BuyStock/BuyStock.jsx";
import Dashboard from "./Dashboard/Dashboard.jsx";
import "./PageRouterStyle.css";
import {
  BrowserRouter,
  Switch,
  Route,
  useLocation,
  useHistory,
} from "react-router-dom";
import LoadingScreen from "./SideComponents/LoadingScreen.jsx";
import notify, { Toastify } from "./SideComponents/Toastify.jsx";
import AddMoney from "./AddMoney/AddMoney.jsx";
import WebSocketConfig from "./WebSocketConfig/WebSocketConfig.jsx";
import useWsStore from "./SideComponents/WebSocketStore.jsx";
import useStore from "./SideComponents/ContextStore.jsx";
import { deepClone } from "./Utils/Utils.jsx";

const PageRouter = () => {
  const { store, setStore } = useStore();
  const { wsStore, setWsStore } = useWsStore();
  const [socketOpen, setSocketOpen] = useState(null);

  return (
    <div className="PageRouterBackground">
      <BrowserRouter>
        <PageRouterContent
          wsStore={wsStore}
          setWsStore={setWsStore}
          socketOpen={socketOpen}
          setSocketOpen={setSocketOpen}
          store={store}
          setStore={setStore}
        />
      </BrowserRouter>
    </div>
  );
};

const PageRouterContent = ({
  wsStore,
  setWsStore,
  socketOpen,
  setSocketOpen,
  store,
  setStore,
}) => {
  const location = useLocation();
  const navigate = useHistory();

  const logoutWhenUnauthorizedUser = (store) => {
    if (!store.userDetailsItem?.email || !store.userDetailsItem?.password) {
      navigate.push("/");
      notify("Unauthorized user !", true);
      notify("Please Login again !", true);
      //   setSocketOpen("close");
      // setStore({
      //   loadingSrc: false,
      // });
      // setWsStore({});
    }
  };

  return (
    <>
      {location.pathname !== "/" && (
        <Header setSocketOpen={setSocketOpen} location={location} />
      )}
      <Toastify />
      <WebSocketConfig
        wsStore={{ ...deepClone(wsStore) }}
        setWsStore={setWsStore}
        socketOpen={socketOpen}
      />
      <LoadingScreen />
      <Switch>
        <Route path="/" element={<AuthPage setSocketOpen={setSocketOpen} />} />
        <Route
          path="/buyStockPage"
          element={
            <BuyStock logoutWhenUnauthorizedUser={logoutWhenUnauthorizedUser} />
          }
        />
        <Route
          path="/dashboardPage"
          element={
            <Dashboard
              logoutWhenUnauthorizedUser={logoutWhenUnauthorizedUser}
            />
          }
        />
        <Route
          path="/addMoney"
          element={
            <AddMoney logoutWhenUnauthorizedUser={logoutWhenUnauthorizedUser} />
          }
        />
      </Switch>

      <Footer />
    </>
  );
};

export default PageRouter;
