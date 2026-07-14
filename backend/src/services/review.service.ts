import {
  ReviewCycle,
  ReviewTemplate,
  ReviewQuestion,
  Review,
  ReviewAnswer,
  Employee,
  User,
  Role,
  sequelize,
} from "../models";

export async function getReviewCycles(userId: string) {
  const user = await User.findByPk(userId, { include: [Role] });
  const roleName = ((user?.get("Role") as any)?.name || "").toLowerCase();
  const isAdminOrHr = roleName === "super admin" || roleName === "hr manager";

  if (isAdminOrHr) {
    return ReviewCycle.findAll({
      include: [{ model: ReviewTemplate }],
      order: [["created_at", "DESC"]],
    });
  }

  const employee = await Employee.findOne({ where: { user_id: userId } });
  if (!employee) {
    throw { status: 404, message: "Employee profile not found" };
  }

  return ReviewCycle.findAll({
    include: [
      { model: ReviewTemplate },
      {
        model: Review,
        where: { employee_id: employee.get("id") },
        required: true,
      },
    ],
    order: [["created_at", "DESC"]],
  });
}

export async function createReviewCycle(
  createdBy: string,
  name: string,
  startDate: string,
  endDate: string,
) {
  const cycle = await ReviewCycle.create({
    name,
    start_date: startDate,
    end_date: endDate,
    status: "Draft",
    created_by: createdBy,
  });

  return cycle;
}

export async function createReviewTemplate(
  reviewCycleId: string,
  name: string,
  description: string,
  questions: { questionText: string; weight: number }[],
) {
  if (!questions || questions.length === 0) {
    throw { status: 400, message: "At least one question is required" };
  }

  const cycle = await ReviewCycle.findByPk(reviewCycleId);
  if (!cycle) {
    throw { status: 404, message: "Review cycle not found" };
  }

  const result = await sequelize.transaction(async (t) => {
    const template = await ReviewTemplate.create(
      {
        review_cycle_id: reviewCycleId,
        name,
        description,
      },
      { transaction: t },
    );

    const createdQuestions = await ReviewQuestion.bulkCreate(
      questions.map((q) => ({
        review_template_id: template.get("id"),
        question_text: q.questionText,
        weight: q.weight,
      })),
      { transaction: t },
    );

    return { template, questions: createdQuestions };
  });

  return result;
}

export async function launchReviewCycle(
  reviewCycleId: string,
  reviewTemplateId: string,
) {
  const cycle = await ReviewCycle.findByPk(reviewCycleId);
  if (!cycle) {
    throw { status: 404, message: "Review cycle not found" };
  }

  if (cycle.get("status") !== "Draft") {
    throw { status: 400, message: "Only draft cycles can be launched" };
  }

  const template = await ReviewTemplate.findByPk(reviewTemplateId);
  if (!template || template.get("review_cycle_id") !== reviewCycleId) {
    throw { status: 404, message: "Template not found for this cycle" };
  }

  const employees = await Employee.findAll({ where: { status: "Active" } });

  const reviewsToCreate: any[] = [];

  for (const employee of employees) {
    const employeeId = employee.get("id") as string;
    const userId = employee.get("user_id") as string;
    const managerId = employee.get("manager_id") as string | null;

    reviewsToCreate.push({
      review_cycle_id: reviewCycleId,
      review_template_id: reviewTemplateId,
      employee_id: employeeId,
      reviewer_id: userId,
      review_type: "Self",
      status: "Pending",
    });
    if (managerId) {
      const manager = await Employee.findByPk(managerId);
      if (manager) {
        reviewsToCreate.push({
          review_cycle_id: reviewCycleId,
          review_template_id: reviewTemplateId,
          employee_id: employeeId,
          reviewer_id: manager.get("user_id"),
          review_type: "Manager",
          status: "Pending",
        });
      }
    }
  }

  for (const employee of employees) {
    const employeeId = employee.get("id") as string;
    const teamId = employee.get("team_id") as string | null;

    if (!teamId) continue;

    const peers = employees.filter(
      (e) => e.get("team_id") === teamId && e.get("id") !== employeeId,
    );

    if (peers.length === 0) continue;

    const randomPeer = peers[Math.floor(Math.random() * peers.length)];

    reviewsToCreate.push({
      review_cycle_id: reviewCycleId,
      review_template_id: reviewTemplateId,
      employee_id: employeeId,
      reviewer_id: randomPeer.get("user_id"),
      review_type: "Peer",
      status: "Pending",
    });
  }

  await Review.bulkCreate(reviewsToCreate, { ignoreDuplicates: true });
  await cycle.update({ status: "Active" });

  return { cycle, reviewsCreated: reviewsToCreate.length };
}

export async function submitReview(
  reviewerId: string,
  reviewId: string,
  answers: { questionId: string; rating: number; answerText?: string }[],
) {
  const review = await Review.findByPk(reviewId);

  if (!review) {
    throw { status: 404, message: "Review not found" };
  }

  if (review.get("reviewer_id") !== reviewerId) {
    throw { status: 403, message: "You are not the reviewer for this review" };
  }

  if (review.get("status") === "Submitted") {
    throw { status: 400, message: "This review has already been submitted" };
  }

  for (const a of answers) {
    if (a.rating < 1 || a.rating > 5) {
      throw { status: 400, message: "Ratings must be between 1 and 5" };
    }
  }

  const questions = await ReviewQuestion.findAll({
    where: { review_template_id: review.get("review_template_id") },
  });

  const weightMap = new Map(
    questions.map((q) => [q.get("id") as string, Number(q.get("weight"))]),
  );

  const result = await sequelize.transaction(async (t) => {
    await ReviewAnswer.bulkCreate(
      answers.map((a) => ({
        review_id: reviewId,
        review_question_id: a.questionId,
        rating: a.rating,
        answer_text: a.answerText || null,
      })),
      { transaction: t },
    );

    let weightedSum = 0;
    let totalWeight = 0;

    for (const a of answers) {
      const weight = weightMap.get(a.questionId) || 0;
      weightedSum += a.rating * weight;
      totalWeight += weight;
    }

    const score = totalWeight > 0 ? weightedSum / totalWeight : 0;

    await review.update(
      {
        status: "Submitted",
        score: score.toFixed(2),
        submitted_at: new Date(),
      },
      { transaction: t },
    );

    return review;
  });

  return result;
}

export async function getOverallScore(
  employeeId: string,
  reviewCycleId: string,
) {
  const reviews = await Review.findAll({
    where: {
      employee_id: employeeId,
      review_cycle_id: reviewCycleId,
      status: "Submitted",
    },
  });

  if (reviews.length === 0) {
    throw {
      status: 404,
      message: "No submitted reviews found for this employee in this cycle",
    };
  }

  const scores = reviews.map((r) => ({
    type: r.get("review_type"),
    score: Number(r.get("score")),
  }));

  const overallScore =
    scores.reduce((sum, s) => sum + s.score, 0) / scores.length;

  return {
    breakdown: scores,
    overallScore: Number(overallScore.toFixed(2)),
    reviewsCounted: scores.length,
  };
}

export async function getMyReviews(userId: string, cycleId: string) {
  const reviews = await Review.findAll({
    where: {
      reviewer_id: userId,
      review_cycle_id: cycleId,
    },
    include: [
      {
        model: ReviewTemplate,
      },
      {
        model: Employee,
      },
    ],
  });

  return reviews;
}
