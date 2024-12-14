import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const ContextStore = ({ children }) => {
  const [store, setStore] = useState({
    loadingSrc: false,
  });
  return (
    <AppContext.Provider value={{ store, setStore }}>
      {children}
    </AppContext.Provider>
  );
};

const useStore = () => useContext(AppContext);
export default useStore;
