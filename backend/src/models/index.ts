import sequelize from "../config/database";
import { initRoleModel } from "./role.model";
import { initPermissionModel } from "./permission.model";
import { initUserModel } from "./user.model";
import { initDepartmentModel } from "./department.model";
import { initTeamModel } from "./team.model";
import { initEmployeeModel } from "./employee.model";
import { initAttendanceModel } from "./attendance.model";
import { initAttendanceBreakModel } from "./attendanceBreak.model";
import { initLeaveTypeModel } from "./leaveType.model";
import { initLeaveBalanceModel } from "./leaveBalance.model";
import { initLeaveRequestModel } from "./leaveRequest.model";
import { initGoalModel } from "./goal.model";
import { initGoalProgressLogModel } from "./goalProgressLog.model";
import { initReviewCycleModel } from "./reviewCycle.model";
import { initReviewTemplateModel } from "./reviewTemplate.model";
import { initReviewQuestionModel } from "./reviewQuestion.model";
import { initReviewModel } from "./review.model";
import { initReviewAnswerModel } from "./reviewAnswer.model";
import { initAuditLogModel } from "./auditLog.model";
import { initNotificationModel } from "./notification.model";

const Role = initRoleModel(sequelize);
const Permission = initPermissionModel(sequelize);
const User = initUserModel(sequelize);
const Department = initDepartmentModel(sequelize);
const Team = initTeamModel(sequelize);
const Employee = initEmployeeModel(sequelize);
const Attendance = initAttendanceModel(sequelize);
const AttendanceBreak = initAttendanceBreakModel(sequelize);
const LeaveType = initLeaveTypeModel(sequelize);
const LeaveBalance = initLeaveBalanceModel(sequelize);
const LeaveRequest = initLeaveRequestModel(sequelize);
const Goal = initGoalModel(sequelize);
const GoalProgressLog = initGoalProgressLogModel(sequelize);
const ReviewCycle = initReviewCycleModel(sequelize);
const ReviewTemplate = initReviewTemplateModel(sequelize);
const ReviewQuestion = initReviewQuestionModel(sequelize);
const Review = initReviewModel(sequelize);
const ReviewAnswer = initReviewAnswerModel(sequelize);
const AuditLog = initAuditLogModel(sequelize);
const Notification = initNotificationModel(sequelize);

Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

Role.belongsToMany(Permission, {
  through: "ROLE_PERMISSIONS",
  foreignKey: "role_id",
  otherKey: "permission_id",
  timestamps: false,
});
Permission.belongsToMany(Role, {
  through: "ROLE_PERMISSIONS",
  foreignKey: "permission_id",
  otherKey: "role_id",
  timestamps: false,
});
Department.belongsTo(Employee, {
  foreignKey: "manager_id",
  as: "manager",
});

Employee.hasMany(Department, {
  foreignKey: "manager_id",
  as: "managedDepartments",
});

Department.hasMany(Team, { foreignKey: "department_id" });
Team.belongsTo(Department, { foreignKey: "department_id" });

Team.belongsTo(User, { foreignKey: "lead_id", as: "lead" });

User.hasOne(Employee, { foreignKey: "user_id" });
Employee.belongsTo(User, { foreignKey: "user_id" });

Department.hasMany(Employee, { foreignKey: "department_id" });
Employee.belongsTo(Department, { foreignKey: "department_id" });

Team.hasMany(Employee, { foreignKey: "team_id" });
Employee.belongsTo(Team, { foreignKey: "team_id" });

Employee.hasMany(Employee, { foreignKey: "manager_id", as: "directReports" });
Employee.belongsTo(Employee, { foreignKey: "manager_id", as: "manager" });

Employee.hasMany(Attendance, { foreignKey: "employee_id" });
Attendance.belongsTo(Employee, { foreignKey: "employee_id" });

Attendance.hasMany(AttendanceBreak, {
  foreignKey: "attendance_id",
  as: "breaks",
});
AttendanceBreak.belongsTo(Attendance, { foreignKey: "attendance_id" });

Employee.hasMany(LeaveBalance, { foreignKey: "employee_id" });
LeaveBalance.belongsTo(Employee, { foreignKey: "employee_id" });

