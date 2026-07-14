import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import sequelize from "./config/database";
import { startCronJobs } from "./cron/scheduler";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    startCronJobs();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to database:", error);
  }
}

startServer();
