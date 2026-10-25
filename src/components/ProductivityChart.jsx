/* "Tasks completed" line chart with the Daily / Weekly toggle —
   identical config on the dashboard widget and the Analytics page. */

import { useMemo } from "react";
import ChartCanvas from "./ChartCanvas";
import { buildDailySeries, buildWeeklySeries, cssVar } from "../lib/tasks";

export function ChartRangeToggle({ range, onChange }) {
  return (
    <div className="chart-toggle">
      <button type="button" className={range === "daily" ? "is-active" : undefined} onClick={() => onChange("daily")}>Daily</button>
      <button type="button" className={range === "weekly" ? "is-active" : undefined} onClick={() => onChange("weekly")}>Weekly</button>
    </div>
  );
}

function buildOptions() {
  const textMuted = cssVar("--text-muted", "#6f6f78");
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: textMuted, font: { size: 11 } } },
      y: {
        beginAtZero: true,
        ticks: { color: textMuted, stepSize: 1, font: { size: 11 } },
        grid: { color: "rgba(255, 255, 255, 0.08)" }
      }
    }
  };
}

export default function ProductivityChart({ tasks, range }) {
  const options = useMemo(buildOptions, []);
  const data = useMemo(() => {
    const { labels, data: series } = range === "daily" ? buildDailySeries(tasks) : buildWeeklySeries(tasks);
    const lime = cssVar("--lime", "#d8f34e");
    return {
      labels,
      datasets: [{
        label: "Tasks completed",
        data: series,
        borderColor: lime,
        backgroundColor: "rgba(216, 243, 78, 0.15)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: lime,
        borderWidth: 2
      }]
    };
  }, [tasks, range]);

  return <ChartCanvas type="line" data={data} options={options} />;
}