LeaveType.hasMany(LeaveBalance, { foreignKey: "leave_type_id" });
LeaveBalance.belongsTo(LeaveType, { foreignKey: "leave_type_id" });

Employee.hasMany(LeaveRequest, { foreignKey: "employee_id" });
LeaveRequest.belongsTo(Employee, { foreignKey: "employee_id" });

LeaveType.hasMany(LeaveRequest, { foreignKey: "leave_type_id" });
LeaveRequest.belongsTo(LeaveType, { foreignKey: "leave_type_id" });

User.hasMany(LeaveRequest, {
  foreignKey: "manager_reviewed_by",
  as: "managerReviewedRequests",
});
LeaveRequest.belongsTo(User, {
  foreignKey: "manager_reviewed_by",
  as: "managerReviewer",
});

User.hasMany(LeaveRequest, {
  foreignKey: "hr_reviewed_by",
  as: "hrReviewedRequests",
});
LeaveRequest.belongsTo(User, {
  foreignKey: "hr_reviewed_by",
  as: "hrReviewer",
});

Employee.hasMany(Goal, { foreignKey: "employee_id" });
Goal.belongsTo(Employee, { foreignKey: "employee_id" });

User.hasMany(Goal, { foreignKey: "created_by", as: "createdGoals" });
Goal.belongsTo(User, { foreignKey: "created_by", as: "creator" });

User.hasMany(Goal, { foreignKey: "verified_by", as: "verifier" });
Goal.belongsTo(User, { foreignKey: "verified_by", as: "verifier" });

Goal.hasMany(GoalProgressLog, { foreignKey: "goal_id" });
GoalProgressLog.belongsTo(Goal, { foreignKey: "goal_id" });

User.hasMany(GoalProgressLog, { foreignKey: "updated_by" });
GoalProgressLog.belongsTo(User, { foreignKey: "updated_by", as: "updater" });

User.hasMany(ReviewCycle, { foreignKey: "created_by" });
ReviewCycle.belongsTo(User, { foreignKey: "created_by", as: "creator" });

ReviewCycle.hasMany(ReviewTemplate, { foreignKey: "review_cycle_id" });
ReviewTemplate.belongsTo(ReviewCycle, { foreignKey: "review_cycle_id" });

ReviewTemplate.hasMany(ReviewQuestion, { foreignKey: "review_template_id" });
ReviewQuestion.belongsTo(ReviewTemplate, { foreignKey: "review_template_id" });

ReviewCycle.hasMany(Review, { foreignKey: "review_cycle_id" });
Review.belongsTo(ReviewCycle, { foreignKey: "review_cycle_id" });

ReviewTemplate.hasMany(Review, { foreignKey: "review_template_id" });
Review.belongsTo(ReviewTemplate, { foreignKey: "review_template_id" });

Employee.hasMany(Review, { foreignKey: "employee_id" });
Review.belongsTo(Employee, { foreignKey: "employee_id" });

User.hasMany(Review, { foreignKey: "reviewer_id", as: "reviewsGiven" });
Review.belongsTo(User, { foreignKey: "reviewer_id", as: "reviewer" });

Review.hasMany(ReviewAnswer, { foreignKey: "review_id" });
ReviewAnswer.belongsTo(Review, { foreignKey: "review_id" });

ReviewQuestion.hasMany(ReviewAnswer, { foreignKey: "review_question_id" });
ReviewAnswer.belongsTo(ReviewQuestion, { foreignKey: "review_question_id" });

User.hasMany(AuditLog, { foreignKey: "user_id" });
AuditLog.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Notification, { foreignKey: "user_id" });
Notification.belongsTo(User, { foreignKey: "user_id" });

export {
  sequelize,
  Role,
  Permission,
  User,
  Department,
  Team,
  Employee,
  Attendance,
  AttendanceBreak,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  Goal,
  GoalProgressLog,
  ReviewCycle,
  ReviewTemplate,
  ReviewQuestion,
  Review,
  ReviewAnswer,
  AuditLog,
  Notification,
};
