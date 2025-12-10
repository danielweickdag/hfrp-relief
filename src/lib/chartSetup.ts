"use client";

// Centralized Chart.js setup to avoid registration conflicts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";

// Register Chart.js components only once
let isRegistered = false;

export function registerChartJS() {
  if (isRegistered) {
    console.log("⚠️  Chart.js already registered, skipping");
    return;
  }

  try {
    console.log("🔧 Registering Chart.js components...");
    ChartJS.register(
      CategoryScale,
      LinearScale,
      PointElement,
      LineElement,
      BarElement,
      Title,
      Tooltip,
      Legend,
      ArcElement,
      Filler,
    );
    isRegistered = true;
    console.log("✅ Chart.js components registered successfully");
  } catch (error) {
    console.error("❌ Failed to register Chart.js components:", error);
  }
}

// Auto-register on import
registerChartJS();

export { ChartJS };
export * from "react-chartjs-2";
