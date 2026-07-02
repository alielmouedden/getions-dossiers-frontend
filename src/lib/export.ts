import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

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

export const exportToExcel = (data: Record<string, any>[], headers: { key: string; label: string }[], filename: string) => {
  const wsData = data.map(row => {
    const formattedRow: Record<string, any> = {};
    headers.forEach(h => {
      formattedRow[h.label] = row[h.key] !== undefined && row[h.key] !== null ? row[h.key] : '';
    });
    return formattedRow;
  });

  const ws = XLSX.utils.json_to_sheet(wsData);
  
  const colWidths = headers.map(h => {
    const headerLen = h.label.length;
    const maxValLen = data.reduce((max, row) => {
      const val = String(row[h.key] || '');
      return val.length > max ? val.length : max;
    }, 0);
    return { wch: Math.min(Math.max(headerLen, maxValLen) + 3, 40) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  
  XLSX.writeFile(wb, `${filename}.xlsx`);
};

export const exportToPDF = async (
  data: Record<string, any>[],
  headers: { key: string; label: string }[],
  filename: string,
  title: string,
  options?: { userName?: string }
) => {
  const userName = options?.userName || '';
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const isRtl = document.documentElement.dir === 'rtl' || document.body.dir === 'rtl';
  const direction = isRtl ? 'rtl' : 'ltr';
  const fontStack = isRtl ? '"Segoe UI", Tahoma, Arial, sans-serif' : 'Inter, "Segoe UI", Roboto, sans-serif';
  
  const rowsPerPage = 18;
  const totalPages = Math.max(1, Math.ceil(data.length / rowsPerPage));
  
  const logoUrl = '/logo%20justice.svg';
  try {
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = logoUrl;
    });
  } catch (err) {
    console.error('Failed to preload logo justice.svg', err);
  }

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '794px';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.dir = direction;
  document.body.appendChild(container);
  
  try {
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const startIdx = (pageNum - 1) * rowsPerPage;
      const chunk = data.slice(startIdx, startIdx + rowsPerPage);
      
      const pageEl = document.createElement('div');
      pageEl.style.width = '794px';
      pageEl.style.height = '1123px';
      pageEl.style.padding = '40px';
      pageEl.style.boxSizing = 'border-box';
      pageEl.style.backgroundColor = 'white';
      pageEl.style.display = 'flex';
      pageEl.style.flexDirection = 'column';
      pageEl.style.justifyContent = 'space-between';
      pageEl.style.fontFamily = fontStack;
      pageEl.style.position = 'relative';
      
      pageEl.innerHTML = `
        <!-- Page Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; direction: ${direction};">
          <div style="display: flex; align-items: center; direction: ${direction};">
            <img src="${logoUrl}" style="height: 55px; object-fit: contain;" alt="Logo" />
          </div>
          <div style="text-align: ${isRtl ? 'left' : 'right'}; font-size: 11px; color: #475569; line-height: 1.4;">
            <div><strong>${isRtl ? 'التاريخ:' : 'Date:'}</strong> ${currentDate}</div>
            <div><strong>${isRtl ? 'المستخرج:' : 'Généré par:'}</strong> ${userName || (isRtl ? 'المستخدم' : 'Utilisateur')}</div>
          </div>
        </div>

        <!-- Content Area -->
        <div style="flex-grow: 1; display: flex; flex-direction: column;">
          <h1 style="font-size: 22px; font-weight: bold; color: #1e293b; margin-top: 0; margin-bottom: 20px; text-align: center;">
            ${title}
          </h1>
          <table style="width: 100%; border-collapse: collapse; text-align: ${isRtl ? 'right' : 'left'}; font-size: 12px; border: 1px solid #e2e8f0; direction: ${direction};">
            <thead>
              <tr style="background-color: #0f172a; color: white;">
                ${headers.map(h => `<th style="padding: 12px; border: 1px solid #cbd5e1; font-weight: 600; text-align: ${isRtl ? 'right' : 'left'};">${h.label}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${chunk.map((row, idx) => `
                <tr style="background-color: ${idx % 2 === 0 ? '#f8fafc' : '#ffffff'};">
                  ${headers.map(h => `<td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #334155; white-space: pre-wrap; text-align: ${isRtl ? 'right' : 'left'};">${row[h.key] !== undefined && row[h.key] !== null ? row[h.key] : ''}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Page Footer -->
        <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b; margin-top: 20px; direction: ${direction};">
          <div>
            ${isRtl ? 'وثيقة رسمية صادرة عن موزع القضايا والملفات' : 'Document officiel généré par Justice Hub'}
          </div>
          <div style="font-weight: 600; color: #475569;">
            ${isRtl ? `صفحة ${pageNum} من ${totalPages}` : `Page ${pageNum} sur ${totalPages}`}
          </div>
          <div>
            &copy; 2026 Justice Hub.
          </div>
        </div>
      `;
      
      container.appendChild(pageEl);
      
      const canvas = await html2canvas(pageEl, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      if (pageNum > 1) {
        pdf.addPage();
      }
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      container.removeChild(pageEl);
    }
    
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
