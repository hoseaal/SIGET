import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportMensualPDF = async (reportData, monthLabel, year) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const contentWidth = pageWidth - margin * 2;

    // ── 1. Logo ─────────────────────────────────────────────────────────────
    try {
        const response = await fetch('/assets/img/logo2.png');
        if (response.ok) {
            const blob = await response.blob();
            const reader = new FileReader();
            const imgData = await new Promise((resolve) => {
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(blob);
            });
            doc.addImage(imgData, 'PNG', pageWidth - margin - 80, margin - 10, 70, 55);
        }
    } catch (e) {
        console.warn('No se pudo cargar el logo:', e);
    }

    // ── 2. Encabezados institucionales ──────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CONTRALORÍA DEL ESTADO TÁCHIRA', pageWidth / 2, margin + 15, { align: 'center' });

    doc.setFontSize(10);
    doc.text('DIRECCIÓN GENERAL - DIVISIÓN DE SOPORTE TÉCNICO', pageWidth / 2, margin + 30, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
        `REPORTE MENSUAL DE SERVICIOS - ${monthLabel.toUpperCase()} ${year}`,
        pageWidth / 2,
        margin + 45,
        { align: 'center' }
    );

    const tableStartY = margin + 65;

    // ── 3. Preparar Filas ────────────────────────────────────────────────────
    const bodyRows = reportData.data.map((row, i) => [
        i + 1,
        row.nombre,
        row.cat1 || '',
        row.cat2 || '',
        row.cat3 || '',
        row.cat4 || '',
        row.cat5 || '',
        row.cat6 || '',
    ]);

    // Fila de Subtotales
    bodyRows.push([
        { content: 'SUB-TOTALES', colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fillColor: [235, 235, 235] } },
        { content: reportData.totals.cat1, styles: { halign: 'center', fontStyle: 'bold', fillColor: [235, 235, 235] } },
        { content: reportData.totals.cat2, styles: { halign: 'center', fontStyle: 'bold', fillColor: [235, 235, 235] } },
        { content: reportData.totals.cat3, styles: { halign: 'center', fontStyle: 'bold', fillColor: [235, 235, 235] } },
        { content: reportData.totals.cat4, styles: { halign: 'center', fontStyle: 'bold', fillColor: [235, 235, 235] } },
        { content: reportData.totals.cat5, styles: { halign: 'center', fontStyle: 'bold', fillColor: [235, 235, 235] } },
        { content: reportData.totals.cat6, styles: { halign: 'center', fontStyle: 'bold', fillColor: [235, 235, 235] } },
    ]);

    // ── 4. Generar Tabla ─────────────────────────────────────────────────────
    autoTable(doc, {
        startY: tableStartY,
        margin: { left: margin, right: margin },
        tableWidth: contentWidth,
        head: [
            [
                { content: 'Nro.', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                { content: 'DIRECCION SOLICITANTE', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                { content: 'MANT. PREVENTIVO', colSpan: 2, styles: { halign: 'center' } },
                { content: 'MANT. CORRECTIVO', colSpan: 2, styles: { halign: 'center' } },
                { content: 'PLAT. TECNOLOGICA', colSpan: 2, styles: { halign: 'center' } },
            ],
            [
                { content: 'SOFTWARE', styles: { halign: 'center' } },
                { content: 'HARDWARE', styles: { halign: 'center' } },
                { content: 'SOFTWARE', styles: { halign: 'center' } },
                { content: 'HARDWARE', styles: { halign: 'center' } },
                { content: 'SERVICIOS / REDES', styles: { halign: 'center' } },
                { content: 'INFORMES', styles: { halign: 'center' } },
            ]
        ],
        body: bodyRows,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 4,
            lineColor: [40, 40, 40],
            lineWidth: 0.5,
            valign: 'middle',
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            lineWidth: 1,
        },
        columnStyles: {
            0: { cellWidth: 30, halign: 'center' },
            1: { cellWidth: 'auto', halign: 'left' },
            2: { cellWidth: 55, halign: 'center' },
            3: { cellWidth: 55, halign: 'center' },
            4: { cellWidth: 55, halign: 'center' },
            5: { cellWidth: 55, halign: 'center' },
            6: { cellWidth: 55, halign: 'center' },
            7: { cellWidth: 55, halign: 'center' },
        }
    });

    // ── 5. Resúmenes Finales ────────────────────────────────────────────────
    let currentY = doc.lastAutoTable.finalY + 20;

    const totalHW = reportData.totals.cat2 + reportData.totals.cat4;
    const totalSW = reportData.totals.cat1 + reportData.totals.cat3;
    const grandTotal = Object.values(reportData.totals).reduce((a, b) => a + b, 0);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);

    // Caja de resúmenes (estilo similar a la imagen)
    doc.rect(margin, currentY, contentWidth, 60);

    doc.line(margin, currentY + 20, margin + contentWidth, currentY + 20);
    doc.line(margin, currentY + 40, margin + contentWidth, currentY + 40);

    doc.text('MANTENIMIENTOS PREVENTIVOS Y CORRECTIVOS DE HARDWARE', margin + 10, currentY + 13);
    doc.text(totalHW.toString(), margin + contentWidth - 20, currentY + 13, { align: 'right' });

    doc.text('MANTENIMIENTOS PREVENTIVOS Y CORRECTIVOS DE SOFTWARE', margin + 10, currentY + 33);
    doc.text(totalSW.toString(), margin + contentWidth - 20, currentY + 33, { align: 'right' });

    doc.setFontSize(11);
    doc.text('TOTAL DE SERVICIOS DEL MES', margin + 10, currentY + 53);
    doc.text(grandTotal.toString(), margin + contentWidth - 20, currentY + 53, { align: 'right' });

    // ── 6. Guardar ───────────────────────────────────────────────────────────
    window.open(doc.output('bloburl'), '_blank');
};
