/* Thin Chart.js wrapper. The chart is created once (so colors read
   from CSS variables at creation time, as before) and later data
   changes are applied with chart.update(). Passing data={null}
   leaves the canvas blank, matching the original "no data" case. */

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function ChartCanvas({ type, data, options }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const chart = chartRef.current;
    if (!data) {
      if (chart) { chart.destroy(); chartRef.current = null; }
      return;
    }
    if (chart) {
      chart.data.labels = data.labels;
      data.datasets.forEach((ds, i) => {
        if (chart.data.datasets[i]) chart.data.datasets[i].data = ds.data;
      });
      chart.update();
      return;
    }
    chartRef.current = new Chart(canvasRef.current.getContext("2d"), {
      type,
      data: { labels: data.labels, datasets: data.datasets.map(ds => ({ ...ds })) },
      options: optionsRef.current
    });
  }, [type, data]);

  useEffect(() => () => {
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = null;
  }, []);

  return <canvas ref={canvasRef}></canvas>;
}
