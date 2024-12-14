import React, { useEffect, useState } from "react";
import "./style.css";
import DashboardSellPreviewPanel from "./DashboardSellPreviewPanel/DashboardSellPreviewPanel.jsx";
import Toggle from "react-styled-toggle";
import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, { customFilter } from "react-bootstrap-table2-filter";

import UserPurchasedStocks from "../Data/UserPurchasedStocks.js";

import CrossMark from "../SideComponents/CrossMark.jsx";
import useStore from "../SideComponents/ContextStore.jsx";
import userStocksHistoryList from "../Data/HistoryList.js";
import notify from "../SideComponents/Toastify.jsx";
import axios from "axios";
import useWsStore from "../SideComponents/WebSocketStore.jsx";

import dashboardProfit from "../../assets/dashboardProfit.png";
import dashboardInvestedAmount from "../../assets/dashboardInvestedAmount.png";
import dashboardWalletAmount from "../../assets/dashboardWalletAmount.png";
import emptyPreviewBoy from "../../assets/emptyPreviewBoy.jpg";

const apiUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const Dashboard = ({ logoutWhenUnauthorizedUser }) => {
  const { store, setStore } = useStore();
  const { wsStore, setWsStore } = useWsStore();

  useEffect(() => {
    logoutWhenUnauthorizedUser(store);
  }, [store]);

  const [selectedStock, setSelectedStock] = useState(null);

  const [tableData, setTableData] = useState(() => {
    let arr = [];

    arr = structuredClone(store?.userStocksItemList || []).map((item) => {
      structuredClone(wsStore?.listAllStocks || []).map((x) => {
        if (x.id === item.stockId) {
          item.name = item.stockName;
          item.originalPrice = x.originalPrice;
          item.lowestPrice = x.lowestPrice;
          item.highestPrice = x.highestPrice;
          item.curPrice = x.curPrice;
          item.percentage = x.percentage;
          item.remQuantity = x.remQuantity;
          item.prevPercentages = x.prevPercentages;
          item.initialQuantity = x.initialQuantity;
          item.purchasedQuantity = x.purchasedQuantity;
          item.totalInvestedUserCnt = x.totalInvestedUserCnt;
        }
      });
      return item;
    });

    return arr;
  });

  useEffect(() => {
    let arr = structuredClone(store?.userStocksItemList || []).map((item) => {
      structuredClone(wsStore?.listAllStocks || []).map((x) => {
        if (x.id === item.stockId) {
          item.name = item.stockName;
          item.originalPrice = x.originalPrice;
          item.lowestPrice = x.lowestPrice;
          item.highestPrice = x.highestPrice;
          item.curPrice = x.curPrice;
          item.percentage = x.percentage;
          item.remQuantity = x.remQuantity;
          item.prevPercentages = x.prevPercentages;
          item.initialQuantity = x.initialQuantity;
          item.purchasedQuantity = x.purchasedQuantity;
          item.totalInvestedUserCnt = x.totalInvestedUserCnt;
        }
      });
      return item;
    });

    setTableData([...arr]);

    if (selectedStock) {
      arr.map((item) => {
        if (item.purchaseId === selectedStock.purchaseId) {
          setSelectedStock({
            ...item,
          });
        }
      });
    }
  }, [wsStore?.listAllStocks]);

  const columns = [
    {
      dataField: "name",
      text: "Name",
      filter: customFilter(),
      filterRenderer: (onFilter, column) => (
        <input
          type="text"
          placeholder="Type to search"
          onChange={(e) => onFilter(e.target.value)}
          style={{
            width: "100%",
            textAlign: "center",
            padding: "0px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      ),
    },
    {
      dataField: "percentage",
      text: "Percentage (%)",
      sort: true,
      formatter: (cell, row) => {
        const color =
          row && row.percentage < 0 ? "colorTextRed" : "colorTextBlue";
        return (
          <div className={color}>
            {row && row.percentage > 0 ? "+" : ""}
            {row.percentage}
          </div>
        );
      },
      sortCaret: (order, column) => {
        if (order === "asc") {
          return <span style={{ cursor: "pointer" }}> 🔼</span>;
        } else if (order === "desc") {
          return <span style={{ cursor: "pointer" }}> 🔽</span>;
        }
        return <span style={{ cursor: "pointer" }}> ⇅</span>;
      },
    },
    {
      dataField: "purchasedPrice",
      text: "Purchased Price (Rs)",
      sort: true,
      sortCaret: (order, column) => {
        if (order === "asc") {
          return <span style={{ cursor: "pointer" }}> 🔼</span>;
        } else if (order === "desc") {
          return <span style={{ cursor: "pointer" }}> 🔽</span>;
        }
        return <span style={{ cursor: "pointer" }}> ⇅</span>;
      },
    },
    {
      dataField: "curPrice",
      text: "Current Price (Rs)",
      sort: true,
      sortCaret: (order, column) => {
        if (order === "asc") {
          return <span style={{ cursor: "pointer" }}> 🔼</span>;
        } else if (order === "desc") {
          return <span style={{ cursor: "pointer" }}> 🔽</span>;
        }
        return <span style={{ cursor: "pointer" }}> ⇅</span>;
      },
    },
  ];

  const historyTableColumns = [
    {
      dataField: "purchaseId",
      text: "Purchase Id",
      filter: customFilter(),
      filterRenderer: (onFilter, column) => (
        <input
          type="text"
          placeholder="Type to search"
          onChange={(e) => onFilter(e.target.value)}
          style={{
            width: "95%",
            textAlign: "center",
            padding: "0px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      ),
    },
    {
      dataField: "stockName",
      text: "Stock name",
      filter: customFilter(),
      filterRenderer: (onFilter, column) => (
        <input
          type="text"
          placeholder="Type to search"
          onChange={(e) => onFilter(e.target.value)}
          style={{
            width: "95%",
            textAlign: "center",
            padding: "0px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      ),
    },
    {
      dataField: "profit",
      text: "Total profit (Rs)",
      sort: true,
      sortCaret: (order, column) => {
        if (order === "asc") {
          return <span style={{ cursor: "pointer" }}> 🔼</span>;
        } else if (order === "desc") {
          return <span style={{ cursor: "pointer" }}> 🔽</span>;
        }
        return <span style={{ cursor: "pointer" }}> ⇅</span>;
      },
    },
    {
      dataField: "noOfStocks",
      text: "No of stocks Sold",
      sort: true,
      sortCaret: (order, column) => {
        if (order === "asc") {
          return <span style={{ cursor: "pointer" }}> 🔼</span>;
        } else if (order === "desc") {
          return <span style={{ cursor: "pointer" }}> 🔽</span>;
        }
        return <span style={{ cursor: "pointer" }}> ⇅</span>;
      },
    },
    {
      dataField: "purchasedPrice",
      text: "Purchased at (Rs)",
      sort: true,
      sortCaret: (order, column) => {
        if (order === "asc") {
          return <span style={{ cursor: "pointer" }}> 🔼</span>;
        } else if (order === "desc") {
          return <span style={{ cursor: "pointer" }}> 🔽</span>;
        }
        return <span style={{ cursor: "pointer" }}> ⇅</span>;
      },
    },
    {
      dataField: "soldPrice",
      text: "Sold at (Rs)",
      sort: true,
      sortCaret: (order, column) => {
        if (order === "asc") {
          return <span style={{ cursor: "pointer" }}> 🔼</span>;
        } else if (order === "desc") {
          return <span style={{ cursor: "pointer" }}> 🔽</span>;
        }
        return <span style={{ cursor: "pointer" }}> ⇅</span>;
      },
    },
    {
      dataField: "purchasedPercentage",
      text: "Purchased at (%)",
      sort: true,
      formatter: (cell, row) => {
        const color =
          row && row.purchasedPercentage < 0 ? "colorTextRed" : "colorTextBlue";
        return (
          <div className={color}>
            {row && row.purchasedPercentage > 0 ? "+" : ""}
            {row.purchasedPercentage}
          </div>
        );
      },
      sortCaret: (order, column) => {
        if (order === "asc") {
          return <span style={{ cursor: "pointer" }}> 🔼</span>;
        } else if (order === "desc") {
          return <span style={{ cursor: "pointer" }}> 🔽</span>;
        }
        return <span style={{ cursor: "pointer" }}> ⇅</span>;
      },
    },
    {
      dataField: "soldPercentage",
      text: "Sold at (%)",
      sort: true,
      formatter: (cell, row) => {
        const color =
          row && row.soldPercentage < 0 ? "colorTextRed" : "colorTextBlue";
        return (
          <div className={color}>
            {row && row.soldPercentage > 0 ? "+" : ""}
            {row.soldPercentage}
          </div>
        );
      },
      sortCaret: (order, column) => {
        if (order === "asc") {
          return <span style={{ cursor: "pointer" }}> 🔼</span>;
        } else if (order === "desc") {
          return <span style={{ cursor: "pointer" }}> 🔽</span>;
        }
        return <span style={{ cursor: "pointer" }}> ⇅</span>;
      },
    },
    {
      dataField: "",
      text: "Delete History",

      formatter: (cell, row) => {
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              className="dashboardHistoryDeleteEntryButton"
              onClick={() => {
                deleteHistoryApi(row.historyId);
              }}
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  const deleteHistoryApi = async (historyId) => {
    setStore({ ...structuredClone(store), loadingSrc: true });

    let payload = {
      email: structuredClone(store)?.userDetailsItem?.email,
      password: structuredClone(store)?.userDetailsItem?.password,
      historyId: historyId,
    };

    let finalObj = {};
    let wsFinalObj = {};

    let res = {};

    try {
      //delete history
      res = await axios.post(`${apiUrl}/history/deleteByHistoryId`, payload);

      if (res?.data?.success === false) {
        setStore({ ...structuredClone(store), loadingSrc: false });
        notify(res?.data?.message, true);
        return;
      }

      // update history table
      payload = {
        email: structuredClone(store)?.userDetailsItem?.email,
      };

      res = await axios.post(
        `${apiUrl}/history/listAllHistoryByEmail`,
        payload
      );

      if (res?.data?.success === false) {
        setStore({ ...structuredClone(store), loadingSrc: false });
        notify(res?.data?.message, true);
        return;
      }

      res = res.data;

      finalObj = {
        ...structuredClone(store),
        userStocksHistoryList: res,
      };

      // reload user Purchased stocks list

      payload = {
        email: structuredClone(store)?.userDetailsItem?.email,
      };

      res = await axios.post(
        `${apiUrl}/userStocks/listAllPurchasedStocksByEmail`,
        payload
      );

      if (res?.data?.success === false) {
        setStore({ ...structuredClone(store), loadingSrc: false });
        notify(res?.data?.message, true);
        return;
      }

      res = res.data;

      finalObj = {
        ...finalObj,
        userStocksItemList: res,
      };

      //reload user data like account balance

      payload = {
        email: structuredClone(store)?.userDetailsItem?.email,
        password: structuredClone(store)?.userDetailsItem?.password,
      };

      res = await axios.post(`${apiUrl}/auth/specificUserDetails`, payload);

      if (res?.data?.success === false) {
        setStore({ ...structuredClone(store), loadingSrc: false });
        notify(res?.data?.message, true);
        return;
      }

      res = res.data;

      finalObj = {
        ...finalObj,
        userDetailsItem: {
          ...res,
          password: structuredClone(store)?.userDetailsItem?.password,
        },
      };

      // reload general stocks list

      res = await axios.get(`${apiUrl}/stocks/listAllStocks`);

      if (res?.data?.success === false) {
        setStore({ ...structuredClone(store), loadingSrc: false });
        notify(res?.data?.message, true);
        return;
      }

      res = res.data;

      finalObj = {
        ...finalObj,
      };

      wsFinalObj = {
        listAllStocks: res,
        userCount: wsStore.userCount,
      };
    } catch (err) {
      console.log("In Dashboard sellStocks Preview: " + err);

      setStore({ ...structuredClone(store), loadingSrc: false });
      notify("In Dashboard sellStocks: " + err, true);

      return;
    }

    setWsStore({ ...wsFinalObj });
    setStore({ ...finalObj, loadingSrc: false });
    notify("Delete successfull");
  };

  // useEffect(()=>{
  //   console.log(selectedStock);
  // },[selectedStock]);

  const customPageSizes = [
    { text: "2 Rows", value: 2 },
    { text: "5 Rows", value: 5 },
    { text: "10 Rows", value: 10 },
    { text: "20 Rows", value: 20 },
    { text: "50 Rows", value: 50 },
    { text: "100 Rows", value: 100 },
  ];

  const paginationOptions = {
    sizePerPageList: customPageSizes,
    sizePerPage: 5,
    hideSizePerPage: false,
    pageButtonRenderer: ({ page, active, onPageChange }) => {
      if (page === "<") {
        return (
          <div
            className="table-footer-paginator-buttons"
            onClick={(e) => onPageChange(page, e)}
          >
            {"<"}
          </div>
        );
      }

      if (page === ">") {
        return (
          <div
            className="table-footer-paginator-buttons"
            onClick={(e) => onPageChange(page, e)}
          >
            {">"}
          </div>
        );
      }

      if (active) {
        return (
          <div className="table-footer-paginator-currentPageNumber-Container">
            <div className="table-footer-paginator-currentPageNumber">
              {page}
            </div>
          </div>
        );
      }

      return false;
    },
  };

  const rowStyle = (rowData) => {
    return {
      backgroundColor:
        selectedStock && rowData.purchaseId === selectedStock.purchaseId
          ? "rgb(172, 168, 168, 0.5)"
          : "",
      // box-shadow: 0px 0px 5px black;
      cursor: "pointer",
    };
  };

  return (
    <div className="dashBoardMainContainer">
      <div className="upperDashBoardUserDetailsContainer">
        <div className="upperDashBoardUserMoneyDetailsPanel">
          <div className="upperDashBoardUserMoneyDetailsPanelLeftSection">
            <div className="upperDashBoardUserMoneyDetailsPanelLabel">
              Total Profit
            </div>
            <div className="upperDashBoardUserMoneyDetailsPanelValue">
              {structuredClone(store)?.userDetailsItem?.profitMade + " ₹"}
            </div>
          </div>
          <div className="upperDashBoardUserMoneyDetailsPanelImage">
            <img width="45px" height="45px" src={dashboardProfit} />
          </div>
        </div>

        <div className="upperDashBoardUserMoneyDetailsPanel">
          <div className="upperDashBoardUserMoneyDetailsPanelLeftSection">
            <div className="upperDashBoardUserMoneyDetailsPanelLabel">
              Amount Invested
            </div>
            <div className="upperDashBoardUserMoneyDetailsPanelValue">
              {structuredClone(store)?.userDetailsItem?.investedAmount + " ₹"}
            </div>
          </div>
          <div className="upperDashBoardUserMoneyDetailsPanelImage">
            <img width="45px" height="45px" src={dashboardInvestedAmount} />
          </div>
        </div>

        <div className="upperDashBoardUserMoneyDetailsPanel">
          <div className="upperDashBoardUserMoneyDetailsPanelLeftSection">
            <div className="upperDashBoardUserMoneyDetailsPanelLabel">
              Wallet Balance
            </div>
            <div className="upperDashBoardUserMoneyDetailsPanelValue">
              {structuredClone(store)?.userDetailsItem?.accountBalance + " ₹"}
            </div>
          </div>
          <div className="upperDashBoardUserMoneyDetailsPanelImage">
            <img width="45px" height="45px" src={dashboardWalletAmount} />
          </div>
        </div>
      </div>

      <div className="middleDashBoardViewListAllStocksContainer">
        {(tableData || []).length > 0 ? (
          <>
            <div className="middleDashBoardViewListAllStocksTableContainer">
              <div className="middleDashBoardViewListAllStocksSellTableLabel">
                Bought Stocks
              </div>

              <div className="buyStockListAllStocksTable">
                <BootstrapTable
                  bootstrap4
                  keyField="id"
                  data={tableData}
                  columns={columns}
                  pagination={paginationFactory(paginationOptions)}
                  rowEvents={{
                    onClick: (
                      e,
                      rowData,
                      rowIndex,
                      columnIndex,
                      originalEvent
                    ) => {
                      setSelectedStock(rowData);
                    },
                  }}
                  rowStyle={(rowData) => rowStyle(rowData)}
                  filter={filterFactory()}
                />
              </div>
            </div>

            {!selectedStock ? (
              <div className="middleDashBoardViewListAllStocksSellEmptyPreviewNonSelectPanelBG">
                <div className="middleDashBoardListAllStocksEmptyPreviewLabelNonSelectPreviewPanel">
                  Select any stock from the table for preview
                </div>
                <div className="middleDashBoardViewListAllStocksSellEmptyPreviewimage">
                  <img width="250px" src={emptyPreviewBoy} />
                </div>
              </div>
            ) : (
              <div className="middleDashBoardViewListAllStocksSellEmptyPreview">
                <div className="middleDashBoardListAllStocksEmptyPreviewLabel">
                  <div>Selected Stock</div>
                  <div
                    className="middledashboardSellPreviewInnerPanelTopDetailsRightCrossMarkContainer"
                    onClick={() => {
                      setSelectedStock(null);
                    }}
                  >
                    <CrossMark />
                  </div>
                </div>
                <DashboardSellPreviewPanel
                  {...selectedStock}
                  setSelectedStock={setSelectedStock}
                  setTableData={setTableData}
                />
              </div>
            )}
          </>
        ) : (
          <div className="dashboardEmptyBoughtStocksContainer">
            <div className="dashboardEmptyBoughtStocksHeaderLabelContainer">
              <div className="dashboardEmptyBoughtStocksHeaderLabel">
                Bought Stocks
              </div>
            </div>
            <div className="whiteBorderLine"></div>
            <div>You have not bought any stocks yet</div>
          </div>
        )}
      </div>

      <div className="dashboardHistoryMainContainer">
        {(store.userStocksHistoryList || []).length > 0 ? (
          <div className="dashboardHistoryInnerContainer">
            <div className="dashboardHistoryLabelContainer">
              <div className="dashboardHistoryMainLabel">
                Sold stocks history
              </div>
            </div>
            <div className="dashboardHistoryTableContainer">
              <div className="buyStockListAllStocksTable">
                <BootstrapTable
                  bootstrap4
                  keyField="id"
                  data={structuredClone(store.userStocksHistoryList || []).map(
                    (item) => {
                      item.profit =
                        item.noOfStocks *
                        (item.soldPrice - item.purchasedPrice);
                      return item;
                    }
                  )}
                  columns={historyTableColumns}
                  pagination={paginationFactory(paginationOptions)}
                  rowEvents={{
                    onClick: (
                      e,
                      rowData,
                      rowIndex,
                      columnIndex,
                      originalEvent
                    ) => {
                      // setSelectedStock(rowData);
                    },
                  }}
                  // rowStyle={(rowData) => rowStyle(rowData)}
                  filter={filterFactory()}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboardEmptyBoughtStocksContainer">
            <div className="dashboardEmptyBoughtStocksHeaderLabelContainer">
              <div className="dashboardEmptyBoughtStocksHeaderLabel">
                Sold stocks history
              </div>
            </div>
            <div className="whiteBorderLine"></div>
            <div>You have not sold any stocks yet</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
