export const downloadCSV = (
  headers: string[],
  data: any[],
  filename: string,
  mapper: (row: any) => (string | number | boolean | null | undefined)[]
) => {
  const csvRows = [headers.join(',')];

  for (const row of data) {
    const values = mapper(row).map(val => {
      if (val === null || val === undefined) {
        return '""';
      }

      const stringVal = String(val).replace(/"/g, '""');
      return `"${stringVal}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
