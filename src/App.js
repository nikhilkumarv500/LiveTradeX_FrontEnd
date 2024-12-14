import React from "react";
import PageRouter from "./components/PageRouter.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./GeneralStyle.css";
import { ContextStore } from "./components/SideComponents/ContextStore.jsx";
import { WebSocketStore } from "./components/SideComponents/WebSocketStore.jsx";

export default function App() {
  return (
    <>
      <WebSocketStore>
        <ContextStore>
          <PageRouter />
        </ContextStore>
      </WebSocketStore>
    </>
  );
}
