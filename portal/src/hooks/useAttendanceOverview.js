import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx-js-style";
import api from "../services/api/apiClient";

const INITIAL_DATA = {
  date: "",
  stats: {
    present: 0,
    late: 0,
    absent: 0,
    incomplete: 0,
    leave: 0,
  },
  rows: [],
};

const HEADERS = [
  "Employee",
  "Email",
  "Department",
  "Designation",
  "Date",
  "Clock In",
  "Clock Out",
  "Worked Time",
  "Status",
  "Description",
];

const COLORS = {
  black: "080808",
  red: "C1121F",
  darkRed: "8B0C16",
  white: "FFFFFF",
  gray: "F3F3F3",
  border: "DDDDDD",
  text: "222222",
  green: "176B43",
};

const getLocalDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDate = (value) => {
  if (!value) return "";

  const parsed = new Date(
    String(value).length === 10 ? `${value}T12:00:00` : value
  );

  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const formatTime = (value) => {
  if (!value) return "";

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
};

const formatWorkedTime = (minutes) => {
  const total = Math.max(0, Number(minutes) || 0);

  return `${Math.floor(total / 60)}h ${total % 60}m`;
};

const getPayload = (response) =>
  response?.data?.data ?? response?.data ?? {};

const getName = (row) =>
  row?.name ||
  row?.employeeName ||
  row?.user?.name ||
  row?.employee?.name ||
  "";

const getEmail = (row) =>
  row?.email || row?.user?.email || row?.employee?.email || "";

const getDepartment = (row) =>
  row?.department ||
  row?.user?.department ||
  row?.employee?.department ||
  "";

const getDesignation = (row) =>
  row?.designation ||
  row?.user?.designation ||
  row?.employee?.designation ||
  "";

const getStatus = (row) => {
  if (row?.status) return String(row.status);
  if (row?.clockInAt && row?.clockOutAt) return "Completed";
  if (row?.clockInAt) return "Working";

  return "Absent";
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });

const getMonthDates = (month) => {
  const [year, monthNumber] = month.split("-").map(Number);
  const count = new Date(year, monthNumber, 0).getDate();

  return Array.from({ length: count }, (_, index) => {
    return `${month}-${String(index + 1).padStart(2, "0")}`;
  });
};

const makeRows = (rows, fallbackDate) =>
  rows.map((row) => ({
    Employee: getName(row),
    Email: getEmail(row),
    Department: getDepartment(row),
    Designation: getDesignation(row),
    Date: formatDate(row?.dateKey || row?.date || fallbackDate || ""),
    "Clock In": formatTime(row?.clockInAt),
    "Clock Out": formatTime(row?.clockOutAt),
    "Worked Time": formatWorkedTime(row?.workedMinutes),
    Status: getStatus(row),
    Description: row?.description || "",
  }));

const createCell = (value, style) => ({
  t: "s",
  v: String(value ?? ""),
  s: style,
});

