import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import sequelize from "./config/database";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

startServer();

export default app;
