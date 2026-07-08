import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportMensualToExcel = async (reportData, monthLabel, year) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Reporte Mensual ${monthLabel}`);

    // 0. Cargar el Logo
    try {
        const response = await fetch('/assets/img/logo2.png');
        if (response.ok) {
            const blob = await response.blob();
            const arrayBuffer = await blob.arrayBuffer();
            const logoId = workbook.addImage({
                buffer: arrayBuffer,
                extension: 'png',
            });
            worksheet.addImage(logoId, {
                tl: { col: 6.3, row: 0.2 },
                ext: { width: 95, height: 80 }
            });
        }
    } catch (error) {
        console.error("No se pudo cargar el logo para el Excel:", error);
    }

    worksheet.columns = [
        { header: 'Nro', key: 'nro', width: 5 },
        { header: 'DIRECCION SOLICITANTE', key: 'direccion', width: 35 },
        { header: 'MANT. PREVENTIVO SW', key: 'prev_sw', width: 12 },
        { header: 'MANT. PREVENTIVO HW', key: 'prev_hw', width: 12 },
        { header: 'MANT. CORRECTIVO SW', key: 'corr_sw', width: 12 },
        { header: 'MANT. CORRECTIVO HW', key: 'corr_hw', width: 12 },
    ];

    // Fila 1: Título
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'CONTRALORIA DEL ESTADO TACHIRA';
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Fila 2: Subtítulo
    worksheet.mergeCells('A2:F2');
    const subTitleCell = worksheet.getCell('A2');
    subTitleCell.value = 'DIRECCION GENERAL - DIVISION DE SOPORTE TECNICO';
    subTitleCell.font = { bold: true, size: 10 };
    subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 20;

    // Fila 3: Reporte mensual
    worksheet.mergeCells('A3:F3');
    const reportTitleCell = worksheet.getCell('A3');
    reportTitleCell.value = `REPORTE MENSUAL DE SERVICIOS - ${monthLabel.toUpperCase()} ${year}`;
    reportTitleCell.font = { bold: true, size: 10 };
    reportTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(3).height = 20;

    // LOGO (G1:H3)
    worksheet.mergeCells('G1:H3');
    const logoCell = worksheet.getCell('G1');
    logoCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Fila 4 y 5: Encabezados
    worksheet.getRow(4).values = [
        'Nro', 'DIRECCION SOLICITANTE',
        'MANT. PREVENTIVO', '', 'MANT. CORRECTIVO', '', 'PLAT. TECNOLOGICA', ''
    ];
    worksheet.getRow(5).values = [
        '', '', 'SOFTWARE', 'HARDWARE', 'SOFTWARE', 'HARDWARE', 'SERVICIOS / REDES', 'INFORMES'
    ];

    worksheet.mergeCells('A4:A5');
    worksheet.mergeCells('B4:B5');
    worksheet.mergeCells('C4:D4');
    worksheet.mergeCells('E4:F4');
    worksheet.mergeCells('G4:H4');

    const headerRows = [worksheet.getRow(4), worksheet.getRow(5)];
    headerRows.forEach(row => {
        row.eachCell(cell => {
            cell.font = { bold: true, size: 9 };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE9ECEF' }
            };
        });
    });

    // Datos
    reportData.data.forEach((row, index) => {
        const rowIndex = 6 + index;
        const r = worksheet.getRow(rowIndex);

        r.values = [
            index + 1,
            row.nombre,
            row.cat1 || '',
            row.cat2 || '',
            row.cat3 || '',
            row.cat4 || '',
            row.cat5 || '',
            row.cat6 || '',
        ];

        r.eachCell(cell => {
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.font = { size: 9 };
        });

        r.getCell(2).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    });

    // Sub-totales
    const lastDataRow = 6 + reportData.data.length;
    const subTotalRow = worksheet.getRow(lastDataRow);

    worksheet.mergeCells(`A${lastDataRow}:B${lastDataRow}`);
    subTotalRow.getCell(1).value = 'SUB-TOTALES';
    subTotalRow.getCell(1).font = { bold: true };
    subTotalRow.getCell(1).alignment = { horizontal: 'right' };

    subTotalRow.getCell(3).value = reportData.totals.cat1;
    subTotalRow.getCell(4).value = reportData.totals.cat2;
    subTotalRow.getCell(5).value = reportData.totals.cat3;
    subTotalRow.getCell(6).value = reportData.totals.cat4;
    subTotalRow.getCell(7).value = reportData.totals.cat5;
    subTotalRow.getCell(8).value = reportData.totals.cat6;

    subTotalRow.eachCell(cell => {
        cell.font = { bold: true, size: 10 };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { horizontal: 'center' };
    });

    // Resumen final
    const summaryRow = lastDataRow + 2;
    const totalHW = reportData.totals.cat2 + reportData.totals.cat4;
    const totalSW = reportData.totals.cat1 + reportData.totals.cat3;
    const grandTotal = Object.values(reportData.totals).reduce((a, b) => a + b, 0);

    worksheet.mergeCells(`A${summaryRow}:B${summaryRow}`);
    worksheet.getCell(`A${summaryRow}`).value = 'MANT. PREVENTIVOS Y CORRECTIVOS DE HARDWARE';
    worksheet.getCell(`A${summaryRow}`).font = { bold: true, size: 10 };
    worksheet.getCell(`A${summaryRow}`).alignment = { horizontal: 'left' };
    worksheet.mergeCells(`C${summaryRow}:H${summaryRow}`);
    worksheet.getCell(`C${summaryRow}`).value = totalHW;
    worksheet.getCell(`C${summaryRow}`).font = { bold: true, size: 10 };
    worksheet.getCell(`C${summaryRow}`).alignment = { horizontal: 'right' };

    const summaryRow2 = summaryRow + 1;
    worksheet.mergeCells(`A${summaryRow2}:B${summaryRow2}`);
    worksheet.getCell(`A${summaryRow2}`).value = 'MANT. PREVENTIVOS Y CORRECTIVOS DE SOFTWARE';
    worksheet.getCell(`A${summaryRow2}`).font = { bold: true, size: 10 };
    worksheet.getCell(`A${summaryRow2}`).alignment = { horizontal: 'left' };
    worksheet.mergeCells(`C${summaryRow2}:H${summaryRow2}`);
    worksheet.getCell(`C${summaryRow2}`).value = totalSW;
    worksheet.getCell(`C${summaryRow2}`).font = { bold: true, size: 10 };
    worksheet.getCell(`C${summaryRow2}`).alignment = { horizontal: 'right' };

    const summaryRow3 = summaryRow2 + 1;
    worksheet.mergeCells(`A${summaryRow3}:B${summaryRow3}`);
    worksheet.getCell(`A${summaryRow3}`).value = 'TOTAL DE SERVICIOS DEL MES';
    worksheet.getCell(`A${summaryRow3}`).font = { bold: true, size: 11 };
    worksheet.getCell(`A${summaryRow3}`).alignment = { horizontal: 'left' };
    worksheet.mergeCells(`C${summaryRow3}:H${summaryRow3}`);
    worksheet.getCell(`C${summaryRow3}`).value = grandTotal;
    worksheet.getCell(`C${summaryRow3}`).font = { bold: true, size: 12 };
    worksheet.getCell(`C${summaryRow3}`).alignment = { horizontal: 'right' };

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Reporte_Mensual_${monthLabel}_${year}.xlsx`);
};
