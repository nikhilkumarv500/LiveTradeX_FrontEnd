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

const generatePeopleInvestedList = (userCount, totalInvestedUserCnt) => {
  var finList = [];

  if (Math.max((userCount || 0) - totalInvestedUserCnt, 0) > 0) {
    finList.push({
      title: "notInvested",
      value: Math.max((userCount || 0) - totalInvestedUserCnt, 0),
      color: "#C13C37",
      headerLabel: "Remaining",
    });
  }

  if (totalInvestedUserCnt > 0) {
    finList.push({
      title: "invested",
      value: totalInvestedUserCnt,
      color: "rgb(42, 42, 250)",
      headerLabel: "Invested",
    });
  }

  return finList;
};

const BuyStockPreviewPanel = ({
  id,
  name,
  curPrice,
  percentage,
  prevPercentages,
  originalPrice,
  lowestPrice,
  highestPrice,
  remQuantity,
  setSelectedStock,
  initialQuantity,
  purchasedQuantity,
  totalInvestedUserCnt,
  setTableData,
}) => {
  const { store, setStore } = useStore();
  const { wsStore, setWsStore } = useWsStore();

  const [refresh, setRefresh] = useState(0);

  const [selectQuantity, setSelectQuantity] = useState(1);

  const purchaseStocksApi = async () => {
    setStore({ ...deepClone(store), loadingSrc: true });

    let payload = {
      email: deepClone(store)?.userDetailsItem?.email,
      password: deepClone(store)?.userDetailsItem?.password,
      noOfStocks: selectQuantity,
      stockId: id,
    };

    let finalObj = {};
    let wsFinalObj = {};

    let res = {};
    try {
      // purchase stock
      res = await axios.post(`${apiUrl}/userStocks/buyStock`, payload);

      if (res?.data?.success === false) {
        setStore({ ...deepClone(store), loadingSrc: false });
        notify(res?.data?.message, true);
        return;
      }

      finalObj = {
        ...deepClone(store),
      };

      // reload bought stock List for a email

      payload = {
        email: deepClone(store)?.userDetailsItem?.email,
      };

      res = await axios.post(
        `${apiUrl}/userStocks/listAllPurchasedStocksByEmail`,
        payload
      );
      if (res?.data?.success === false) {
        setStore({ ...deepClone(store), loadingSrc: false });
        notify(res?.data?.message, true);
        return;
      }

      finalObj = {
        ...finalObj,
        userStocksItemList: res?.data,
      };

      // reload general stocks list &&& curent stock preview data

      res = await axios.get(`${apiUrl}/stocks/listAllStocks`);
      if (res?.data?.success === false) {
        setStore({ ...deepClone(store), loadingSrc: false });
        notify(res?.data?.message, true);
        return;
      }

      (res?.data || []).map((item) => {
        if (item.id == id) {
          setSelectedStock({ ...item });
        }
      });

      finalObj = {
        ...finalObj,
      };

      wsFinalObj = {
        listAllStocks: res?.data,
        userCount: wsStore.userCount,
      };
      setTableData([...res?.data]);

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

      //reload user details like account balance, investedAmount

      payload = {
        email: deepClone(store)?.userDetailsItem?.email,
        password: deepClone(store)?.userDetailsItem?.password,
      };

      res = await axios.post(`${apiUrl}/auth/specificUserDetails`, payload);
      if (res?.data?.success === false) {
        setStore({ ...deepClone(store), loadingSrc: false });
        notify(res?.data?.message, true);
        return;
      }

      res = res.data;

      finalObj = {
        ...finalObj,
        userDetailsItem: {
          ...res,
          password: finalObj?.userDetailsItem?.password,
        },
      };
    } catch (err) {
      console.log("in BuyStocks Preview: " + err);

      setStore({ ...deepClone(store), loadingSrc: false });
      notify("in BuyStocks Preview: " + err, true);

      return;
    }

    setStore({ ...finalObj, loadingSrc: false });
    setWsStore({ ...wsFinalObj });
    notify("Stock purchased successfully");
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
    // setRefresh(refresh + 1);
    setSelectQuantity(1);
  };

  useEffect(() => {
    generateDate();
  }, [prevPercentages, percentage]);

  const [options, setOptions] = useState({
    responsive: true,
    animation: false,
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
    <div className="buyStockPreviewInnerPanelParentSplitMainContainer">
      <div className="buyStockPreviewInnerPanelContainer">
        <div className="buyStockPreviewInnerPanelTopDetailsContainer">
          <div className="buyStockPreviewInnerPanelTopDetailsLeftContainer">
            <div className="buyStockPreviewInnerPanelTopDetailsLeftLabelContainer">
              {name}
            </div>
            <div className="buyStockPreviewInnerPanelTopDetailsLeftSecondaryContainer">
              <div style={{ display: "flex", gap: "5px", fontSize: "15px" }}>
                <div>Available Stocks :</div>
                <div style={{ fontWeight: "bold" }}>{remQuantity}</div>
              </div>
            </div>
          </div>

          <div className="buyStockPreviewInnerPanelTopDetailsRightContainer">
            <div className="buyStockPreviewInnerPanelTopDetailsRightPricePercContainer">
              <div
                className={`buyStockPreviewInnerPanelTopDetailsRightPercContainer ${
                  percentage < 0 ? "colorTextRedPanel" : "colorTextBluePanel"
                }`}
              >
                {(percentage > 0 ? "+" : "") + percentage}%
              </div>
              <div className="buyStockPreviewInnerPanelTopDetailsRightPriceContainer">
                <div>{"₹"}</div>
                {curPrice}
              </div>
            </div>
          </div>
        </div>

        <div className="whiteBorderLine"></div>

        <div className="buyStockPreviewInnerPanelContainerMiddleLineGraphConatainer">
          <Line
            data={data}
            options={options}
            key={refresh + name + percentage}
          />
        </div>

        <div className="whiteBorderLine"></div>

        <div className="buyStockPreviewFooterPanelContainer">
          <div className="buyStockPreviewFooterPanelLeftContainer">
            <div>Original Price : {originalPrice}</div>
            <div>Lowest Price : {lowestPrice}</div>
            <div>Highest Price : {highestPrice}</div>
          </div>

          <div className="dashboardSellPreviewFooterPanelLeftRightDivider"></div>

          <div className="buyStockPreviewFooterPanelRightContainer">
            <div className="buyStockPreviewFooterPanelRightSelectStockQuantityContainer">
              <div> No of stocks </div>
              <div className="buyStockPreviewFooterPanelRightSelectStockQuantitySelectNoContainer">
                <div
                  className="buyStockPreviewFooterPanelRightSelectStockQuantitySelectNoMinusBtn"
                  onClick={() => {
                    setSelectQuantity(() => {
                      var val = selectQuantity - 1;
                      if (val < 1) val = 1;
                      return val;
                    });
                  }}
                >
                  {" "}
                  -{" "}
                </div>
                <div className="buyStockPreviewFooterPanelRightSelectStockQuantityDisplayField">
                  {" "}
                  {selectQuantity}{" "}
                </div>
                <div
                  className="buyStockPreviewFooterPanelRightSelectStockQuantitySelectNoPlusBtn"
                  onClick={() => {
                    setSelectQuantity(() => {
                      var val = selectQuantity + 1;
                      if (val > remQuantity) val = remQuantity;
                      return val;
                    });
                  }}
                >
                  +
                </div>
              </div>
            </div>
            <div className="buyStockPreviewFooterPanelRightTotalAmountContainer">
              <div className="buyStockPreviewFooterPanelRightTotalAmountLabel">
                Total amount:
              </div>
              <div className="buyStockPreviewFooterPanelRightTotalAmountDisplayValue">{`${
                selectQuantity * curPrice
              } Rs`}</div>
            </div>
            <div
              className="buyStockPreviewFooterPanelRightSelectStockQuantityBuyBtn"
              onClick={purchaseStocksApi}
            >
              Buy
            </div>
          </div>
        </div>
      </div>

      <div className="buyStockInnerPreviewRightSidePieChartOuterContainer">
        <div className="buyStockInnerPreviewRightSideTotalPeopleInvestedPieChart">
          <div className="buyStockInnerPreviewRightSideTotalPeopleInvestedPieChartHeaderLabel">
            Quantity Purchased
          </div>

          <div className="whiteBorderLine"></div>

          <div className="buyStockInnerPreviewRightSideTotalPeopleInvestedPieChartBodyContent">
            <div>{`Total quantity : ${initialQuantity}`}</div>
            <div>{`Purchased stocks : ${purchasedQuantity}`}</div>
            <div>{`Remaining stocks : ${remQuantity}`}</div>
          </div>

          <div className="buyStockInnerPreviewRightSideTotalPeopleInvestedPieChartAlignCenterContainer">
            <div className="buyStockInnerPreviewRightSideTotalPeopleInvestedPieChartResizeContainer">
              <FullOpPieChart
                key={id + name + purchasedQuantity + remQuantity}
                listData={generateQuantityList(remQuantity, purchasedQuantity)}
              />
            </div>
          </div>
        </div>

        <div className="buyStockInnerPreviewRightSideTotalPeopleInvestedPieChart">
          <div className="buyStockInnerPreviewRightSideTotalPeopleInvestedPieChartHeaderLabel">
            People invested
          </div>

          <div className="whiteBorderLine"></div>

          <div className="buyStockInnerPreviewRightSideTotalPeopleInvestedPieChartBodyContent">
            <div>{`Total users : ${deepClone(wsStore)?.userCount || 0}`}</div>
            <div>{`Invested users : ${totalInvestedUserCnt}`}</div>
          </div>

          <div className="buyStockInnerPreviewRightSideTotalPeopleInvestedPieChartAlignCenterContainer">
            <div className="buyStockInnerPreviewRightSideTotalPeopleInvestedPieChartResizeContainer">
              <FullOpPieChart
                key={id + name + remQuantity + purchasedQuantity}
                listData={generatePeopleInvestedList(
                  deepClone(wsStore)?.userCount,
                  totalInvestedUserCnt
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyStockPreviewPanel;
