import { useContext, useState } from "react";
import { RingLoader } from "react-spinners";
import useStore from "./ContextStore";

const LoadingScreen = () => {
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#ffffff");

  const { store, setStore } = useStore();

  const override = {
    position: "fixed",
    top: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 99999,
  };

  return (
    <>
      {store?.loadingSrc && (
        <div style={{ ...override }}>
          <RingLoader
            color={color}
            loading={store?.loadingSrc}
            // cssOverride={override}
            size={100}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      )}
    </>
  );
};

export default LoadingScreen;
