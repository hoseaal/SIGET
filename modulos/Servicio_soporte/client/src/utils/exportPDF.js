import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportActividadesToPDF = async (actividades) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'letter' });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 30;
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
            doc.addImage(imgData, 'PNG', pageWidth - margin - 85, margin - 5, 75, 60);
        }
    } catch (e) {
        console.warn('No se pudo cargar el logo:', e);
    }

    // ── 2. Encabezados institucionales ──────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('CONTRALORÍA DEL ESTADO TÁCHIRA', pageWidth / 2, margin + 12, { align: 'center' });

    doc.setFontSize(9);
    doc.text('DIRECCIÓN GENERAL - DIVISIÓN DE SOPORTE TÉCNICO', pageWidth / 2, margin + 26, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(
        `- Historial de Actividades -`,
        pageWidth / 2,
        margin + 40,
        { align: 'center' }
    );

    const tableStartY = margin + 55;

    // ── 3. Calcular subtotales para el footer ────────────────────────────────
    const counts = [0, 0, 0, 0, 0, 0]; // SW-P, HW-P, SW-C, HW-C, Serv, Inf
    actividades.forEach(a => {
        if (a.clasificacion_id >= 1 && a.clasificacion_id <= 6) {
            counts[a.clasificacion_id - 1]++;
        }
    });

    // ── 4. Filas de datos ────────────────────────────────────────────────────
    const bodyRows = actividades.map((a, i) => {
        const clId = a.clasificacion_id;
        return [
            i + 1,
            new Date(a.fecha).toLocaleDateString('es-VE'),
            a.depto_nombre || '',
            a.tipo_act_nombre || '',
            a.equipo_nro_bien || '-',
            clId === 1 ? '1' : '',
            clId === 2 ? '1' : '',
            clId === 3 ? '1' : '',
            clId === 4 ? '1' : '',
            clId === 5 ? '1' : '',
            clId === 6 ? '1' : '',
            a.observaciones || '',
        ];
    });

    // Fila de subtotales
    bodyRows.push([
        { content: 'SUB TOTALES', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold', fillColor: [225, 230, 235] } },
        { content: counts[0], styles: { halign: 'center', fontStyle: 'bold', fillColor: [225, 230, 235] } },
        { content: counts[1], styles: { halign: 'center', fontStyle: 'bold', fillColor: [225, 230, 235] } },
        { content: counts[2], styles: { halign: 'center', fontStyle: 'bold', fillColor: [225, 230, 235] } },
        { content: counts[3], styles: { halign: 'center', fontStyle: 'bold', fillColor: [225, 230, 235] } },
        { content: counts[4], styles: { halign: 'center', fontStyle: 'bold', fillColor: [225, 230, 235] } },
        { content: counts[5], styles: { halign: 'center', fontStyle: 'bold', fillColor: [225, 230, 235] } },
        { content: '', styles: { fillColor: [225, 230, 235] } },
    ]);

    // Fila de total semanal
    bodyRows.push([
        { content: 'TOTAL SEMANAL', colSpan: 5, styles: { halign: 'right', fontStyle: 'bold', fillColor: [210, 218, 226] } },
        { content: actividades.length, colSpan: 6, styles: { halign: 'center', fontStyle: 'bold', fontSize: 10, fillColor: [210, 218, 226] } },
        { content: '', styles: { fillColor: [210, 218, 226] } },
    ]);

    // ── 5. Tabla con encabezado de dos niveles ───────────────────────────────
    autoTable(doc, {
        startY: tableStartY,
        margin: { left: margin, right: margin },
        tableWidth: contentWidth,

        // Cabecera de dos filas: primera fila con los grupos, segunda con subcategorías
        head: [
            [
                { content: 'Nro', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                { content: 'FECHA', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                { content: 'DIRECCIÓN SOLICITANTE', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                { content: 'DESCRIPCIÓN DEL REPORTE', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                { content: 'BM', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
                { content: 'MANT. PREVENTIVO', colSpan: 2, styles: { halign: 'center' } },
                { content: 'MANT. CORRECTIVO', colSpan: 2, styles: { halign: 'center' } },
                { content: 'PLAT. TECNOLÓGICA', colSpan: 2, styles: { halign: 'center' } },
                { content: 'OBSERVACIONES', rowSpan: 2, styles: { halign: 'center', valign: 'middle' } },
            ],
            [
                { content: 'SOFTWARE', styles: { halign: 'center' } },
                { content: 'HARDWARE', styles: { halign: 'center' } },
                { content: 'SOFTWARE', styles: { halign: 'center' } },
                { content: 'HARDWARE', styles: { halign: 'center' } },
                { content: 'SERVICIOS / REDES', styles: { halign: 'center' } },
                { content: 'INFORMES', styles: { halign: 'center' } },
            ],
        ],

        body: bodyRows,

        // Anchos de columna proporcionales (deben sumar contentWidth)
        columnStyles: {
            0: { cellWidth: 28, halign: 'center' },  // Nro
            1: { cellWidth: 55, halign: 'center' },  // Fecha
            2: { cellWidth: 100, halign: 'left' },    // Dirección
            3: { cellWidth: 100, halign: 'left' },    // Descripción
            4: { cellWidth: 35, halign: 'center' },  // BM
            5: { cellWidth: 35, halign: 'center' },  // SW-P
            6: { cellWidth: 35, halign: 'center' },  // HW-P
            7: { cellWidth: 35, halign: 'center' },  // SW-C
            8: { cellWidth: 35, halign: 'center' },  // HW-C
            9: { cellWidth: 50, halign: 'center' },  // Serv
            10: { cellWidth: 38, halign: 'center' },  // Inf
            11: { cellWidth: 'auto', halign: 'left' }, // Observaciones
        },

        styles: {
            fontSize: 7,
            cellPadding: 3,
            lineColor: [180, 180, 180],
            lineWidth: 0.3,
            overflow: 'linebreak',
            valign: 'middle',
        },

        headStyles: {
            fillColor: [225, 230, 235],
            textColor: [30, 30, 30],
            fontStyle: 'bold',
            fontSize: 7,
            halign: 'center',
            valign: 'middle',
        },

        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },

        // Número de página en el pie
        didDrawPage: (data) => {
            doc.setFontSize(7);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(120);
            doc.text(
                `Página ${doc.internal.getCurrentPageInfo().pageNumber}`,
                pageWidth - margin,
                pageHeight - 15,
                { align: 'right' }
            );
            doc.setTextColor(0);
        },
    });

    // ── 6. Guardar ───────────────────────────────────────────────────────────
    const fecha = new Date().toISOString().slice(0, 10);
    window.open(doc.output('bloburl'), '_blank');
};
