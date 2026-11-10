import * as XLSX from "xlsx-js-style";

const BORDER = { style: "thin", color: { rgb: "D9D9D9" } };
const ALL_BORDERS = {
  top: BORDER,
  bottom: BORDER,
  left: BORDER,
  right: BORDER,
};

const TITLE_STYLE = {
  font: { bold: true, sz: 16, color: { rgb: "C1121F" } },
  alignment: { vertical: "center" },
};

const SUBTITLE_STYLE = {
  font: { sz: 10, color: { rgb: "666666" } },
  alignment: { vertical: "center" },
};

const HEADER_STYLE = {
  font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
  fill: { fgColor: { rgb: "C1121F" } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: ALL_BORDERS,
};

const BODY_STYLE = {
  font: { sz: 10 },
  alignment: { vertical: "top", wrapText: true },
  border: ALL_BORDERS,
};

const TOTAL_STYLE = {
  font: { bold: true, sz: 10 },
  fill: { fgColor: { rgb: "F3F3F3" } },
  alignment: { vertical: "top", wrapText: true },
  border: ALL_BORDERS,
};

const STATUS_LABEL = {
  pending: "To Do",
  "in-progress": "In Progress",
  review: "In Review",
  approved: "Done",
  completed: "Done",
};

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

const fmtMinutes = (total) => {
  const minutes = Number(total) || 0;
  if (minutes <= 0) return "-";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

const parseDate = (value) => {
  if (!value) return null;
  const date =
    typeof value === "string" && value.length <= 10
      ? new Date(`${value}T00:00:00`)
      : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const fmtDay = (value) => {
  const date = parseDate(value);
  if (!date) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const fmtDateTime = (value) => {
  const date = parseDate(value);
  if (!date) return "-";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const dayOf = (value) => {
  const date = parseDate(value);
  return date ? date.toLocaleDateString("en-CA") : "";
};

const safeName = (value) =>
  String(value || "report")
    .trim()
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "");

/* ------------------------------------------------------------------ */
/* Sheet builder                                                       */
/* ------------------------------------------------------------------ */

function buildSheet({
  title,
  subtitle,
  headers,
  rows,
  widths,
  boldLastRow = false,
}) {
  const lastCol = headers.length - 1;

  const body = rows.length
    ? rows
    : [
        [
          "No records for this period",
          ...Array.from({ length: lastCol }, () => ""),
        ],
      ];

  const aoa = [[title], [subtitle], [], headers, ...body];
  const sheet = XLSX.utils.aoa_to_sheet(aoa);
  const lastRow = aoa.length - 1;

  sheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastCol } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastCol } },
  ];
  sheet["!cols"] = widths.map((wch) => ({ wch }));
  sheet["!rows"] = [{ hpt: 28 }, { hpt: 18 }, { hpt: 8 }, { hpt: 26 }];

  for (let r = 0; r <= lastRow; r += 1) {
    for (let c = 0; c <= lastCol; c += 1) {
      const address = XLSX.utils.encode_cell({ r, c });

      if (!sheet[address]) sheet[address] = { t: "s", v: "" };

      if (r === 0) sheet[address].s = TITLE_STYLE;
      else if (r === 1) sheet[address].s = SUBTITLE_STYLE;
      else if (r === 3) sheet[address].s = HEADER_STYLE;
      else if (r > 3) {
        sheet[address].s =
          boldLastRow && r === lastRow && rows.length
            ? TOTAL_STYLE
            : BODY_STYLE;
      }
    }
  }

  if (rows.length) {
    sheet["!autofilter"] = {
      ref: XLSX.utils.encode_range({
        s: { r: 3, c: 0 },
        e: { r: lastRow, c: lastCol },
      }),
    };
  }

  return sheet;
}

/* ------------------------------------------------------------------ */
/* Report sheets                                                       */
/* ------------------------------------------------------------------ */

