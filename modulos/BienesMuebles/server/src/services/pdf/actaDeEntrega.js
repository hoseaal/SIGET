import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// ... (tu función formatearFecha se queda igual) ...
const formatearFecha = (fechaRaw) => {
    if (!fechaRaw) return 'Sin Fecha';
    try {
        const date = new Date(fechaRaw);
        return date.toLocaleDateString('es-VE', { 
            day: '2-digit', month: '2-digit', year: 'numeric' 
        });
    } catch (e) { return fechaRaw; }
};

/**
 * NUEVA FUNCIÓN: Solo calcula la altura, no dibuja nada.
 */
const calcularAlturaFila = (doc, rowData, columnWidths, padding) => {
    let maxHeight = 0;
    rowData.forEach((cellText, i) => {
        const textHeight = doc.heightOfString(cellText, {
            width: columnWidths[i] - (padding * 2),
            align: 'left'
        });
        if (textHeight > maxHeight) maxHeight = textHeight;
    });
    return maxHeight + (padding * 2);
};

/**
 * Función modificada: Ahora recibe la altura ya calculada para asegurar consistencia
 */
const drawTableRow = (doc, y, rowData, columnWidths, rowHeight) => {
    const startX = doc.page.margins.left;
    let currentX = startX;
    const padding = 5;

    rowData.forEach((cellText, i) => {
        // Dibujar borde
        doc.rect(currentX, y, columnWidths[i], rowHeight).stroke();
        
        // Dibujar texto (limitando altura para que no desborde el cuadro si pdfkit calcula diferente por decimales)
        doc.text(cellText, currentX + padding, y + padding, {
            width: columnWidths[i] - (padding * 2),
            height: rowHeight - (padding * 2), 
            align: 'left',
            lineBreak: true 
        });
        currentX += columnWidths[i];
    });
};

