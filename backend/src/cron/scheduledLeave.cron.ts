import cron from "node-cron";
import { Op } from "sequelize";
import { LeaveRequest, Employee } from "../models";
import { createNotification } from "../utils/notify.util";
import fs from "fs";
import path from "path";

export function startScheduledLeaveCron() {
  let isRunning = false;

  cron.schedule("* * * * *", async () => {
    if (isRunning) {
      console.log("[CRON] Previous execution still running...");
      return;
    }

    isRunning = true;

    const now = new Date();
    const logFilePath = path.join(__dirname, "../../cron_debug.log");

    try {
      fs.appendFileSync(
        logFilePath,
        `\n[${now.toISOString()}] ================================\n`,
      );
      fs.appendFileSync(
        logFilePath,
        `[CRON] Checking scheduled leave requests...\n`,
      );

      const requests = await LeaveRequest.findAll({
        where: {
          is_scheduled: true,
          scheduled_at: {
            [Op.ne]: null,
            [Op.lte]: now,
          },
        },
      });

      if (requests.length === 0) {
        fs.appendFileSync(
          logFilePath,
          `[CRON] No scheduled leave requests found.\n`,
        );
        return;
      }

      fs.appendFileSync(
        logFilePath,
        `[CRON] Found ${requests.length} request(s).\n`,
      );

      for (const request of requests) {
        try {
          fs.appendFileSync(
            logFilePath,
            `[CRON] Processing Leave: ${request.get("id")}\n`,
          );

          const employee = await Employee.findByPk(
            request.get("employee_id") as string,
          );

          if (!employee) {
            fs.appendFileSync(logFilePath, `[CRON] Employee not found.\n`);
            continue;
          }

          // Prevent duplicate processing
          const [updatedCount] = await LeaveRequest.update(
            {
              is_scheduled: false,
              scheduled_at: null,
              status: "Pending",
              manager_status: "Pending",
              hr_status: "Pending",
            },
            {
              where: {
                id: request.get("id"),
                is_scheduled: true,
                scheduled_at: {
                  [Op.lte]: now,
                },
              },
            },
          );

          if (updatedCount === 0) {
            fs.appendFileSync(
              logFilePath,
              `[CRON] Already processed. Skipping.\n`,
            );
            continue;
          }

          const managerId = employee.get("manager_id") as string | null;

          if (!managerId) {
            fs.appendFileSync(logFilePath, `[CRON] Employee has no manager.\n`);
            continue;
          }

          const manager = await Employee.findByPk(managerId);

          if (!manager) {
            fs.appendFileSync(logFilePath, `[CRON] Manager not found.\n`);
            continue;
          }

          await createNotification(
            manager.get("user_id") as string,
            "New Leave Request",
            "An employee has submitted a scheduled leave request requiring your approval.",
            "LEAVE_REQUEST",
            "LeaveRequest",
            request.get("id") as string,
          );

          fs.appendFileSync(
            logFilePath,
            `[CRON] Notification sent to manager.\n`,
          );

          fs.appendFileSync(
            logFilePath,
            `[CRON] Leave released successfully.\n`,
          );
        } catch (err: any) {
          console.error(err);

          fs.appendFileSync(
            logFilePath,
            `[CRON] ERROR processing leave ${request.get("id")} : ${
              err.message || err
            }\n`,
          );
        }
      }
    } catch (err: any) {
      console.error("[CRON]", err);

      fs.appendFileSync(
        logFilePath,
        `[CRON] GENERAL ERROR : ${err.message || err}\n`,
      );
    } finally {
      // IMPORTANT
      isRunning = false;
    }
  });

  console.log("✅ Scheduled Leave Cron Started");
}
