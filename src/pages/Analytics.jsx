/* ANALYTICS (analytics.html + js/analytics.js): stat row plus three
   Chart.js charts — productivity over time, by subject, by status. */

import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { AlarmClockOff, CheckCircle2, Hourglass, ListChecks, TrendingUp } from "lucide-react";
import CadenceDB from "../lib/storage";
import { cssVar, isOverdue } from "../lib/tasks";
import { selectTasks, selectTaskStats } from "../store/tasksSlice";
import { useDocumentTitle } from "../hooks/usePageSetup";
import ChartCanvas from "../components/ChartCanvas";
import ProductivityChart, { ChartRangeToggle } from "../components/ProductivityChart";
import StatTile from "../components/StatTile";

function SubjectChart({ tasks }) {
  const options = useMemo(() => {
    const textMuted = cssVar("--text-muted", "#6f6f78");
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: textMuted, font: { size: 10.5 } } },
        y: { beginAtZero: true, ticks: { color: textMuted, stepSize: 1, font: { size: 11 } }, grid: { color: "rgba(255,255,255,0.08)" } }
      }
    };
  }, []);

  const data = useMemo(() => {
    const counts = {};
    tasks.forEach(t => { counts[t.subject] = (counts[t.subject] || 0) + 1; });
    const labels = Object.keys(counts);
    if (labels.length === 0) return null;
    return {
      labels,
      datasets: [{ data: Object.values(counts), backgroundColor: cssVar("--purple", "#7c6ffa"), borderRadius: 6, maxBarThickness: 28 }]
    };
  }, [tasks]);

  return <ChartCanvas type="bar" data={data} options={options} />;
}

function StatusChart({ tasks }) {
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: cssVar("--text-secondary", "#a6a6b0"), boxWidth: 10, font: { size: 11 }, padding: 14 }
      }
    }
  }), []);

  const data = useMemo(() => {
    if (tasks.length === 0) return null;
    const today = CadenceDB.todayKey();
    const completed = tasks.filter(t => t.status === "completed").length;
    const overdue = tasks.filter(t => isOverdue(t, today)).length;
    const inProgress = tasks.filter(t => t.status === "in-progress" && !(t.dueDate && t.dueDate < today)).length;
    const pending = tasks.filter(t => t.status === "pending" && !(t.dueDate && t.dueDate < today)).length;
    return {
      labels: ["Completed", "In progress", "Pending", "Overdue"],
      datasets: [{
        data: [completed, inProgress, pending, overdue],
        backgroundColor: [cssVar("--lime", "#d8f34e"), cssVar("--purple", "#7c6ffa"), "#38bdf8", cssVar("--orange", "#ff7a45")],
        borderColor: "transparent",
        borderRadius: 4
      }]
    };
  }, [tasks]);

  return <ChartCanvas type="doughnut" data={data} options={options} />;
}

export default function Analytics() {
  useDocumentTitle("Analytics — Cadence");
  const tasks = useSelector(selectTasks);
  const stats = useSelector(selectTaskStats);
  const [chartRange, setChartRange] = useState("daily");
  const overdue = tasks.filter(t => isOverdue(t)).length;

  return (
    <>
      <h1 className="dashboard-title">Analytics</h1>

      {/* Stat row */}
      <div className="stats-grid" style={{ marginTop: 0, marginBottom: "24px" }}>
        <StatTile Icon={ListChecks} value={stats.total} label="Total tasks" />
        <StatTile Icon={CheckCircle2} value={stats.completed} label="Completed" />
        <StatTile Icon={Hourglass} value={stats.pending} label="Pending" />
        <StatTile Icon={AlarmClockOff} value={overdue} label="Overdue" />
        <StatTile Icon={TrendingUp} value={`${stats.completionPercentage}%`} label="Completion rate" />
      </div>

      {/* Productivity over time */}
      <div className="widget widget-chart" style={{ marginBottom: "24px" }}>
        <div className="widget-head">
          <h3>Productivity Over Time</h3>
          <ChartRangeToggle range={chartRange} onChange={setChartRange} />
        </div>
        <div className="chart-canvas-wrap tall">
          <ProductivityChart tasks={tasks} range={chartRange} />
        </div>
      </div>

      {/* Breakdown charts */}
      <div className="profile-grid">
        <div className="widget">
          <div className="widget-head"><h3>Tasks by Subject</h3></div>
          <div className="chart-canvas-wrap short">
            <SubjectChart tasks={tasks} />
          </div>
        </div>
        <div className="widget">
          <div className="widget-head"><h3>Tasks by Status</h3></div>
          <div className="chart-canvas-wrap short">
            <StatusChart tasks={tasks} />
          </div>
        </div>
      </div>
    </>
  );
}
