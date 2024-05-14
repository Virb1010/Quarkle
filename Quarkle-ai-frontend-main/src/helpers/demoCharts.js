import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const data = [
  {
    labels: ["ChatGPT Plus", "Quarkle Pro"],
    datasets: [
      {
        data: [6, 29],
        backgroundColor: ["#4B5563", "#af145f"],
        borderColor: ["#4B5563", "#8d0b4c"],
        borderWidth: 1,
      },
    ],
  },
  {
    labels: ["ChatGPT Plus", "Quarkle Pro"],
    datasets: [
      {
        data: [11, 24],
        backgroundColor: ["#4B5563", "#af145f"],
        borderColor: ["#4B5563", "#8d0b4c"],
        borderWidth: 1,
      },
    ],
  },
  {
    labels: ["ChatGPT Plus", "Quarkle Pro"],
    datasets: [
      {
        data: [15, 20],
        backgroundColor: ["#4B5563", "#af145f"],
        borderColor: ["#4B5563", "#8d0b4c"],
        borderWidth: 1,
      },
    ],
  },
];

const data_light = [
  {
    labels: ["ChatGPT Plus", "Quarkle Pro"],
    datasets: [
      {
        data: [6, 29],
        backgroundColor: ["#4B5563", "#c6c5ed"],
        borderColor: ["#4B5563", "#8d0b4c"],
        borderWidth: 1,
      },
    ],
  },
  {
    labels: ["ChatGPT Plus", "Quarkle Pro"],
    datasets: [
      {
        data: [11, 24],
        backgroundColor: ["#4B5563", "#c6c5ed"],
        borderColor: ["#4B5563", "#8d0b4c"],
        borderWidth: 1,
      },
    ],
  },
  {
    labels: ["ChatGPT Plus", "Quarkle Pro"],
    datasets: [
      {
        data: [15, 20],
        backgroundColor: ["#4B5563", "#c6c5ed"],
        borderColor: ["#4B5563", "#8d0b4c"],
        borderWidth: 1,
      },
    ],
  },
];

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "white",
      },
    },
    title: {
      display: true,
      text: "User Preference for the Response Above",
      color: "white",
      font: {
        size: 20,
      },
    },
  },
};

const options_light = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "black",
      },
    },
    title: {
      display: true,
      text: "User Preference for the Response Above",
      color: "black",
      font: {
        size: 20,
      },
    },
  },
};

const ShadowedPieChart = ({ chatNumber, isLightMode }) => (
  // <div style={{ width: "400px", height: "400px", backgroundColor: "transparent" }}>
  <div className="h-[20rem] w-[20rem] bg-transparent">
    <Pie data={isLightMode ? data_light[chatNumber - 1] : data[chatNumber - 1]} options={isLightMode ? options_light : options} />
  </div>
);

export default ShadowedPieChart;
