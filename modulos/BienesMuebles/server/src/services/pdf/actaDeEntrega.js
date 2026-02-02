/* eslint-disable no-unused-vars */
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Función auxiliar para formatear fechas
 */
const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return 'Sin Fecha';
    try {
        const date = new Date(fechaRaw);
        // Ajusta esto según el formato que prefieras (ej: 'es-VE')
        return date.toLocaleDateString('es-VE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
    } catch (e) {
        return fechaRaw;
    }
};

/**
 * Dibuja una fila de la tabla, ajustando la altura dinámicamente.
 * @param {PDFDocument} doc - La instancia del documento PDF.
 * @param {number} y - La posición Y inicial de la fila.
 * @param {Array<string>} rowData - Los datos de la fila.
 * @param {Array<number>} columnWidths - Los anchos de las columnas.
 * @returns {number} La altura de la fila dibujada.
 */
const drawTableRow = (doc, y, rowData, columnWidths) => {
    const startX = doc.page.margins.left;
    let currentX = startX;
    const padding = 5;
    let maxHeight = 0;

    // 1. Calcular la altura máxima necesaria para esta fila
    rowData.forEach((cellText, i) => {
        const textHeight = doc.heightOfString(cellText, {
            width: columnWidths[i] - (padding * 2),
        });
        if (textHeight > maxHeight) {
            maxHeight = textHeight;
        }
    });

    // Añadimos un poco de padding vertical
    const rowHeight = maxHeight + (padding * 2);

    // 2. Dibujar las celdas y el texto
    rowData.forEach((cellText, i) => {
        // Dibujar el borde de la celda
        doc.rect(currentX, y, columnWidths[i], rowHeight).stroke();
        // Dibujar el texto centrado verticalmente
        doc.text(cellText, currentX + padding, y + padding, {
            width: columnWidths[i] - (padding * 2),
            align: 'left',
        });
        currentX += columnWidths[i];
    });

    return rowHeight; // Devolvemos la altura de la fila para la siguiente posición
};


