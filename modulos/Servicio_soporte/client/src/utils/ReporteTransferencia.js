import jsPDF from "jspdf";

/**
 * Genera un reporte PDF duplicado (Copia Institución / Copia Usuario)
 * con texto justificado y diseño profesional.
 * 
 * @param {Object} transferencia - Datos de la transferencia.
 * @param {Object} tecnico - Datos del técnico (opcional).
 * @param {string} tipo - Tipo de texto: 'entrega' (por defecto) o 'entrega_revision'.
 */
export const generateTransferPDF = (transferencia, tecnico = null, tipo = 'entrega') => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter",
    });

    const logoUrl = "/assets/img/logo-contraloria-home2.png";
    const title = "TRANSFERENCIA DE PAPELES";

    const img = new Image();
    img.src = logoUrl;

    // Función interna para dibujar el contenido y evitar duplicar código
    const drawContent = (startY) => {
        // --- Encabezado ---
        if (img.complete && img.naturalWidth !== 0) {
            doc.addImage(img, "PNG", 50, startY + 25, 0, 25);
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(28);
        doc.text(title, 107, startY + 20, { align: "center" });

        doc.setFontSize(10);
        doc.text("CONTRALORÍA", 65, startY + 35);
        doc.text("DEL ESTADO", 65, startY + 40);
        doc.text("TÁCHIRA", 65, startY + 45);

        // --- Información de Fecha y Cabecera ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        const hoy = new Date();
        const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        const fechaStr = `San Cristóbal ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}.`;
        doc.text(fechaStr, 123, startY + 30);

        doc.setFont("helvetica", "bold");
        doc.text("De:", 123, startY + 37);
        doc.setFont("helvetica", "normal");
        const deValue = tipo === 'entrega'
            ? (transferencia.destino_nombre || "Servicio Técnico")
            : (transferencia.origen_nombre || "Departamento de Origen");
        const deLines = doc.splitTextToSize(deValue, 60);
        doc.text(deLines, 135, startY + 37);

        const nextY = startY + 38 + (deLines.length * 5);

        doc.setFont("helvetica", "bold");
        doc.text("Para:", 123, nextY);
        doc.setFont("helvetica", "normal");
        const paraValue = tipo === 'entrega'
            ? (transferencia.origen_nombre || "Departamento de Origen")
            : (transferencia.destino_nombre || "Servicio Técnico");
        const paraLines = doc.splitTextToSize(paraValue, 60);
        doc.text(paraLines, 135, nextY);

        // --- Cuerpo del Reporte (Texto Justificado) ---
        doc.setFont("helvetica", "bold");
        doc.text("Asunto:", 25, nextY + 8);

        const diagnostico = transferencia.diagnostico_tecnico || "No especificado";
        const solucion = transferencia.solucion_tecnica || "Mantenimiento realizado";
        const bien = transferencia.equipo_nro_bien || "N/A";
        const tipoEquipo = transferencia.equipo_tipo || "equipo";
        let cuerpoTexto;
        if (tipo === 'entrega_revision') {
            cuerpoTexto = `Reciba un cordial saludo, sirva la presente para hacer entrega del bien mueble ${bien} (${tipoEquipo}), para su revisión.`;
        } else {
            cuerpoTexto = `Reciba un cordial saludo, sirva la presente para hacer entrega del bien mueble ${bien}, el cual presentaba ${diagnostico}, ${solucion}. El equipo está operativo.`;
        }

        doc.setFont("helvetica", "normal");
        // align: "justify" requiere el parámetro maxWidth para funcionar
        doc.text(cuerpoTexto, 25, nextY + 13, {
            align: "justify",
            maxWidth: 165
        });

        // --- Espacio para Firmas ---
        // Calculamos la posición de las firmas un poco más abajo del texto
        const footerY = nextY + 60;
        doc.setLineWidth(0.5);
        doc.line(30, footerY + 5, 90, footerY + 5); // Línea Despachado
        doc.line(120, footerY + 5, 180, footerY + 5); // Línea Recibido

        doc.setFont("helvetica", "bold");
        doc.text("Despachado", 60, footerY + 10, { align: "center" });
        doc.text("Recibido", 150, footerY + 10, { align: "center" });

        // --- Pie de página de la sección ---
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Caso #: ${transferencia.nro_caso} | Generado por SIGET`, 105, startY + 132, { align: "center" });
    };

    img.onload = () => {
        // Dibujar parte superior
        drawContent(0);

        // Línea divisoria punteada para el corte
        doc.setLineDash([2, 2], 0);
        doc.setDrawColor(150); // Color gris suave para la línea
        doc.line(10, 139, 205, 139);
        doc.setLineDash([], 0); // Resetear estilo de línea

        // Dibujar parte inferior (Copia) con un offset de 140mm
        drawContent(140);

        doc.save(`Transferencia_${transferencia.nro_caso || 'documento'}.pdf`);
    };

    img.onerror = () => {
        console.error("Error al cargar el logo para el PDF");
        // Generar el reporte aunque el logo falle
        drawContent(0);
        drawContent(140);
        doc.save(`Transferencia_${transferencia.nro_caso || 'documento'}.pdf`);
    };
};