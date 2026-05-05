import jsPDF from "jspdf";

/**
 * Genera un reporte PDF de la transferencia de equipo.
 * @param {Object} transferencia - Objeto con los datos de la transferencia.
 * @param {Object} tecnico - Objeto con los datos del técnico (opcional).
 */
export const generateTransferPDF = (transferencia, tecnico = null) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter",
    });

    const logoUrl = "/assets/img/logo-contraloria-home2.png";
    const title = "TRANSFERENCIA DE PAPELES";

    // Configuración de fuentes y colores
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);

    // Intentar cargar el logo (asincrónico pero jspdf permite añadir imágenes por URL si están en el mismo origen)
    // Para simplificar y asegurar que se imprima, podemos usar una técnica de cargar la imagen antes.
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
        // Encabezado
        doc.addImage(img, "PNG", 50, 25, 0, 25);

        doc.setFontSize(29);
        doc.text(title, 107, 20, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("CONTRALORÍA", 65, 35);
        doc.text("DEL ESTADO", 65, 40);
        doc.text("TÁCHIRA", 65, 45);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);

        // Fecha
        const hoy = new Date();
        const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        const fechaStr = `San Cristóbal ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}.`;
        doc.text(fechaStr, 123, 30);

        // De y Para
        doc.setFont("helvetica", "bold");
        doc.text("De:", 123, 37);
        doc.setFont("helvetica", "normal");
        const deLines = doc.splitTextToSize("División de Soporte Técnico planificacon y sooprte", 60);
        doc.text(deLines, 135, 37);

        // Calculamos el Y para el siguiente campo basado en cuántas líneas ocupó el anterior
        // Cada línea mide aprox 5mm con fuente 11
        const nextY = 38 + (deLines.length * 5);

        doc.setFont("helvetica", "bold");
        doc.text("Para:", 123, nextY);
        doc.setFont("helvetica", "normal");
        const paraLines = doc.splitTextToSize("Departamento Solicitante asidjadi ajdiajsd", 60);
        doc.text(paraLines, 135, nextY);
        // Asunto
        doc.setFont("helvetica", "bold");
        doc.text("Asunto:", 25, nextY + 15);
        const diagnostico = transferencia.diagnostico_tecnico || "No especificado";
        const solucion = transferencia.solucion_tecnica || "Mantenimiento realizado";
        const bien = transferencia.equipo_nro_bien || "N/A";

        const cuerpoTexto = `Reciba un cordial saludo, sirva la presente para hacer entrega del bien mueble ${bien}, el cual la de presentaba ${diagnostico}, ${solucion}. El equipo está operativo.`;

        // Texto con salto de línea automático
        const textLines = doc.splitTextToSize(cuerpoTexto, 180);
        doc.setFont("helvetica", "normal");
        doc.text(textLines, 25, nextY + 20);

        // Espacio para firmas
        const footerY = nextY + 35 + (textLines.length * 5);
        doc.line(45, footerY, 100, footerY); // Línea Despachado
        doc.line(130, footerY, 190, footerY); // Línea Recibido

        doc.setFont("helvetica", "bold");
        doc.text("Despachado:", 20, footerY);
        doc.text("Recibido:", 110, footerY);

        doc.setFont("helvetica", "normal");

        // Pie de página con el número de caso
        doc.setFontSize(8);
        doc.text(`Caso #: ${transferencia.nro_caso} | Generado por SIGET`, 105, 260, { align: "center" });

        window.open(doc.output('bloburl'), '_blank');
    };

    img.onerror = () => {
        console.error("Error al cargar el logo para el PDF");
        // Proceder sin logo si falla
        doc.setFontSize(22);
        doc.text(title, 105, 25, { align: "center" });
        // ... (rest of the logic without image)
        // I'll just trigger the same logic but without addImage
        doc.setFontSize(11);
        const hoy = new Date();
        const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
        const fechaStr = `San Cristóbal ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}.`;
        doc.text(fechaStr, 195, 45, { align: "right" });
        doc.setFont("helvetica", "bold");
        doc.text("De:", 20, 55);
        doc.setFont("helvetica", "normal");
        doc.text("División de Soporte Técnico", 30, 55);
        doc.setFont("helvetica", "bold");
        doc.text("Para:", 20, 65);
        doc.setFont("helvetica", "normal");
        doc.text(transferencia.origen_nombre || "Departamento Solicitante", 35, 65);
        doc.setFont("helvetica", "bold");
        doc.text("Asunto:", 20, 80);
        const diagnostico = transferencia.diagnostico_tecnico || "No especificado";
        const solucion = transferencia.solucion_tecnica || "Mantenimiento realizado";
        const bien = transferencia.equipo_nro_bien || "N/A";
        const cuerpoTexto = `Reciba un cordial saludo, sirva la presente para hacer entrega del bien mueble ${bien}, el cual presentaba ${diagnostico}, ${solucion}. El equipo está operativo.`;
        const textLines = doc.splitTextToSize(cuerpoTexto, 175);
        doc.text(textLines, 38, 80);
        const footerY = 180;
        doc.line(20, footerY, 90, footerY);
        doc.line(125, footerY, 195, footerY);
        doc.setFont("helvetica", "bold");
        doc.text("Despachado:", 20, footerY);
        doc.text("Recibido:", 125, footerY);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.text(`Caso #: ${transferencia.nro_caso} | Generado por SIGET`, 105, 260, { align: "center" });
        window.open(doc.output('bloburl'), '_blank');
    };
};
