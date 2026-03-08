import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToCSV = (data: Record<string, string>[], headers: { key: string; label: string }[], filename: string) => {
  const headerRow = headers.map(h => h.label).join(',');
  const rows = data.map(row => headers.map(h => `"${(row[h.key] || '').replace(/"/g, '""')}"`).join(','));
  const csv = [headerRow, ...rows].join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportToPDF = (data: Record<string, string>[], headers: { key: string; label: string }[], filename: string, title: string) => {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(16);
  doc.text(title, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });

  autoTable(doc, {
    startY: 25,
    head: [headers.map(h => h.label)],
    body: data.map(row => headers.map(h => row[h.key] || '')),
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [234, 161, 12], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  doc.save(`${filename}.pdf`);
};
