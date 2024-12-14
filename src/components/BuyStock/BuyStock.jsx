import React, { useEffect, useState } from "react";
import "./style.css";
import BuyStockPreviewPanel from "./BuyStockPreviewPanel/BuyStockPreviewPanel.jsx";
import BuyStockTopHitPanel from "./BuyStockTopHitPanel/BuyStockTopHitPanel.jsx";
import Toggle from "react-styled-toggle";
import Robot from "../Data/Robot.jsx";

import BootstrapTable from "react-bootstrap-table-next";
import paginationFactory from "react-bootstrap-table2-paginator";
import filterFactory, { customFilter } from "react-bootstrap-table2-filter";

import { PieChart } from "react-minimal-pie-chart";

import "swiper/swiper-bundle.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, Virtual } from "swiper/modules";
import FullOpPieChart from "../SideComponents/FullOpPieChart.jsx";
import CrossMark from "../SideComponents/CrossMark.jsx";
import useStore from "../SideComponents/ContextStore.jsx";
import useWsStore from "../SideComponents/WebSocketStore.jsx";

import emptyPreviewBoy from "../../assets/emptyPreviewBoy.jpg";

const BuyStock = ({ logoutWhenUnauthorizedUser }) => {
  const { store, setStore } = useStore();

  useEffect(() => {
    logoutWhenUnauthorizedUser(store);
  }, [store]);

  const { wsStore, setWsStore } = useWsStore();

  const [tableData, setTableData] = useState(
    structuredClone(wsStore?.listAllStocks || [])
  );
  const [showUnAvailableStocks, setShowUnAvailableStocks] = useState(false);

  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    setTableData([...structuredClone(wsStore?.listAllStocks || [])]);

    if (selectedStock) {
      structuredClone(wsStore?.listAllStocks || []).map((item) => {
        if (selectedStock.id === item.id) {
          setSelectedStock({ ...item });
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
        selectedStock && rowData.id === selectedStock.id
          ? "rgb(172, 168, 168, 0.5)"
          : "",
      // box-shadow: 0px 0px 5px black;
      cursor: "pointer",
    };
  };

  return (
    <div className="buyStockMainContainer">
      <div className="buyStockTopHitStocksMainContainer">
        <div className="buyStockTopHitStocksLabel">
          Hot news
          {/* <button
            onClick={() => {
              var newDataList = structuredClone(tableData);
              newDataList = newDataList.map((item) => {
                var prevPrecList = item.prevPercentages;
                prevPrecList = [...prevPrecList, prevPrecList[0]];
                prevPrecList.shift();
                item.prevPercentages = prevPrecList;

                item.percentage = -1 * item.percentage;

                return item;
              });
              setTableData([...newDataList]);
              // ---------------
              newDataList.map((item) => {
                if (selectedStock && item.id == selectedStock.id) {
                  setSelectedStock({ ...item });
                }
              });
            }}
          >
            {" "}
            Refresh{" "}
          </button> */}
        </div>

        <div className="buyStockTopHitStocksDiv">
          <div className="buyStockTopHitStocksDivInnerCenterTrainPanel">
            <Swiper
              autoplay={{
                delay: 500,
                disableOnInteraction: false,
              }}
              loop
              modules={[Autoplay]}
              breakpoints={{
                1250: {
                  slidesPerView: 4,
                  spaceBetween: 2,
                },
                950: {
                  slidesPerView: 3,
                  spaceBetween: 2,
                },
                700: {
                  slidesPerView: 2,
                  spaceBetween: 2,
                },
                580: {
                  slidesPerView: 1,
                  spaceBetween: 2,
                },
                1: {
                  slidesPerView: 1,
                  spaceBetween: 0,
                },
              }}
            >
              {tableData.map((item) => {
                return (
                  <SwiperSlide>
                    <BuyStockTopHitPanel {...item} />
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        </div>
      </div>
      <div className="buyStockListAllStocksContainer">
        <div className="buyStockListAllStocksTablePreviewContainer">
          <div className="buyStockListAllStocksTableContainer">
            <div className="buyStockListAllStocksLabel">
              {showUnAvailableStocks
                ? "Unavailable Stocks"
                : "Available Stocks"}
            </div>
            <div className="buyStockListAllStocksTableToggleForUnAvailContainer">
              <div>Unavailable stocks </div>
              <div className="buyStockListAllStocksTableToggleForUnAvailToggleButton">
                <Toggle
                  width={40}
                  height={20}
                  sliderWidth={12}
                  sliderHeight={12}
                  translate={19}
                  checked={showUnAvailableStocks}
                  onChange={() => {
                    setShowUnAvailableStocks(!showUnAvailableStocks);
                    // setSelectedStock(null);
                  }}
                />
              </div>
            </div>

            <div className="buyStockListAllStocksTable">
              <BootstrapTable
                bootstrap4
                keyField="id"
                data={
                  !showUnAvailableStocks
                    ? tableData.filter((item) => item.remQuantity !== 0)
                    : tableData.filter((item) => item.remQuantity === 0)
                }
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

          {selectedStock ? (
            <div className="buyStockListAllStocksPreview">
              <div className="buyStockListAllStocksPreviewLabel">
                <div>Selected Stock</div>
                <div
                  className="buyStockPreviewInnerPanelTopDetailsRightCrossMarkContainer"
                  onClick={() => {
                    setSelectedStock(null);
                  }}
                >
                  <CrossMark />
                </div>
              </div>

              <BuyStockPreviewPanel
                {...selectedStock}
                setSelectedStock={setSelectedStock}
                setTableData={setTableData}
              />
            </div>
          ) : (
            <div className="buyStockListAllStocksEmptyPreviewMainContainer">
              <div className="buyStockListAllStocksEmptyPreviewLabel">
                Select any stock from the table for preview
              </div>
              <div className="buyStockListAllStocksEmptyPreviewimage">
                <img width="250px" height="fit-content" src={emptyPreviewBoy} />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* <div style={{ color: "white" }}>Buy stocks</div> */}
    </div>
  );
};

export default BuyStock;
