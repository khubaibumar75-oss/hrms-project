import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import sequelize from "./config/database";

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Unable to connect to database:", error);
  }
}

startServer();

export default app;
