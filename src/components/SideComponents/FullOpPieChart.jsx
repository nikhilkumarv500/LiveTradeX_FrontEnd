import React, { useState } from "react";
// import { PieChart, pieChartDefaultProps, PieChartProps } from '../../src';
import { PieChart } from "react-minimal-pie-chart";

function FullOpPieChart({ listData }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);

  const [segmentData, setSegmentData] = useState(listData);

  const data = segmentData.map((entry, i) => {
    if (hovered === i) {
      return {
        ...entry,
        color: "grey",
      };
    }
    return entry;
  });

  const lineWidth = 60;

  return (
    <PieChart
      style={{
        fontFamily:
          '"Nunito Sans", -apple-system, Helvetica, Arial, sans-serif',
        fontSize: "5px",
        overflow: "visible",
      }}
      data={data}
      radius={50 - 6}
      lineWidth={60}
      segmentsStyle={{ transition: "0", cursor: "pointer" }}
      segmentsShift={(index) => (index === selected ? 6 : 1)}
      // animate
      labelPosition={100 - lineWidth / 2}
      onClick={(_, index) => {
        setSelected(index === selected ? null : index);
      }}
      onMouseOver={(_, index) => {
        setHovered(index);
      }}
      onMouseOut={() => {
        setHovered(undefined);
      }}
      label={({ x, y, dx, dy, dataEntry }) => {
        const headerLabel = dataEntry.headerLabel || "";
        const maxLineLength = 10;
        const lines =
          headerLabel.match(new RegExp(`.{1,${maxLineLength}}`, "g")) || [];

        return (
          <text
            x={x}
            y={y}
            dx={dx}
            dy={dy}
            dominant-baseline="central"
            text-anchor="middle"
            color="orange"
            style={{
              fontSize: "10px",
              fontFamily: "sans-serif",
              filter: "drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7))",
            }}
            fill="white"
          >
            {lines.map((line, index) => (
              <tspan key={index} x={x} y={y} dy={dy}>
                {line}
              </tspan>
            ))}
            <tspan x={x} y={y} dy={dy + 10}>
              {Math.round(dataEntry.percentage) + "%"}
            </tspan>
          </text>
        );
      }}
      labelStyle={{
        fontSize: "4px",
        fontFamily: "sans-serif",
      }}
    />
  );
}

export default FullOpPieChart;