const downloadExcel = ({ reportRows, periodLabel, fileName }) => {
  const sheetData = [
    ["DIGIAMPLIFY"],
    ["EMPLOYEE ATTENDANCE REPORT"],
    [`Reporting Period: ${periodLabel}`],
    [`Generated: ${new Date().toLocaleString()}`],
    [`Total Records: ${reportRows.length}`],
    [],
    HEADERS,
    ...reportRows.map((row) => HEADERS.map((header) => row[header])),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
  const columnCount = HEADERS.length;

  worksheet["!cols"] = [
    { wch: 24 },
    { wch: 30 },
    { wch: 20 },
    { wch: 22 },
    { wch: 16 },
    { wch: 14 },
    { wch: 14 },
    { wch: 16 },
    { wch: 18 },
    { wch: 36 },
  ];

  worksheet["!merges"] = [0, 1, 2, 3, 4].map((row) => ({
    s: { r: row, c: 0 },
    e: { r: row, c: columnCount - 1 },
  }));

  worksheet["!autofilter"] = {
    ref: `A7:J${Math.max(7, reportRows.length + 7)}`,
  };

  worksheet["!freeze"] = {
    xSplit: 0,
    ySplit: 7,
  };

  worksheet["!rows"] = [
    { hpt: 34 },
    { hpt: 26 },
    { hpt: 22 },
    { hpt: 22 },
    { hpt: 22 },
    { hpt: 9 },
    { hpt: 30 },
    ...reportRows.map(() => ({ hpt: 25 })),
  ];

  const titleStyle = {
    fill: {
      patternType: "solid",
      fgColor: { rgb: COLORS.black },
    },
    font: {
      name: "Arial",
      bold: true,
      color: { rgb: COLORS.white },
      sz: 19,
    },
    alignment: {
      vertical: "center",
      horizontal: "left",
    },
  };

  const subtitleStyle = {
    fill: {
      patternType: "solid",
      fgColor: { rgb: COLORS.red },
    },
    font: {
      name: "Arial",
      bold: true,
      color: { rgb: COLORS.white },
      sz: 12,
    },
    alignment: {
      vertical: "center",
      horizontal: "left",
    },
  };

  const metaStyle = {
    fill: {
      patternType: "solid",
      fgColor: { rgb: COLORS.gray },
    },
    font: {
      name: "Arial",
      color: { rgb: "333333" },
      sz: 10,
    },
    alignment: {
      vertical: "center",
      horizontal: "left",
    },
  };

  const headerStyle = {
    fill: {
      patternType: "solid",
      fgColor: { rgb: COLORS.red },
    },
    font: {
      name: "Arial",
      bold: true,
      color: { rgb: COLORS.white },
      sz: 10,
    },
    alignment: {
      vertical: "center",
      horizontal: "center",
      wrapText: true,
    },
    border: {
      top: { style: "thin", color: { rgb: COLORS.white } },
      bottom: { style: "medium", color: { rgb: COLORS.darkRed } },
      left: { style: "thin", color: { rgb: "E8A0A5" } },
      right: { style: "thin", color: { rgb: "E8A0A5" } },
    },
  };

  const cellBorder = {
    top: { style: "thin", color: { rgb: COLORS.border } },
    bottom: { style: "thin", color: { rgb: COLORS.border } },
    left: { style: "thin", color: { rgb: COLORS.border } },
    right: { style: "thin", color: { rgb: COLORS.border } },
  };

  for (let row = 0; row <= 4; row += 1) {
    for (let col = 0; col < columnCount; col += 1) {
      const address = XLSX.utils.encode_cell({ r: row, c: col });

      if (!worksheet[address]) {
        worksheet[address] = {
          t: "s",
          v: "",
        };
      }

      if (row === 0) {
        worksheet[address].s = titleStyle;
      } else if (row === 1) {
        worksheet[address].s = subtitleStyle;
      } else {
        worksheet[address].s = metaStyle;
      }
    }
  }

  for (let col = 0; col < columnCount; col += 1) {
    const address = XLSX.utils.encode_cell({ r: 6, c: col });

    if (worksheet[address]) {
      worksheet[address].s = headerStyle;
    }
  }

  for (let row = 7; row < reportRows.length + 7; row += 1) {
    for (let col = 0; col < columnCount; col += 1) {
      const address = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[address];

      if (!cell) continue;

      cell.s = {
        font: {
          name: "Arial",
          sz: 10,
          color: { rgb: COLORS.text },
        },
        fill: {
          patternType: "solid",
          fgColor: {
            rgb: row % 2 === 0 ? "F4F4F4" : COLORS.white,
          },
        },
        alignment: {
          vertical: "center",
          wrapText: true,
        },
        border: cellBorder,
      };

      if (col === 8) {
        const status = String(cell.v || "").toLowerCase();

        if (status.includes("absent")) {
          cell.s.font = {
            name: "Arial",
            bold: true,
            color: { rgb: COLORS.red },
          };
        } else if (
          status.includes("present") ||
          status.includes("complete")
        ) {
          cell.s.font = {
            name: "Arial",
            bold: true,
            color: { rgb: COLORS.green },
          };
        }
      }
    }
  }

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Attendance");

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

const createPdfDocument = ({
  reportRows,
  periodLabel,
  fileName,
  generatedAt,
}) => {
  const tableRows = reportRows
    .map(
      (row) => `
        <tr>
          ${HEADERS.map(
            (header) => `<td>${escapeHtml(row[header])}</td>`
          ).join("")}
        </tr>
      `
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(fileName)}</title>
<style>
@page {
  size: A4 landscape;
  margin: 10mm;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  color: #161616;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 9px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.brand {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  background: #080808;
  color: #ffffff;
  border-bottom: 5px solid #c1121f;
}
.brand img {
  display: block;
  width: 145px;
  height: 58px;
  object-fit: contain;
}
.brand-name {
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.brand-name span {
  color: #ed2636;
}
.subtitle {
  margin-top: 7px;
  color: #dddddd;
  font-size: 10px;
  letter-spacing: 2px;
}
.meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 16px 0 12px;
  font-size: 10px;
}
.meta strong {
  color: #c1121f;
}
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
th {
  padding: 8px 5px;
  background: #c1121f;
  color: #ffffff;
  text-align: left;
  font-size: 8px;
  overflow-wrap: anywhere;
}
td {
  padding: 7px 5px;
  border: 1px solid #dddddd;
  overflow-wrap: anywhere;
  vertical-align: top;
}
tbody tr:nth-child(even) {
  background: #f3f3f3;
}
tbody tr {
  break-inside: avoid;
}
.footer {
  margin-top: 16px;
  padding-top: 8px;
  border-top: 1px solid #dddddd;
  color: #666666;
  font-size: 9px;
}
@media print {
  thead {
    display: table-header-group;
  }
  tr {
    break-inside: avoid;
  }
}
</style>
</head>
<body>
<header class="brand">
  <img id="company-logo" src="/logo.png" alt="DigiAmplify logo">
  <div>
    <div class="brand-name">Digi<span>Amplify</span></div>
    <div class="subtitle">EMPLOYEE ATTENDANCE REPORT</div>
  </div>
</header>
<div class="meta">
  <div><strong>Period:</strong> ${escapeHtml(periodLabel)}</div>
  <div><strong>Total records:</strong> ${reportRows.length}</div>
  <div><strong>Generated:</strong> ${escapeHtml(generatedAt)}</div>
</div>
<table>
  <thead>
    <tr>${HEADERS.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr>
  </thead>
  <tbody>
    ${
      tableRows ||
      `<tr><td colspan="${HEADERS.length}">No attendance records found.</td></tr>`
    }
  </tbody>
</table>
<div class="footer">DigiAmplify · Official employee attendance report</div>
<script>
(function () {
  function openPrintDialog() {
    window.focus();
    window.print();
  }

  var logo = document.getElementById("company-logo");

  if (logo) {
    logo.addEventListener("load", function () {
      setTimeout(openPrintDialog, 300);
    });

    logo.addEventListener("error", function () {
      logo.style.display = "none";
      setTimeout(openPrintDialog, 300);
    });

    if (logo.complete) {
      setTimeout(openPrintDialog, 300);
    }
  } else {
    setTimeout(openPrintDialog, 300);
  }
})();
</script>
</body>
</html>`;
};

const useAttendanceOverview = () => {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [data, setData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const load = useCallback(async () => {
    setError("");

    try {
      const response = await api.get("/attendance/overview", {
        params: {
          status: filter,
          search: search.trim() || undefined,
          date: date || undefined,
        },
      });

      const payload = getPayload(response);

      setData({
        ...INITIAL_DATA,
        ...payload,
        stats: {
          ...INITIAL_DATA.stats,
          ...(payload.stats || {}),
        },
        rows: Array.isArray(payload.rows) ? payload.rows : [],
      });
    } catch (e) {
      setError(
        e?.response?.data?.message || "Attendance load nahi ho saki."
      );
    } finally {
      setLoading(false);
    }
  }, [filter, search, date]);

  useEffect(() => {
    const timer = setTimeout(load, 300);

    return () => clearTimeout(timer);
  }, [load]);

  useEffect(() => {
    const timer = setInterval(load, 60000);

    return () => clearInterval(timer);
  }, [load]);

  const fetchMonthlyRows = useCallback(
    async (month) => {
      const dates = getMonthDates(month);

      const responses = await Promise.all(
        dates.map((reportDate) =>
          api.get("/attendance/overview", {
            params: {
              status: filter,
              search: search.trim() || undefined,
              date: reportDate,
            },
          })
        )
      );

      return responses.flatMap((response, index) => {
        const payload = getPayload(response);

        return (Array.isArray(payload.rows) ? payload.rows : []).map(
          (row) => ({
            ...row,
            dateKey: row?.dateKey || row?.date || dates[index],
          })
        );
      });
    },
    [filter, search]
  );

  const exportReport = useCallback(
    async ({
      format = "xlsx",
      period = "daily",
      date: selectedDate = "",
      month = "",
    } = {}) => {
      setExporting(true);
      setExportError("");

      let printWindow = null;

      try {
        const reportDate =
          selectedDate || date || data.date || getLocalDateKey(new Date());

        const reportMonth = month || reportDate.slice(0, 7);

        if (format === "pdf") {
          printWindow = window.open("", "_blank");

          if (!printWindow) {
            throw new Error(
              "PDF window block ho rahi hai. Browser mein pop-ups allow karein aur dobara try karein."
            );
          }

          printWindow.document.open();
          printWindow.document.write(
            "<!doctype html><html><head><title>Preparing attendance PDF...</title></head><body style='font-family:Arial;padding:24px'>Preparing your attendance report...</body></html>"
          );
          printWindow.document.close();
        }

        let sourceRows;

        if (period === "monthly") {
          sourceRows = await fetchMonthlyRows(reportMonth);
        } else if (reportDate === date || !date) {
          sourceRows = data.rows;
        } else {
          const response = await api.get("/attendance/overview", {
            params: {
              status: filter,
              search: search.trim() || undefined,
              date: reportDate,
            },
          });

          const payload = getPayload(response);

          sourceRows = Array.isArray(payload.rows) ? payload.rows : [];
        }

        const reportRows = makeRows(
          sourceRows,
          period === "daily" ? reportDate : ""
        );

        const periodLabel =
          period === "monthly"
            ? new Date(`${reportMonth}-01T12:00:00`).toLocaleDateString(
                "en-US",
                {
                  month: "long",
                  year: "numeric",
                }
              )
            : formatDate(reportDate);

        const fileName = `DigiAmplify-Attendance-${period}-${period === "monthly" ? reportMonth : reportDate}`;

        if (format === "xlsx") {
          downloadExcel({
            reportRows,
            periodLabel,
            fileName,
          });

          return;
        }

        if (format === "pdf") {
          if (!printWindow || printWindow.closed) {
            throw new Error(
              "PDF window band ho gayi. Dobara Download PDF par click karein."
            );
          }

          const generatedAt = new Date().toLocaleString();

          printWindow.document.open();
          printWindow.document.write(
            createPdfDocument({
              reportRows,
              periodLabel,
              fileName,
              generatedAt,
            })
          );
          printWindow.document.close();

          return;
        }

        throw new Error("Unsupported export format.");
      } catch (e) {
        if (printWindow && !printWindow.closed) {
          printWindow.close();
        }

        setExportError(
          e?.response?.data?.message ||
            e?.message ||
            "Attendance report export nahi ho saki."
        );
      } finally {
        setExporting(false);
      }
    },
    [date, data.date, data.rows, filter, search, fetchMonthlyRows]
  );

  return {
    ...data,
    filter,
    setFilter,
    search,
    setSearch,
    date,
    setDate,
    loading,
    error,
    reload: load,
    exportReport,
    exporting,
    exportError,
  };
};

export default useAttendanceOverview;