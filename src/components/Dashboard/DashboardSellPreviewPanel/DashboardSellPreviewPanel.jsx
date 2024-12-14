import React, { useState, useEffect } from "react";
import "./style.css";
import CrossMark from "../../SideComponents/CrossMark.jsx";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import FullOpPieChart from "../../SideComponents/FullOpPieChart.jsx";
import useStore from "../../SideComponents/ContextStore.jsx";
import notify from "../../SideComponents/Toastify.jsx";
import axios from "axios";
import useWsStore from "../../SideComponents/WebSocketStore.jsx";
import { deepClone } from "../../Utils/Utils.jsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const apiUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const generateQuantityList = (remQuantity, purchasedQuantity) => {
  var finalList = [];
  if (remQuantity > 0) {
    finalList.push({
      title: "remaining",
      value: remQuantity,
      color: "#C13C37",
      headerLabel: "Remaining",
    });
  }

  if (purchasedQuantity > 0) {
    finalList.push({
      title: "purchased",
      value: purchasedQuantity,
      color: "rgb(42, 42, 250)",
      headerLabel: "Purchased",
    });
  }

  return finalList;
};

const DashboardSellPreviewPanel = ({
  name,
  curPrice,
  percentage,
  prevPercentages,
  originalPrice,
  lowestPrice,
  highestPrice,
  remQuantity,
  setSelectedStock,
  purchasedPercentage,
  purchasedPrice,
  initialQuantity,
  purchasedQuantity,
  purchaseId,
  noOfStocks,
  stockId,
  email,
  setTableData,
}) => {
  const { store, setStore } = useStore();
  const { wsStore, setWsStore } = useWsStore();

  const [refresh, setRefresh] = useState(0);

  const [selectQuantity, setSelectQuantity] = useState(1);

  const dashboardSellApi = async () => {
    setStore({ ...deepClone(store), loadingSrc: true });

    var payload = {
      email: deepClone(store)?.userDetailsItem?.email,
      password: deepClone(store)?.userDetailsItem?.password,
      noOfStocks: selectQuantity,
      stockId: stockId,
      purchaseId: purchaseId,
    };

    let finalObj = {};
    let wsFinalObj = {};

    let res = {};

    try {
      // sell stock
      res = await axios.post(`${apiUrl}/userStocks/sellStock`, payload);

      if (res?.data?.success === false) {
        setStore({ ...deepClone(store), loadingSrc: false });
        notify(res?.data?.message, true);
        return;
      }

      res = res.data;

      // update user details like account balance
      finalObj = {
        ...deepClone(store),
        userDetailsItem: {
          ...res.userDetailsItem,
          password: deepClone(store).userDetailsItem?.password,
        },
      };

      // reload general stocks list
      var listAllStocksApiRes = await axios.get(
        `${apiUrl}/stocks/listAllStocks`
      );
      if (listAllStocksApiRes?.data?.success === false) {
        setStore({ ...deepClone(store), loadingSrc: false });
        notify(listAllStocksApiRes?.data?.message, true);
        return;
      }

      finalObj = {
        ...finalObj,
      };

      wsFinalObj = {
        listAllStocks: listAllStocksApiRes?.data,
        userCount: wsStore.userCount,
      };

      //update user purchased stocks details
      var updatedUserPurchasedList = [];

      (res.userStocksItemList || []).map((item) => {
        (listAllStocksApiRes?.data || []).map((x) => {
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

            updatedUserPurchasedList.push(item);
          }
        });
      });

      finalObj = {
        ...finalObj,
        userStocksItemList: updatedUserPurchasedList,
      };

      setTableData([...updatedUserPurchasedList]);

      //update current preview state
      var f = 1;
      (finalObj.userStocksItemList || []).map((item) => {
        if (item.purchaseId == purchaseId) {
          f = 0;
          setSelectedStock({ ...item });
        }
      });
      if (f == 1) setSelectedStock(null);

      //reload purchase history table

      payload = {
        email: deepClone(store)?.userDetailsItem?.email,
      };

      res = await axios.post(
        `${apiUrl}/history/listAllHistoryByEmail`,
        payload
      );
      if (res?.data?.success === false) {
        setStore({ ...deepClone(store), loadingSrc: false });
        notify(res?.data?.message, true);
        return;
      }

      finalObj = {
        ...finalObj,
        userStocksHistoryList: res?.data,
      };
    } catch (err) {
      console.log("In Dashboard sellStocks Preview: " + err);

      setStore({ ...deepClone(store), loadingSrc: false });
      notify("In Dashboard sellStocks: " + err, true);

      return;
    }

    setWsStore({ ...wsFinalObj });
    setStore({ ...finalObj, loadingSrc: false });
    notify("Stock sold successfully");
  };

  const [data, setData] = useState(() => {
    let arr = (prevPercentages || []).map((x) => {
      var cost = Math.floor((originalPrice * x) / 100);
      cost += originalPrice;
      return cost;
    });

    arr.pop();
    arr.push(curPrice);

    return {
      labels: ["-100 sec", "-80 sec", "-60 sec", "-40 sec", "-20 sec", "0 sec"],
      datasets: [
        {
          fill: true,
          backgroundColor: "rgba(2, 184, 68, 0.3)",
          borderColor: "rgb(176, 241, 176)",
          borderWidth: 2,
          label: "Last Few Seconds Price",
          data: arr,
          pointRadius: 1,
          pointHoverRadius: 10,
        },
      ],
    };
  });

  const generateDate = () => {
    const upDatedData = { ...data };

    const updatedPercList = [];

    (prevPercentages || []).map((x) => {
      var cost = Math.floor((originalPrice * x) / 100);
      cost += originalPrice;
      updatedPercList.push(cost);
    });

    updatedPercList.pop();
    updatedPercList.push(curPrice);

    upDatedData.datasets[0].data = updatedPercList;
    upDatedData.datasets[0].backgroundColor =
      percentage >= 0 ? "rgba(2, 184, 68, 0.3)" : "rgba(250, 158, 158, 0.3)";
    upDatedData.datasets[0].borderColor =
      percentage >= 0 ? "rgb(176, 241, 176)" : "rgba(250, 158, 158)";

    setData({ ...upDatedData });
    setRefresh(refresh + 1);
    setSelectQuantity(1);
  };

  useEffect(() => {
    generateDate();
  }, [prevPercentages, percentage]);

  const [options, setOptions] = useState({
    // responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white",
          autoSkip: false,
        },
        display: true,
        grid: {
          // color: 'white'
          display: false,
        },
      },
      y: {
        ticks: {
          color: "white",
          autoSkip: false,
        },
        display: true,
        grid: {
          color: "white",
          display: true,
        },
      },
    },
  });

  return (
    <div className="dashboardSellPreviewInnerPanelContainerSplitMainContainer">
      <div className="dashboardSellPreviewInnerPanelContainer">
        <div className="dashboardSellPreviewInnerPanelTopDetailsContainer">
          <div className="dashboardSellPreviewInnerPanelTopDetailsLeftContainer">
            <div className="dashboardSellPreviewInnerPanelTopDetailsLeftLabelContainer">
              {name}
            </div>
            <div className="dashboardSellPreviewInnerPanelTopDetailsLeftSecondaryContainer">
              <div style={{ display: "flex", gap: "5px" }}>
                <div>Bought Stocks :</div>
                <div style={{ fontWeight: "bold" }}>{noOfStocks}</div>
              </div>
            </div>
          </div>

          <div className="dashboardSellPreviewInnerPanelTopDetailsRightContainer">
            <div className="dashboardSellPreviewInnerPanelTopDetailsRightPricePercContainer">
              <div
                className={`dashboardSellPreviewInnerPanelTopDetailsRightPercContainer ${
                  percentage < 0 ? "colorTextRedPanel" : "colorTextBluePanel"
                }`}
              >
                {(percentage > 0 ? "+" : "") + percentage}%
              </div>
              <div className="dashboardSellPreviewInnerPanelTopDetailsRightPriceContainer">
                <div>{"₹"}</div>
                {curPrice}
              </div>
            </div>
          </div>
        </div>

        <div className="whiteBorderLine"></div>

        <div className="dashboardSellPreviewInnerPanelContainerMiddleLineGraphConatainer">
          <Line
            data={data}
            options={options}
            key={refresh + name + percentage}
          />
        </div>

        <div className="whiteBorderLine"></div>

        <div className="dashboardSellPreviewFooterPanelContainer">
          <div className="dashboardSellPreviewFooterPanelLeftContainer">
            <div style={{ display: "flex", gap: "2%" }}>
              {`Expected Profit per Stock : `}
              <div
                className={`${
                  curPrice - purchasedPrice < 0
                    ? "colorTextRed"
                    : "colorTextBlue"
                }`}
              >
                {Math.max(curPrice - purchasedPrice, 0)}
              </div>
              {` Rs`}
            </div>

            <div className="whiteBorderLine"></div>
            <div>{`Purchased at percentage change : ${purchasedPercentage} %`}</div>
            <div>{`Current percentage change : ${percentage} %`}</div>

            <div className="whiteBorderLine"></div>

            <div>{`Purchased at price : ${purchasedPrice} Rs`}</div>
            <div>{`Current price : ${curPrice} Rs`}</div>

            <div className="whiteBorderLine"></div>
          </div>

          <div className="dashboardSellPreviewFooterPanelLeftRightDivider"></div>

          <div className="dashboardSellPreviewFooterPanelRightContainer">
            <div className="dashboardSellPreviewFooterPanelRightSelectStockQuantityContainer">
              <div> No of stocks </div>
              <div className="dashboardSellPreviewFooterPanelRightSelectStockQuantitySelectNoContainer">
                <div
                  className="dashboardSellPreviewFooterPanelRightSelectStockQuantitySelectNoMinusBtn"
                  onClick={() => {
                    setSelectQuantity(() => {
                      var val = selectQuantity - 1;
                      if (val < 1) val = 1;
                      return val;
                    });
                  }}
                >
                  -
                </div>
                <div className="dashboardSellPreviewFooterPanelRightSelectStockQuantityDisplayField">
                  {selectQuantity}
                </div>
                <div
                  className="dashboardSellPreviewFooterPanelRightSelectStockQuantitySelectNoPlusBtn"
                  onClick={() => {
                    setSelectQuantity(() => {
                      var val = selectQuantity + 1;
                      if (val > noOfStocks) val = noOfStocks;
                      return val;
                    });
                  }}
                >
                  +
                </div>
              </div>
            </div>
            <div className="dashboardSellPreviewFooterPanelRightSelectStockQuantityContainer">
              Total profit:
              <div
                className={`${
                  curPrice - purchasedPrice < 0
                    ? "colorTextRedPanel"
                    : "colorTextBluePanel"
                } `}
              >
                <div>
                  {selectQuantity * Math.max(curPrice - purchasedPrice, 0)} Rs
                </div>
              </div>
            </div>
            <div className="dashboardSellPreviewFooterPanelRightSelectStockQuantityContainer">
              Total returns:
              <div className="dashboardSellPreviewFooterPanelRightSelectStockQuantityDisplayField">
                <div>{selectQuantity * curPrice} Rs</div>
              </div>
            </div>
            <div
              className="dashboardSellPreviewFooterPanelRightSelectStockQuantityBuyBtn"
              onClick={dashboardSellApi}
            >
              Sell
            </div>
          </div>
        </div>
      </div>
      <div className="dashboardSellPreviewInnerPanelContainerRightSideMainContainer">
        <div className="dashboardSellPreviewInnerPanelContainerRightSideMoreDetailsPanel">
          <div className="dashboardSellPreviewInnerPanelContainerRightSideMoreDetailsPanelHeaderLabel">
            More details
          </div>

          <div className="whiteBorderLine"></div>
          <div className="dashboardSellPreviewInnerPanelContainerRightSideMoreDetailsPanelBodyContainer">
            <div>{`Purchase ID : ${purchaseId}`}</div>
            <div>{`Original Price : ${originalPrice}`}</div>
            <div>{`Lowest Price : ${lowestPrice}`}</div>
            <div>{`Highest Price : ${highestPrice}`}</div>
          </div>
        </div>
        <div className="dashboardSellPreviewInnerPreviewRightSideTotalPeopleInvestedPieChart">
          <div className="dashboardSellInnerPreviewRightSideTotalPeopleInvestedPieChartHeaderLabel">
            Quantity Purchased
          </div>

          <div className="whiteBorderLine"></div>

          <div className="dashboardSellPreviewInnerPreviewRightSideTotalPeopleInvestedPieChartBodyContent">
            <div>{`Total quantity : ${initialQuantity}`}</div>
            <div>{`Purchased stocks : ${purchasedQuantity}`}</div>
            <div>{`Remaining stocks : ${remQuantity}`}</div>
          </div>

          <div className="dashboardSellPreviewInnerPreviewRightSideTotalPeopleInvestedPieChartAlignCenterContainer">
            <div className="dashboardSellPreviewInnerPreviewRightSideTotalPeopleInvestedPieChartResizeContainer">
              <FullOpPieChart
                key={
                  purchaseId + stockId + name + remQuantity + purchasedQuantity
                }
                listData={generateQuantityList(remQuantity, purchasedQuantity)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSellPreviewPanel;
