import cron from "node-cron";
import { Op } from "sequelize";
import { LeaveRequest, Employee } from "../models";
import { createNotification } from "../utils/notify.util";

export function startScheduledLeaveCron() {
  cron.schedule("* * * * *", async () => {
    console.log("[CRON] Checking scheduled leave requests...");

    try {
      const requests = await LeaveRequest.findAll({
        where: {
          is_scheduled: true,
          scheduled_at: {
            [Op.lte]: new Date(),
          },
        },
      });

      if (!requests.length) {
        return;
      }

      console.log(
        `[CRON] Found ${requests.length} scheduled leave request(s).`,
      );

      for (const request of requests) {
        // Find employee manually
        const employee = await Employee.findByPk(
          request.get("employee_id") as string,
        );

        if (!employee) {
          console.warn(
            `[CRON] Employee not found for leave ${request.get("id")}`,
          );
          continue;
        }

        // Release scheduled request
        await request.update({
          is_scheduled: false,
          scheduled_at: null,
        });

        // Notify manager
        if (employee.get("manager_id")) {
          const manager = await Employee.findByPk(
            employee.get("manager_id") as string,
          );

          if (manager) {
            await createNotification(
              manager.get("user_id") as string,
              "New Leave Request",
              "An employee has submitted a scheduled leave request requiring your approval.",
              "LEAVE_REQUEST",
              "LeaveRequest",
              request.get("id") as string,
            );
          }
        }

        console.log(
          `[CRON] Released scheduled leave request ${request.get("id")}`,
        );
      }
    } catch (error) {
      console.error("[CRON] Scheduled Leave Error:", error);
    }
  });

  console.log("✅ Scheduled Leave Cron Started");
}
