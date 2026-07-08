import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const exportActividadesToExcel = async (actividades) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Historial de Actividades');

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

            // Posicionar logo en la celda combinada L1:L3
            worksheet.addImage(logoId, {
                tl: { col: 11.99, row: 0.1 },
                ext: { width: 90, height: 80 }
            });
        }
    } catch (error) {
        console.error("No se pudo cargar el logo para el Excel:", error);
    }

    // 1. Configuración de columnas (basado en el formato de 10 columnas de la tabla)
    worksheet.columns = [
        { header: 'Nro', key: 'nro', width: 5 },
        { header: 'FECHA', key: 'fecha', width: 12 },
        { header: 'DIRECCION SOLICITANTE', key: 'direccion', width: 30 },
        { header: 'DESCRIPCION DEL REPORTE', key: 'descripcion', width: 35 },
        { header: 'BM', key: 'bm', width: 8 },
        { header: 'MANT. PREVENTIVO SW', key: 'prev_sw', width: 10 },
        { header: 'MANT. PREVENTIVO HW', key: 'prev_hw', width: 10 },
        { header: 'MANT. CORRECTIVO SW', key: 'corr_sw', width: 10 },
        { header: 'MANT. CORRECTIVO HW', key: 'corr_hw', width: 10 },
        { header: 'PLAT. TEC. SERV', key: 'plat_serv', width: 10 },
        { header: 'PLAT. TEC. INF', key: 'plat_inf', width: 10 },
        { header: '', key: 'obs', width: 45 }
    ];

    // 2. Encabezados Principales (Combinación de celdas)
    // Fila 1: CONTRALORIA DEL ESTADO TACHIRA
    worksheet.mergeCells('A1:K1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'CONTRALORIA DEL ESTADO TACHIRA';
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(1).height = 30;

    // Fila 2: DIVISION DE SOPORTE TECNICO
    worksheet.mergeCells('A2:K2');
    const subTitleCell = worksheet.getCell('A2');
    subTitleCell.value = 'DIRECCION GENERAL - DIVISION DE SOPORTE TECNICO';
    subTitleCell.font = { bold: true, size: 10 };
    subTitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    worksheet.getRow(2).height = 20;

    // Fila 3: Espacio extra o subtítulo
    worksheet.mergeCells('A3:K3');

    // CELDA ESPECIAL PARA EL LOGO (L1:L3)
    worksheet.mergeCells('L1:L3');
    const logoCell = worksheet.getCell('L1');
    logoCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Fila 4 y 5: Encabezados de Tabla (Manejo de combinaciones para Preventivo, Correctivo, etc)
    worksheet.getRow(4).values = [
        'Nro', 'FECHA', 'DIRECCION SOLICITANTE', 'DESCRIPCION DEL REPORTE', 'BM',
        'MANT. PREVENTIVO', '', 'MANT. CORRECTIVO', '', 'PLAT. TECNOLOGICA', '', 'OBSERVACIONES'
    ];
    worksheet.getRow(5).values = [
        '', '', '', '', '', 'SOFTWARE', 'HARDWARE', 'SOFTWARE', 'HARDWARE', 'SERVICIOS / REDES', 'INFORMES', ''
    ];

    // Combinar celdas del encabezado
    worksheet.mergeCells('A4:A5'); // Nro
    worksheet.mergeCells('B4:B5'); // FECHA
    worksheet.mergeCells('C4:C5'); // DIRECCION
    worksheet.mergeCells('D4:D5'); // DESCRIPCION
    worksheet.mergeCells('E4:E5'); // BM
    worksheet.mergeCells('F4:G4'); // MANT PREV
    worksheet.mergeCells('H4:I4'); // MANT CORR
    worksheet.mergeCells('J4:K4'); // PLAT TEC
    worksheet.mergeCells('L4:L5'); // OBSERVACIONES

    // Estilo para encabezados
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

    // 3. Insertar Datos
    let totalPrev = 0, totalCorr = 0, totalPlat = 0;

    actividades.forEach((a, index) => {
        const rowIndex = 6 + index;
        const row = worksheet.getRow(rowIndex);

        const isPrevSw = a.clasificacion_id === 1;
        const isPrevHw = a.clasificacion_id === 2;
        const isCorrSw = a.clasificacion_id === 3;
        const isCorrHw = a.clasificacion_id === 4;
        const isPlatServ = a.clasificacion_id === 5;
        const isPlatInf = a.clasificacion_id === 6;

        row.values = [
            index + 1,
            new Date(a.fecha).toLocaleDateString(),
            a.depto_nombre,
            a.tipo_act_nombre,
            a.equipo_nro_bien || '',
            isPrevSw ? 1 : '',
            isPrevHw ? 1 : '',
            isCorrSw ? 1 : '',
            isCorrHw ? 1 : '',
            isPlatServ ? 1 : '',
            isPlatInf ? 1 : '',
            a.observaciones
        ];

        // Sumatorias para el footer
        if (isPrevSw || isPrevHw) totalPrev++;
        if (isCorrSw || isCorrHw) totalCorr++;
        if (isPlatServ || isPlatInf) totalPlat++;

        row.eachCell(cell => {
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.font = { size: 9 };
        });

        // Alinear texto a la izquierda para depto y obs
        row.getCell(3).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        row.getCell(4).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        row.getCell(12).alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    });

    // 4. Footer con Totales
    const lastDataRow = 6 + actividades.length;
    const footerRow = worksheet.getRow(lastDataRow + 1);

    worksheet.mergeCells(`A${lastDataRow + 1}:E${lastDataRow + 1}`);
    footerRow.getCell(1).value = 'SUB TOTALES';
    footerRow.getCell(1).font = { bold: true };
    footerRow.getCell(1).alignment = { horizontal: 'right' };

    // Calcular subtotales por columna (sumar los 1s)
    const counts = [0, 0, 0, 0, 0, 0]; // SwP, HwP, SwC, HwC, Serv, Inf
    actividades.forEach(a => {
        if (a.clasificacion_id >= 1 && a.clasificacion_id <= 6) {
            counts[a.clasificacion_id - 1]++;
        }
    });

    footerRow.getCell(6).value = counts[0];
    footerRow.getCell(7).value = counts[1];
    footerRow.getCell(8).value = counts[2];
    footerRow.getCell(9).value = counts[3];
    footerRow.getCell(10).value = counts[4];
    footerRow.getCell(11).value = counts[5];

    footerRow.eachCell(cell => {
        cell.font = { bold: true, size: 10 };
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { horizontal: 'center' };
    });

    // TOTAL SEMANAL
    const totalRow = worksheet.getRow(lastDataRow + 2);
    worksheet.mergeCells(`A${lastDataRow + 2}:E${lastDataRow + 2}`);
    totalRow.getCell(1).value = 'TOTAL SEMANAL';
    totalRow.getCell(1).font = { bold: true };
    totalRow.getCell(1).alignment = { horizontal: 'right' };

    worksheet.mergeCells(`F${lastDataRow + 2}:K${lastDataRow + 2}`);
    totalRow.getCell(6).value = actividades.length;
    totalRow.getCell(6).font = { bold: true, size: 11 };
    totalRow.getCell(6).alignment = { horizontal: 'center' };

    totalRow.eachCell(cell => {
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });

    // 5. Generar archivo
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Historial_Actividades_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