export const generarActaDeEntrega = (datosReporte) => {
    return new Promise((resolve, reject) => {
        // Aumenté un poco el margen inferior para seguridad
        const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 40, bottom: 60, left: 50, right: 50 }, 
            autoFirstPage: true
        });

        const numeroLimpio = (datosReporte.numeroReporte || 'SN').replace(/[\/\\:*?"<>|]/g, '-');
        const outputPath = path.join(process.cwd(), 'temp', `Acta_de_Entrega_${numeroLimpio}.pdf`);
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);

        try {
            // --- Encabezado ---
            const logoPath = path.join(process.cwd(), 'public', 'img', 'logo-contraloria-home1.png');
            if (fs.existsSync(logoPath)) {
                doc.image(logoPath, 50, 40, { width: 70 });
            }

            doc.font('Helvetica-Bold').fontSize(10);
            doc.text(datosReporte.numeroReporte || 'Nº', 50, 90);
            doc.moveDown(2);

            doc.font('Helvetica-Bold').fontSize(14);
            doc.text('REPORTE DE MOVIMIENTO DE BIENES MUEBLES', { align: 'center' });
            doc.moveDown(1.5);

            // --- Información ---
            doc.font('Helvetica').fontSize(10);
            const fechaFormateada = formatearFecha(datosReporte.fechaReporte);
            
            // Usamos doc.text continuos para mantener el flujo
            doc.text(`Unidad Ejecutora: Contraloría del Estado Táchira`);
            doc.text(`Dirección o Unidad Administrativa: Dirección de Administracion`);
            doc.text(`Fecha del Reporte: ${fechaFormateada}`);
            doc.moveDown(1);

            // --- Configuración de Tabla ---
            const tableHeaders = ['Nº DE BIEN', 'DESCRIPCION DEL BIEN', 'EGRESA DE', 'INGRESA EN', 'OBSERVACIONES'];
            const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
            const columnWidths = [
                pageWidth * 0.10, 
                pageWidth * 0.30, 
                pageWidth * 0.15, 
                pageWidth * 0.15, 
                pageWidth * 0.30  
            ];

            let currentY = doc.y + 10;
            // Definimos el límite seguro antes del margen inferior
            const pageBottomLimit = doc.page.height - doc.page.margins.bottom;

            // Función para pintar cabecera
            const drawHeader = (yPos) => {
                doc.font('Helvetica-Bold').fontSize(8);
                // La cabecera tiene altura fija aprox o calculada pequeña
                const headerHeight = calcularAlturaFila(doc, tableHeaders, columnWidths, 5);
                drawTableRow(doc, yPos, tableHeaders, columnWidths, headerHeight);
                return headerHeight;
            }

            // Pintar primera cabecera
            let headerHeight = drawHeader(currentY);
            currentY += headerHeight;

            // --- Loop de Bienes (Lógica Corregida) ---
            doc.font('Helvetica').fontSize(8);
            
            datosReporte.bienes.forEach(item => {
                const rowData = [
                    item.bim_ide || '-',
                    item.bim_des || '-', // Descripción larga
                    datosReporte.departamentoOrigen || '-',
                    datosReporte.departamentoDestino || '-',
                    item.observacion || '-',
                ];

                // 1. PRE-CALCULAR altura necesaria
                const rowHeight = calcularAlturaFila(doc, rowData, columnWidths, 5);

                // 2. VERIFICAR espacio disponible
                // Si la posición actual + la altura de la fila supera el límite...
                if (currentY + rowHeight > pageBottomLimit) {
                    doc.addPage(); // Nueva página
                    currentY = doc.page.margins.top; // Reset Y
                    
                    // Repintar cabecera en nueva página
                    headerHeight = drawHeader(currentY);
                    currentY += headerHeight;
                    
                    doc.font('Helvetica').fontSize(8); // Restaurar fuente normal
                }

                // 3. DIBUJAR con seguridad
                drawTableRow(doc, currentY, rowData, columnWidths, rowHeight);
                currentY += rowHeight;
            });

            // --- Sección de Firmas (Bloque protegido) ---
            
            // Calculamos cuanto espacio necesitan las firmas (aprox 150-180 puntos)
            const alturaNecesariaFirmas = 200; 
            
            // Si no hay espacio suficiente para TODAS las firmas, saltamos pagina
            if (currentY + alturaNecesariaFirmas > pageBottomLimit) {
                doc.addPage();
                currentY = doc.page.margins.top + 20;
            } else {
                currentY += 40; // Espacio de separación con la tabla
            }

            doc.y = currentY; // Sincronizar el cursor interno de pdfkit

            // Configuración de columnas para firmas
            const leftX = doc.page.margins.left + 10;
            const rightX = (doc.page.width / 2) + 10;
            const signatureWidth = (doc.page.width / 2) - doc.page.margins.left - 20;

            doc.font('Helvetica').fontSize(10);
            
            // Guardamos la Y inicial de las firmas para alinearlas
            const firmaY = doc.y;

            // -- Firma Izquierda --
            doc.text('_________________________', leftX, firmaY, { width: signatureWidth, align: 'center' });
            doc.font('Helvetica-Bold').text(datosReporte.nombreDirectorAdmin || 'Director Origen', leftX, doc.y + 5, { width: signatureWidth, align: 'center' });
            doc.font('Helvetica').text(`Director(a) de ${datosReporte.departamentoOrigen}`, leftX, doc.y, { width: signatureWidth, align: 'center' });

            // -- Firma Derecha --
            // Reseteamos Y para que queden alineadas horizontalmente
            doc.y = firmaY; 
            doc.text('_________________________', rightX, firmaY, { width: signatureWidth, align: 'center' });
            doc.font('Helvetica-Bold').text(datosReporte.nombreJefeCompras || 'Jefe Compras', rightX, doc.y + 5, { width: signatureWidth, align: 'center' });
            doc.font('Helvetica').text('Jefe de Compras Bienes e Inventarios', rightX, doc.y, { width: signatureWidth, align: 'center' });

            // -- Firma Central (Abajo) --
            doc.moveDown(4); // Espacio vertical
            const centerX = doc.page.margins.left;
            const centerWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

            doc.font('Helvetica-Bold').text(`Por ${datosReporte.departamentoDestino}`, centerX, doc.y, { width: centerWidth, align: 'center' });
            doc.moveDown(3);
            doc.font('Helvetica').text('_________________________', centerX, doc.y, { width: centerWidth, align: 'center' });
            doc.font('Helvetica-Bold').text(datosReporte.nombreJefeDestino || 'Director Destino', centerX, doc.y + 5, { width: centerWidth, align: 'center' });
            doc.font('Helvetica').text(`Director(a) de ${datosReporte.departamentoDestino}`, centerX, doc.y, { width: centerWidth, align: 'center' });

            doc.end();

        } catch (error) {
            console.error("Error generando el PDF:", error);
            reject(error);
        }

        stream.on('finish', () => resolve(outputPath));
        stream.on('error', reject);
    });
};