import React, { useState, useEffect } from "react";
import "./style.css";

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

const BuyStockTopHitPanel = ({
  name,
  curPrice,
  percentage,
  prevPercentages,
  originalPrice,
  remQuantity,
  setSelectedStock,
  previewMode,
}) => {
  const [refresh, setRefresh] = useState(1);

  const [data, setData] = useState({
    labels: ["-25s", "-20s", "-15s", "-10s", "-5s", "0s"],
    datasets: [
      {
        fill: true,
        backgroundColor:
          percentage >= 0
            ? "rgba(2, 184, 68, 0.3)"
            : "rgba(250, 158, 158, 0.3)",
        borderColor:
          percentage >= 0 ? "rgb(176, 241, 176)" : "rgba(250, 158, 158)",
        borderWidth: 1,
        label: "",
        data: (prevPercentages || []).map((x) => {
          var cost = (originalPrice * x) / 100;
          cost += originalPrice;
          return cost;
        }),
        pointRadius: 1,
        pointHoverRadius: 5,
        // tension: 0.4,
      },
    ],
  });

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
        // ticks: {
        //   color: 'white',
        //   autoSkip: false
        // },
        display: false,
        grid: {
          // color: 'white'
          display: false,
        },
      },
      y: {
        // ticks: {
        //   color: 'white',
        //   autoSkip: false
        // },
        display: false,
        grid: {
          // color: 'white'
          display: false,
        },
      },
    },
  });

  const generateDate = () => {
    const upDatedData = { ...data };

    const updatedPercList = [];

    (prevPercentages || []).map((x) => {
      var cost = (originalPrice * x) / 100;
      cost += originalPrice;
      updatedPercList.push(cost);
    });

    upDatedData.datasets[0].data = updatedPercList;
    upDatedData.datasets[0].backgroundColor =
      percentage >= 0 ? "rgba(2, 184, 68, 0.3)" : "rgba(250, 158, 158, 0.3)";
    upDatedData.datasets[0].borderColor =
      percentage >= 0 ? "rgb(176, 241, 176)" : "rgba(250, 158, 158)";

    setData({ ...upDatedData });
    // setRefresh(refresh + 1);
  };

  useEffect(() => {
    generateDate();
  }, [prevPercentages, percentage]);

  return (
    <div className="topHitPanelContainer">
      <div className="topHitPanelDetailsContainer">
        <div className="topHitPanelDetailsContainerLabel">{name}</div>
        <div className="topHitPanelTopLevelDataPricePercContainer">
          <div className="topHitPanelTopLevelDataPriceContainer">
            {"₹ "}
            {curPrice}
          </div>
          <div
            className={`topHitPanelTopLevelDataPercContainer ${
              percentage < 0
                ? "colorTextRedTopLevelDataPerc"
                : "colorTextBlueTopLevelDataPerc"
            } `}
          >
            {percentage >= 0 ? "+" + percentage : percentage}%
          </div>
        </div>
      </div>

      <div className="topHitPanelLineGraph">
        <Line data={data} options={options} key={refresh + name + percentage} />
      </div>
    </div>
  );
};

export default BuyStockTopHitPanel;
