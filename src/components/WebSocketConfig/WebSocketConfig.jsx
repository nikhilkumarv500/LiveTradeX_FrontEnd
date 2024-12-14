import React, { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { over } from "stompjs";
import notify from "../SideComponents/Toastify";
import useStore from "../SideComponents/ContextStore";

const apiUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const WebSocketConfig = ({ wsStore, setWsStore, socketOpen }) => {
  // const { store, setStore } = useStore();

  const stompClientRef = useRef(null);

  const connect = () => {
    let Sock = new SockJS(`${apiUrl}/ws`);
    stompClientRef.current = over(Sock);
    stompClientRef.current.connect({}, onConnected, onError);
  };

  const disconnect = () => {
    if (stompClientRef.current !== null) {
      stompClientRef.current.disconnect(() => {
        notify("Live updates server disconnected successfully");
      });
      stompClientRef.current = null;
    }
  };

  useEffect(() => {
    if (socketOpen === "connect") connect();
    else if (socketOpen === "close") disconnect();
  }, [socketOpen]);

  const onError = (err) => {
    notify(
      "Live Connection Failed, but still you will be able to use our application without any intreption :)",
      true
    );
  };

  const onConnected = () => {
    stompClientRef.current.subscribe("/stockUpdates", onMessageRecieved);
    notify("Connected to Live updates server");
  };

  const onMessageRecieved = async (response) => {
    const res = JSON.parse(response.body);

    let wsFinalObj = {};

    // reload total user count
    wsFinalObj = {
      listAllStocks: res.listAllStocks,
      userCount: res.userCount,
    };

    setWsStore({ ...wsFinalObj });
  };

  return <></>;
};

export default WebSocketConfig;
