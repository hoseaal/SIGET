import jsPDF from "jspdf";
import helpFetch from "./helpFetch";

/**
 * Formatea un texto en Title Case con excepciones para preposiciones y palabras clave.
 */
const formatTitleCase = (text) => {
    if (!text) return "";
    return text
        .toLowerCase()
        .replace(/\b(\w)/g, (char) => char.toUpperCase())
        .replace(/\bDe\b/gi, "de")
        .replace(/\bDel\b/gi, "del")
        .replace(/\bY\b/gi, "y")
        .replace(/\bEn\b/gi, "en")
        .replace(/direccion/i, "Dirección");
};

/**
 * Genera un PDF de Informe de Tóner (ID 10 y 14) imitando el diseño de un memorando oficial.
 * 
 * @param {Object} mantenimiento - Datos del mantenimiento.
 * @param {Object} usuarioTecnico - Datos del técnico logueado.
 */
export const exportInformeTonerPDF = async (mantenimiento, usuarioTecnico) => {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter",
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 215.9 mm
    const margin = 25; // Margen de 25mm a cada lado
    const textWidth = pageWidth - 2 * margin; // 165.9 mm de ancho imprimible

    let currentY = 30; // Posición inicial en Y

    // --- Cabecera ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    // Fila 1: Para:
    doc.text("Para:", margin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text("Dra. Ruth Apolinar", margin + 15, currentY);
    doc.setFont("helvetica", "bold");
    doc.text("Directora de Administración", margin + 85, currentY);

    // Fila 2: De:
    currentY += 8;
    doc.text("De:", margin, currentY);
    doc.setFont("helvetica", "normal");
    const nombreTecnico = `${usuarioTecnico?.nombres || ''} ${usuarioTecnico?.apellidos || ''}`.trim() || "Técnico de Soporte";
    doc.text(nombreTecnico, margin + 15, currentY);
    doc.setFont("helvetica", "bold");
    doc.text("División Soporte Técnico.", margin + 85, currentY);

    // Fila 3: Fecha:
    currentY += 8;
    doc.text("Fecha:", margin, currentY);
    doc.setFont("helvetica", "normal");
    const today = new Date();
    const fechaStr = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}.`;
    doc.text(fechaStr, margin + 15, currentY);

    // Fila 4: Asunto:
    currentY += 8;
    doc.text("Asunto:", margin, currentY);
    doc.setFont("helvetica", "normal");
    doc.text("en el texto.", margin + 15, currentY);

    // Línea divisoria gruesa
    currentY += 6;
    doc.setLineWidth(1.2);
    doc.setDrawColor(0); // Negro
    doc.line(margin, currentY, pageWidth - margin, currentY);

    // --- Cuerpo del Documento ---
    currentY += 15;

    // Obtener variables del equipo y departamento con valores por defecto
    const tipo = formatTitleCase(mantenimiento.equipo_tipo_nombre) || "Impresora";
    const marca = mantenimiento.equipo_marca_nombre || "";
    const modelo = mantenimiento.equipo_modelo_nombre || "";
    const equipoFull = `${tipo} ${marca} ${modelo}`.trim();
    const nroBien = mantenimiento.equipo_nro_bien || "N/A";
    const depto = formatTitleCase(mantenimiento.depto_nombre) || "la Dirección solicitante";

    // Formatear la fecha de solicitud en español
    const requestDate = new Date(mantenimiento.fecha_solicitud);
    const reqDay = String(requestDate.getDate()).padStart(2, '0');
    const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
    const reqMonth = meses[requestDate.getMonth()];

    // Consultar si tiene tóner previo
    let tieneTonerPrevio = false;
    if (mantenimiento.equipo_id) {
        try {
            const response = await helpFetch.GET(`/mantenimiento/checkToner/${mantenimiento.equipo_id}?maintId=${mantenimiento.id}`);
            tieneTonerPrevio = response.tieneTonerPrevio;
        } catch (error) {
            console.error("Error comprobando tóner previo:", error);
        }
    }

    const textoAdicional = tieneTonerPrevio ? "" : " Cabe destacar que dicha impresora no tiene asignación anterior de toner.";
    const p1 = `Tengo a bien dirigirme a usted en la oportunidad de saludarle y notificarle que por oficio Nro. ${mantenimiento.nro_caso}, del día ${reqDay} de ${reqMonth} del año en curso se solicitó inspección técnica de la ${equipoFull}, con BM: ${nroBien} que se encuentra en ${depto}, la cual se encuentra en perfecto estado de funcionamiento, pero requiere cambio de consumible.${textoAdicional}`;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    // Justificar texto en jsPDF pasándole align y maxWidth
    doc.text(p1, margin, currentY, { align: "justify", maxWidth: textWidth });

    // Calcular salto de línea para el siguiente párrafo
    const splitP1 = doc.splitTextToSize(p1, textWidth);
    // 6 mm por línea + 8 mm de espaciado de párrafo
    currentY += (splitP1.length * 6.5) + 8;

    // Párrafo 2
    const p2 = "Sin más a que hace referencia, queda de usted,";
    doc.text(p2, margin, currentY);

    // --- Sección de Firmas ---
    currentY += 28;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Atte.", pageWidth / 2, currentY, { align: "center" });

    currentY += 22; // Espacio libre para firma manuscrita

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(nombreTecnico, pageWidth / 2, currentY, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    currentY += 5;
    doc.text("Dirección General – Unidad de Soporte Técnico.", pageWidth / 2, currentY, { align: "center" });

    currentY += 5;
    doc.text("Analista de Soporte Técnico PI", pageWidth / 2, currentY, { align: "center" });

    currentY += 4.5;
    doc.setFontSize(9);
    doc.text("Según resolución C.E.T. N° 145 del 22 de septiembre de 2022.", pageWidth / 2, currentY, { align: "center" });

    // Guardar PDF
    doc.save(`Informe_Toner_${mantenimiento.nro_caso || 'documento'}.pdf`);
};
