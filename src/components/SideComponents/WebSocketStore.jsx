import React, { createContext, useContext, useState } from "react";

const WsAppContext = createContext();

export const WebSocketStore = ({ children }) => {
  const [wsStore, setWsStore] = useState({});
  return (
    <WsAppContext.Provider value={{ wsStore, setWsStore }}>
      {children}
    </WsAppContext.Provider>
  );
};

const useWsStore = () => useContext(WsAppContext);
export default useWsStore;
