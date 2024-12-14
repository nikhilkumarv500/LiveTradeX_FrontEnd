import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Offcanvas from "react-bootstrap/Offcanvas";
import "./style.css";
import { Outlet, Link } from "react-router-dom";
import useStore from "../SideComponents/ContextStore";
import WebSocketConfig from "../WebSocketConfig/WebSocketConfig";
import useWsStore from "../SideComponents/WebSocketStore";
import ProjectLogo from "../../assets/ProjectLogo.png";
import notify from "../SideComponents/Toastify";

// <div className="upListMainPageForHeaderAdjustment"></div>

const Header = ({ setSocketOpen, location }) => {
  const { store, setStore } = useStore();
  const { wsStore, setWsStore } = useWsStore();

  const [expanded, setExpanded] = useState(false);
  const handleToggle = () => setExpanded(!expanded);
  const expand = "sm";

  const handleLogout = () => {
    setExpanded(false);
    setSocketOpen("close");
    setStore({
      loadingSrc: false,
    });
    setWsStore({});
    notify("Logout Successfull");

    // navigate("/");
  };

  return (
    <>
      <div className="HeaderContainer">
        <Navbar
          collapseOnSelect
          expanded={expanded}
          onToggle={handleToggle}
          key={expand}
          expand={expand}
          className="bg-body-tertiary"
          style={{
            backgroundColor: "transparent",
          }}
        >
          <Container fluid>
            <Navbar.Brand style={{ color: "white" }}>
              <div className="LoginFormHeaderProjectNameImageContainer">
                <div className="LoginFormHeaderProjectImageContainer">
                  <img width="30px" height="30px" src={ProjectLogo} />
                </div>
                <div className="LoginFormHeaderProjectTextContainer">
                  LiveTradeX
                </div>
              </div>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
            <Navbar.Offcanvas
              id={`offcanvasNavbar-expand-${expand}`}
              aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
              placement="end"
            >
              <Offcanvas.Header closeButton className="innerHeaderPopUpMenu ">
                <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                  Menu
                </Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <Nav className="justify-content-end flex-grow-1 pe-3 gap-3">
                  <div className="navbarHeaderWalletBalanceContainer">
                    {`Wallet Balance : ${
                      store.userDetailsItem?.accountBalance || 0
                    } Rs`}
                  </div>
                  <div className="navBarHeaderVerticalPartioningLine"></div>
                  <Link
                    to="/addMoney"
                    className={`navBarRightLinks ${
                      expanded
                        ? "navBarRightLinksColorBlack"
                        : "navBarRightLinksColorWhite"
                    } 
                    ${
                      location.pathname !== null &&
                      location.pathname === "/addMoney"
                        ? "navBarRightLinksOnActive"
                        : ""
                    }
                    `}
                    onClick={() => {
                      setExpanded(false);
                    }}
                  >
                    Add money
                  </Link>
                  <div className="navBarHeaderVerticalPartioningLine"></div>
                  <Link
                    to="/buyStockPage"
                    className={`navBarRightLinks ${
                      expanded
                        ? "navBarRightLinksColorBlack"
                        : "navBarRightLinksColorWhite"
                    }
                    ${
                      location.pathname !== null &&
                      location.pathname === "/buyStockPage"
                        ? "navBarRightLinksOnActive"
                        : ""
                    }
                    `}
                    onClick={() => {
                      setExpanded(false);
                    }}
                  >
                    Buy Stock
                  </Link>
                  <div className="navBarHeaderVerticalPartioningLine"></div>
                  <Link
                    to="/dashboardPage"
                    className={`navBarRightLinks ${
                      expanded
                        ? "navBarRightLinksColorBlack"
                        : "navBarRightLinksColorWhite"
                    }
                    ${
                      location.pathname !== null &&
                      location.pathname === "/dashboardPage"
                        ? "navBarRightLinksOnActive"
                        : ""
                    }
                    `}
                    onClick={() => {
                      setExpanded(false);
                    }}
                  >
                    Dashboard/Sell{" "}
                  </Link>
                  <div className="navBarHeaderVerticalPartioningLine"></div>
                  <Link
                    to="/"
                    className={`navBarRightLinks ${
                      expanded
                        ? "navBarRightLinksColorBlack"
                        : "navBarRightLinksColorWhite"
                    }`}
                    onClick={handleLogout}
                  >
                    Logout
                  </Link>
                  {/* <button
                    onClick={() => {
                      console.log(store);
                      console.log(wsStore);
                    }}
                  >
                    prt
                  </button> */}
                </Nav>
              </Offcanvas.Body>
            </Navbar.Offcanvas>
          </Container>
        </Navbar>
      </div>
    </>
  );
};

export default Header;
