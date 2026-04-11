import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { YearTasksData } from '@monorepo/types';
import { TasksSummary } from '@/types/Interfaces';

export async function generateUserReportPDF(
    yearData: YearTasksData[],
    summary: TasksSummary,
    userName: string,
): Promise<void> {
    const element = document.createElement('div');

    // Чтобы элемент с данными не отображался на странице, но был видимым для html2canvas, мы используем абсолютное позиционирование и z-index
    element.style.position = 'absolute';
    element.style.top = '0';
    element.style.left = '-9999px';
    element.style.width = '1200px';

    const styles = `
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        .report-container {
            padding: 30px;
            font-family: 'Arial', sans-serif;
        }
        .report-title {
            font-size: 36px;
            color: #1e293b;
            margin-bottom: 30px;
            text-align: left;
        }
        .report-table {
            width: 100%;
            border-collapse: collapse;
        }
        .report-table th {
            background-color: #3b82f6;
            color: white;
            padding: 0px;
            text-align: center;
            font-size: 24px;
            height: 60px;
            vertical-align: top;
        }
        .report-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 24px;
            text-align: center;
            height: 40px;
            vertical-align: middle;
        }
        .report-table tr:hover {
            background-color: #f8fafc;
        }
        .month-cell {
            font-weight: bold;
            color: #1e293b;
            text-align: left;
            font-size: 24px;
        }
        .created-cell {
            color: #059669;
        }
        .completed-cell {
            color: #2563eb;
        }
        .summary {
            margin-bottom: 20px; 
            font-size: 24px; 
            color: #1e293b;
        }
        .summary span {
            margin-right: 20px;
        }
    </style>
`;

    let tableRows = '';
    yearData.forEach((item) => {
        tableRows += `
        <tr>
            <td class="month-cell">${item.month}</td>
            <td class="created-cell">${item.created}</td>
            <td class="completed-cell">${item.completed}</td>
            <td>${item.comments}</td>
            <td>${item.likes}</td>
        </tr>
    `;
    });

    const html = `
    ${styles}
    <div class="report-container">
        <h1 class="report-title">Отчет пользователя ${userName} за ${yearData[0]?.year || 'N/A'} г.</h1>
        <div class="summary">
            <span>Всего задач: ${summary.created}</span>
            <span>Выполнено: ${summary.completed}</span>
            <span>Запланировано: ${summary.planned}</span>
            <span>В процессе: ${summary.inprogress}</span>
            <span>Отклонено: ${summary.rejected}</span>
        </div>
        <table class="report-table">
            <thead>
                <tr>
                    <th>Месяц</th>
                    <th>Создано задач</th>
                    <th>Выполнено задач</th>
                    <th>Комментариев</th>
                    <th>Лайков</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    </div>
`;

    element.innerHTML = html;
    document.body.appendChild(element);

    const canvas = await html2canvas(element, {
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.75);

    const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);
    pdf.save(`Отчет ${userName} ${yearData[0]?.year || 'N/A'}.pdf`);

    document.body.removeChild(element);
}
