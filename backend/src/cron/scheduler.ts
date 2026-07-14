import { startScheduledLeaveCron } from "./scheduledLeave.cron";

export function startCronJobs() {
  console.log("🚀 Starting Cron Jobs...");

  startScheduledLeaveCron();

  console.log("✅ All Cron Jobs Started");
}
