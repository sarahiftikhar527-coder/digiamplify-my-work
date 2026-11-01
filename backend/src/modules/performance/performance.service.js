
import Task from "../../models/Task.js";

const COMPLETED_STATUSES = ["approved", "completed"];

function getPeriod(range) {
  const now = new Date();
  let start;
  let end;

  if (range === "week") {
    start = new Date(now);
    const day = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - day);
    start.setHours(0, 0, 0, 0);

    end = new Date(start);
    end.setDate(end.getDate() + 7);
  } else if (range === "year") {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear() + 1, 0, 1);
  } else {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  return { start, end };
}

function getBuckets(range, start) {
  if (range === "week") {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      return {
        x: index + 1,
        label: date.toLocaleDateString("en-US", {
          weekday: "short",
        }),
        total: 0,
        completed: 0,
      };
    });
  }

  if (range === "year") {
    return Array.from({ length: 12 }, (_, index) => ({
      x: index + 1,
      label: new Date(start.getFullYear(), index, 1)
        .toLocaleDateString("en-US", { month: "short" }),
      total: 0,
      completed: 0,
    }));
  }

  const daysInMonth = new Date(
    start.getFullYear(),
    start.getMonth() + 1,
    0
  ).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => ({
    x: index + 1,
    label: String(index + 1),
    total: 0,
    completed: 0,
  }));
}

export async function getEmployeePerformance(employeeId, range = "month") {
  const normalizedRange = String(range).toLowerCase();

  if (!["week", "month", "year"].includes(normalizedRange)) {
    const error = new Error("Range must be week, month or year.");
    error.statusCode = 400;
    throw error;
  }

  const { start, end } = getPeriod(normalizedRange);

  const tasks = await Task.find({
    assignedTo: employeeId,
    dueDate: { $gte: start, $lt: end },
  })
    .select("status dueDate completedAt")
    .lean();

  const buckets = getBuckets(normalizedRange, start);

  for (const task of tasks) {
    const dueDate = new Date(task.dueDate);
    let bucketIndex;

    if (normalizedRange === "week") {
      const day = (dueDate.getDay() + 6) % 7;
      bucketIndex = day;
    } else if (normalizedRange === "year") {
      bucketIndex = dueDate.getMonth();
    } else {
      bucketIndex = dueDate.getDate() - 1;
    }

    const bucket = buckets[bucketIndex];

    if (!bucket) continue;

    bucket.total += 1;

    if (COMPLETED_STATUSES.includes(task.status)) {
      bucket.completed += 1;
    }
  }

  const total = tasks.length;
  const completed = tasks.filter((task) =>
    COMPLETED_STATUSES.includes(task.status)
  ).length;

  const overall = total
    ? Math.round((completed / total) * 100)
    : 0;

  const series = buckets.map((bucket) => ({
    x: bucket.x,
    value: bucket.total
      ? Math.round((bucket.completed / bucket.total) * 100)
      : 0,
    label: bucket.label,
  }));

  const xTicks =
    normalizedRange === "week"
      ? buckets.map(({ x, label }) => ({ x, label }))
      : normalizedRange === "year"
        ? buckets.map(({ x, label }) => ({ x, label }))
        : buckets
            .filter(
              (bucket) =>
                bucket.x === 1 ||
                bucket.x % 5 === 0 ||
                bucket.x === buckets.length
            )
            .map(({ x, label }) => ({ x, label }));

  let feedback = "No tasks assigned for this period";

  if (total > 0) {
    if (overall >= 90) feedback = "Excellent";
    else if (overall >= 75) feedback = "Good";
    else if (overall >= 50) feedback = "Needs improvement";
    else feedback = "Below target";
  }

  return {
    overall,
    series,
    xTicks,
    goals: completed,
    kpi: `${overall}%`,
    feedback,
  };
}
