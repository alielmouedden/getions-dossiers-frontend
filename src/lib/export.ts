import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToCSV = (data: Record<string, any>[], headers: { key: string; label: string }[], filename: string) => {
  const escapeCsv = (str: any) => `"${String(str || '').replace(/"/g, '""')}"`;
  const headerRow = headers.map(h => escapeCsv(h.label)).join(',');
  const rows = data.map(row => headers.map(h => escapeCsv(row[h.key])).join(','));
  const csv = [headerRow, ...rows].join('\n');
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = async (data: Record<string, any>[], headers: { key: string; label: string }[], filename: string, title: string) => {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '1000px'; // Fixed width for better resolution consistency
  container.style.backgroundColor = 'white';
  container.style.padding = '40px';
  container.dir = 'rtl';
  
  // High-compatibility font stack for Arabic shaping
  const fontStack = '"Segoe UI", Tahoma, Arial, sans-serif';
  
  container.innerHTML = `
    <div style="font-family: ${fontStack}; text-align: center; background-color: white; padding: 20px; direction: rtl;" dir="rtl">
      <h1 style="font-size: 24px; margin-bottom: 30px; color: #333; font-weight: bold; font-feature-settings: 'liga' on, 'rlig' on;">${title}</h1>
      <table style="width: 100%; border-collapse: collapse; direction: rtl; border: 1px solid #ddd; table-layout: auto; font-feature-settings: 'liga' on, 'rlig' on;">
        <thead>
          <tr style="background-color: #eaa10c; color: white;">
            ${headers.map(h => `<th style="border: 1px solid #ddd; padding: 12px; font-weight: bold; text-align: right; white-space: nowrap; font-feature-settings: 'liga' on, 'rlig' on;">${h.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map((row, i) => `
            <tr style="background-color: ${i % 2 === 0 ? '#f9fafb' : '#ffffff'};">
              ${headers.map(h => `<td style="border: 1px solid #ddd; padding: 10px; text-align: right; color: #1f2937; white-space: pre-wrap; font-feature-settings: 'liga' on, 'rlig' on;">${row[h.key] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.body.appendChild(container);
  
  try {
    const canvas = await html2canvas(container, {
      scale: 4, // Maximum practical scale for clarity without crashing memory
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1000,
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    const margin = 10;
    pdf.addImage(imgData, 'JPEG', margin, margin, pdfWidth - (margin*2), pdfHeight - (margin*2));
    
    // Using manual blob for robust naming
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const pdfLink = document.createElement('a');
    pdfLink.setAttribute('href', pdfUrl);
    pdfLink.setAttribute('download', `${filename}.pdf`);
    document.body.appendChild(pdfLink);
    pdfLink.click();
    document.body.removeChild(pdfLink);
    URL.revokeObjectURL(pdfUrl);

  } catch (error) {
    console.error('PDF Generation failed', error);
  } finally {
    document.body.removeChild(container);
  }
};
