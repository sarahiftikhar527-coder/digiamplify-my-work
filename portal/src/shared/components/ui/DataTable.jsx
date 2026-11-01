// columns: [{ key, header, render?(row) }]
export default function DataTable({ columns, rows, rowKey = "id", minWidth = 760 }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full text-left text-xs" style={{ minWidth }}>
        <thead>
          <tr className="text-gray-400">
            {columns.map((c) => (
              <th key={c.key} className="px-3 py-3 font-normal">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-200">
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-t border-line hover:bg-white/[0.03]">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-3">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}