export const generarActaDeEntrega = (datosReporte) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 40, bottom: 40, left: 50, right: 50 }
        });

        // 1. Sanitizar el número
        const numeroLimpio = (datosReporte.numeroReporte || 'SN').replace(/[\/\\:*?"<>|]/g, '-');

        // 2. Usar el número limpio en la ruta
        const outputPath = path.join(process.cwd(), 'temp', `Acta_de_Entrega_${numeroLimpio}.pdf`);

        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        try {
            // --- Encabezado ---
            const logoPath = path.join(process.cwd(), 'public', 'img', 'logo-contraloria-home1.png')
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, doc.page.margins.left, doc.page.margins.top, { width: 70 })
            } else {
                console.warn(`Logo not found at ${logoPath}. Skipping logo.`)
            }

            doc.font('Helvetica-Bold').fontSize(10);
            doc.text(datosReporte.numeroReporte || 'Nº', doc.page.margins.left, doc.page.margins.top + 50, { align: 'left' });
            doc.moveDown(4);

            // --- Título Principal ---
            doc.font('Helvetica-Bold').fontSize(14);
            doc.text('REPORTE DE MOVIMIENTO DE BIENES MUEBLES', { align: 'center' });
            doc.moveDown(2);

            // --- Sección de Información ---
            doc.font('Helvetica').fontSize(10);
            const infoX = doc.page.margins.left;
            
            // CORRECCIÓN 1: Formato de Fecha limpio
            const fechaFormateada = formatearFecha(datosReporte.fechaReporte);

            doc.text(`Unidad Ejecutora: Contraloría del Estado Táchira`, infoX);
            doc.text(`Dirección o Unidad Administrativa: Dirección de Administracion`, infoX);
            doc.text(`Fecha del Reporte: ${fechaFormateada}`, infoX);
            doc.moveDown(2);

            // --- Sección de la Tabla ---
            const tableHeaders = ['Nº DE BIEN', 'DESCRIPCION DEL BIEN', 'EGRESA DE', 'INGRESA EN', 'OBSERVACIONES'];
            const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
            
            const columnWidths = [
                tableWidth * 0.10, // Nº DE BIEN
                tableWidth * 0.30, // DESCRIPCION DEL BIEN
                tableWidth * 0.15, // EGRESA DE
                tableWidth * 0.15, // INGRESA EN
                tableWidth * 0.30  // OBSERVACIONES
            ];

            let currentY = doc.y;
            const startX = doc.page.margins.left;

            // Dibujar cabeceras
            doc.font('Helvetica-Bold').fontSize(8);
            const headerHeight = drawTableRow(doc, currentY, tableHeaders, columnWidths);
            currentY += headerHeight;

            // Dibujar filas de datos
            doc.font('Helvetica').fontSize(8);
            datosReporte.bienes.forEach(item => {
                // Si la siguiente fila no cabe, crea una nueva página
                if (currentY > doc.page.height - doc.page.margins.bottom - 50) { 
                    doc.addPage();
                    currentY = doc.page.margins.top;
                    // Redibujar cabeceras en la nueva página
                    doc.font('Helvetica-Bold').fontSize(8);
                    const newHeaderHeight = drawTableRow(doc, currentY, tableHeaders, columnWidths);
                    currentY += newHeaderHeight;
                    doc.font('Helvetica').fontSize(8);
                }

                const rowData = [
                    item.bim_ide || '-',
                    item.bim_des || '-',
                    datosReporte.departamentoOrigen || '-',
                    datosReporte.departamentoDestino || '-',
                    item.observacion || '-',
                ];
                const rowHeight = drawTableRow(doc, currentY, rowData, columnWidths);
                currentY += rowHeight;
            });
            
            doc.y = currentY; // Actualizar la posición Y del documento
            doc.moveDown(5);
            doc.moveDown(6) 
            
            // --- Sección de Firmas (CORREGIDA) ---
            doc.font('Helvetica').fontSize(10);
            const signatureY = doc.y;
            const leftColumnX = doc.page.margins.left + 20;
            const rightColumnX = doc.page.width / 2 + 20;
            const signatureWidth = (doc.page.width / 2) - doc.page.margins.left - 10;
            
            // CORRECCIÓN 2: Firma Izquierda (Director de ORIGEN / Egresa)
            doc.text('_________________________', leftColumnX, signatureY, { width: signatureWidth, align: 'center' });
            doc.moveDown(0.5);
            // Se asume que datosReporte tiene 'nombreDirectorOrigen' o similar. 
            // Si no, ajusta el nombre de la propiedad según venga en 'datosReporte'.
            doc.font('Helvetica-Bold').text(datosReporte.nombreDirectorAdmin || 'Director de Origen', leftColumnX, doc.y, { width: signatureWidth, align: 'center' });
            doc.font('Helvetica').text(`Director(a) de ${datosReporte.departamentoOrigen}`, leftColumnX, doc.y, { width: signatureWidth, align: 'center' });

            // CORRECCIÓN 2: Firma Derecha (Jefe de Compras - Fijo)
            doc.y = signatureY; // Reset Y a la misma altura
            doc.text('_________________________', rightColumnX, signatureY, { width: signatureWidth, align: 'center' });
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').text(datosReporte.nombreJefeCompras || 'Nombre Jefe Compras', rightColumnX, doc.y, { width: signatureWidth, align: 'center' });
            doc.font('Helvetica').text('Jefe de Compras Bienes, e inventarios', rightColumnX, doc.y, { width: signatureWidth, align: 'center' });
            
            doc.moveDown(4);

            // CORRECCIÓN 2: Firma Centro (Director de DESTINO / Ingresa)
            doc.font('Helvetica-Bold').fontSize(10)
            doc.text(`Por ${datosReporte.departamentoDestino}`, doc.page.margins.left, doc.y, {
                width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
                align: 'center'
            })
            doc.moveDown(4);
            doc.font('Helvetica').fontSize(10)
            doc.text('_________________________', doc.page.margins.left, doc.y, {
                width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
                align: 'center'
            })
            doc.moveDown(0.1);
            doc.font('Helvetica-Bold').fontSize(10)
            doc.text(`${datosReporte.nombreJefeDestino}`, doc.page.margins.left, doc.y, {
                width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
                align: 'center'
            })
            doc.font('Helvetica').fontSize(10)
            doc.text(`Director(a) de ${datosReporte.departamentoDestino}`, doc.page.margins.left, doc.y, {
                width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
                align: 'center'
            })

            // Finalizar el archivo PDF
            doc.end();

        } catch (error) {
            console.error("Error generando el PDF:", error);
            reject(error);
        }

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
    });
};