function summaryRows(report, withTotal) {
  const rows = report.employees.map((employee) => {
    const fixed = report.fixedTasks.filter(
      (task) => task.employeeId === employee.id
    );
    const updates = report.updates.filter(
      (item) => item.employeeId === employee.id
    );
    const extra = report.extraTasks.filter(
      (task) => task.employeeId === employee.id
    );

    const expectedDays = fixed.reduce((sum, task) => sum + task.expectedDays, 0);
    const fixedMinutes = updates.reduce(
      (sum, item) => sum + item.timeSpentMinutes,
      0
    );
    const done = extra.filter((task) => task.isDone);
    const open = extra.filter((task) => !task.isDone);
    const overdue = open.filter(
      (task) => dayOf(task.dueDate) && dayOf(task.dueDate) < report.today
    );
    const extraMinutes = done.reduce(
      (sum, task) => sum + task.timeSpentMinutes,
      0
    );

    return {
      cells: [
        employee.name,
        employee.designation || employee.department || "-",
        fixed.length,
        updates.length,
        expectedDays,
        expectedDays
          ? `${Math.min(100, Math.round((updates.length / expectedDays) * 100))}%`
          : "-",
        fixedMinutes,
        extra.length,
        done.length,
        open.length,
        overdue.length,
        extraMinutes,
      ],
    };
  });

  const table = rows.map((row) => {
    const c = row.cells;
    return [
      c[0],
      c[1],
      c[2],
      c[3],
      c[4],
      c[5],
      fmtMinutes(c[6]),
      c[7],
      c[8],
      c[9],
      c[10],
      fmtMinutes(c[11]),
      fmtMinutes(c[6] + c[11]),
    ];
  });

  if (withTotal && rows.length > 1) {
    const sum = (index) => rows.reduce((total, row) => total + row.cells[index], 0);

    table.push([
      "TOTAL",
      "",
      sum(2),
      sum(3),
      sum(4),
      sum(4) ? `${Math.min(100, Math.round((sum(3) / sum(4)) * 100))}%` : "-",
      fmtMinutes(sum(6)),
      sum(7),
      sum(8),
      sum(9),
      sum(10),
      fmtMinutes(sum(11)),
      fmtMinutes(sum(6) + sum(11)),
    ]);
  }

  return table;
}

export function buildTaskReportWorkbook(report, { employee = null } = {}) {
  const label = employee?.name || "All Employees";
  const period = `${fmtDay(report.from)} to ${fmtDay(report.to)}`;
  const subtitle = `${label}  |  Period: ${period}  |  Generated: ${fmtDateTime(report.generatedAt)}`;

  const employeeName = new Map(
    report.employees.map((item) => [item.id, item.name])
  );

  const workbook = XLSX.utils.book_new();

  // 1) Summary
  XLSX.utils.book_append_sheet(
    workbook,
    buildSheet({
      title: `DigiAmplify Task Report - ${label}`,
      subtitle,
      headers: [
        "Employee",
        "Designation",
        "Fixed Tasks",
        "Daily Updates Posted",
        "Days Expected",
        "Posting Rate",
        "Fixed Task Time",
        "Extra Tasks Assigned",
        "Extra Tasks Completed",
        "Extra Tasks Open",
        "Extra Tasks Overdue",
        "Extra Task Time",
        "Total Time Logged",
      ],
      rows: summaryRows(report, !employee),
      widths: [24, 20, 11, 14, 12, 12, 14, 14, 14, 12, 12, 14, 14],
      boldLastRow: !employee,
    }),
    "Summary"
  );

  // 2) Daily updates of fixed tasks
  XLSX.utils.book_append_sheet(
    workbook,
    buildSheet({
      title: "Fixed Daily Task Updates",
      subtitle,
      headers: ["Date", "Employee", "Task", "Status", "Time Spent", "Update"],
      rows: report.updates.map((item) => [
        fmtDay(item.updateDate),
        employeeName.get(item.employeeId) || "-",
        item.taskTitle,
        item.status === "completed" ? "Done for the day" : "In progress",
        fmtMinutes(item.timeSpentMinutes),
        item.description,
      ]),
      widths: [14, 22, 28, 16, 12, 70],
    }),
    "Daily Updates"
  );

  // 3) Extra tasks
  XLSX.utils.book_append_sheet(
    workbook,
    buildSheet({
      title: "Extra Tasks",
      subtitle,
      headers: [
        "Employee",
        "Task",
        "Priority",
        "Status",
        "Assigned By",
        "Assigned On",
        "Due Date",
        "Started",
        "Finished",
        "Time Spent",
        "Overdue",
      ],
      rows: report.extraTasks.map((task) => [
        employeeName.get(task.employeeId) || "-",
        task.title,
        task.priority,
        STATUS_LABEL[task.status] || task.status,
        task.assignedBy || "-",
        fmtDay(task.createdAt),
        fmtDay(task.dueDate),
        fmtDateTime(task.startedAt),
        fmtDateTime(task.completedAt),
        task.isDone ? fmtMinutes(task.timeSpentMinutes) : "-",
        !task.isDone && dayOf(task.dueDate) && dayOf(task.dueDate) < report.today
          ? "Yes"
          : "No",
      ]),
      widths: [22, 30, 10, 13, 18, 14, 14, 20, 20, 12, 10],
    }),
    "Extra Tasks"
  );

  return workbook;
}

export function downloadTaskReport(report, { employee = null } = {}) {
  const workbook = buildTaskReportWorkbook(report, { employee });

  const fileName = `DigiAmplify_Task_Report_${safeName(
    employee?.name || "All_Employees"
  )}_${report.from}_to_${report.to}.xlsx`;

  XLSX.writeFile(workbook, fileName);

  return fileName;
}