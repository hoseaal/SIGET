// Utilidades compartidas para mostrar errores de formularios y del servidor
// directamente dentro de los modales de registro.

const ETIQUETAS_CAMPOS = {
    cedula: 'Cédula de identidad',
    nombres: 'Nombres',
    apellidos: 'Apellidos',
    rif: 'RIF',
    fecha_nacimiento: 'Fecha de nacimiento',
    lugar_nacimiento: 'Lugar de nacimiento',
    genero: 'Género',
    estado_civil: 'Estado civil',
    tipo_sangre: 'Tipo de sangre',
    direccion_habitacion: 'Dirección de habitación',
    telefono_fijo: 'Teléfono fijo',
    celular: 'Celular',
    correo_principal: 'Correo electrónico',
    correo_secundario: 'Correo electrónico secundario',
    cuenta_bancaria: 'Número de cuenta bancaria',
    nro_cuenta_bancaria: 'Número de cuenta bancaria',
    fecha_ingreso: 'Fecha de ingreso',
    fecha_ingreso_pension: 'Fecha de ingreso a pensión',
    motivo_pension: 'Motivo de pensión',
    observacion: 'Observación',
    profesion_id: 'Profesión',
    prima_profesional_id: 'Escala de profesionalización',
    cargo_cet_id: 'Cargo CET',
    cargo_onapre_id: 'Clasificación ONAPRE',
    nivel_salarial_id: 'Nivel salarial',
    condicion_laboral_id: 'Condición laboral',
    direccion_id: 'Dirección de adscripción',
    division_id: 'División',
    unidad_id: 'Unidad',
    contacto_emergencia_1: 'Contacto de emergencia 1',
    telefono_emergencia_1: 'Teléfono de emergencia 1',
    contacto_emergencia_2: 'Contacto de emergencia 2',
    telefono_emergencia_2: 'Teléfono de emergencia 2',
    deportes: 'Deportes',
    actividades_culturales: 'Actividades culturales',
    familiar_cedula: 'Cédula del familiar',
    familiar_nombres: 'Nombres del familiar',
    familiar_apellidos: 'Apellidos del familiar',
    familiar_fecha_nacimiento: 'Fecha de nacimiento del familiar',
    familiar_parentesco: 'Parentesco del familiar',
    familiar_direccion: 'Dirección del familiar',
    familiar_telefono: 'Teléfono del familiar',
    familiar_cuenta_bancaria: 'Cuenta bancaria del familiar',
    familiar_fecha_ingreso_beneficio: 'Fecha de ingreso al beneficio',
    familiar_observacion: 'Observación del familiar',
};

export const obtenerEtiquetaCampo = (campo, etiquetas = {}) => {
    if (!campo) return '';
    return etiquetas[campo] || ETIQUETAS_CAMPOS[campo] || campo.replace(/_/g, ' ');
};

/**
 * Lee la respuesta del servidor sin romper el flujo si el cuerpo no es JSON.
 */
export const leerRespuestaJson = async (response) => {
    const texto = await response.text();
    if (!texto) return {};

    try {
        return JSON.parse(texto);
    } catch {
        return { message: texto };
    }
};

const convertirAMensaje = (valor) => {
    if (valor === null || valor === undefined) return '';
    if (typeof valor === 'string') return valor;
    if (typeof valor === 'number' || typeof valor === 'boolean') return String(valor);
    if (Array.isArray(valor)) {
        return valor.map(convertirAMensaje).filter(Boolean).join(' ');
    }
    if (typeof valor === 'object') {
        return convertirAMensaje(
            valor.error ?? valor.message ?? valor.mensaje ?? valor.msg ?? valor.detail ?? valor.details
        );
    }
    return '';
};

/**
 * Extrae un mensaje legible desde las distintas formas de respuesta del backend.
 */
export const obtenerMensajeError = (payload, fallback = 'No se pudo completar la operación.') => {
    const mensaje = convertirAMensaje(
        payload?.error ?? payload?.message ?? payload?.mensaje ?? payload?.details ?? payload?.detail ?? payload?.data
    );

    return mensaje || fallback;
};

/**
 * Devuelve los campos que se mencionan en un mensaje del servidor.
 */
export const obtenerCamposAfectados = (mensaje, reglas = []) => {
    if (!mensaje) return [];

    return [...new Set(
        reglas
            .filter(({ patron }) => patron.test(mensaje))
            .map(({ campo }) => campo)
            .filter(Boolean)
    )];
};

/**
 * Traduce errores técnicos de MySQL a mensajes entendibles y al campo afectado.
 */
export const detectarErrorDeBD = (mensaje, etiquetas = {}) => {
    if (!mensaje) return null;

    let match = mensaje.match(/Column '([^']+)' cannot be null/i);
    if (match) {
        const campo = match[1];
        return {
            campo,
            mensaje: `El campo "${obtenerEtiquetaCampo(campo, etiquetas)}" es obligatorio.`
        };
    }

    match = mensaje.match(/Field '([^']+)' doesn't have a default value/i);
    if (match) {
        const campo = match[1];
        return {
            campo,
            mensaje: `El campo "${obtenerEtiquetaCampo(campo, etiquetas)}" es obligatorio.`
        };
    }

    match = mensaje.match(/Data too long for column '([^']+)'/i);
    if (match) {
        const campo = match[1];
        return {
            campo,
            mensaje: `El valor de "${obtenerEtiquetaCampo(campo, etiquetas)}" es demasiado largo. Acórtelo e intente nuevamente.`
        };
    }

    match = mensaje.match(/Incorrect date value: '([^']*)' for column '([^']+)'/i);
    if (match) {
        const campo = match[2];
        return {
            campo,
            mensaje: `La fecha ingresada en "${obtenerEtiquetaCampo(campo, etiquetas)}" no es válida.`
        };
    }

    match = mensaje.match(/Incorrect (?:integer|decimal|double|float) value: '([^']*)' for column '([^']+)'/i);
    if (match) {
        const campo = match[2];
        return {
            campo,
            mensaje: `El valor seleccionado en "${obtenerEtiquetaCampo(campo, etiquetas)}" no es válido.`
        };
    }

    match = mensaje.match(/Out of range value for column '([^']+)'/i);
    if (match) {
        const campo = match[1];
        return {
            campo,
            mensaje: `El valor de "${obtenerEtiquetaCampo(campo, etiquetas)}" está fuera del rango permitido.`
        };
    }

    match = mensaje.match(/Duplicate entry '([^']*)' for key '([^']+)'/i);
    if (match) {
        const nombreClave = match[2].split('.').pop().replace(/[`'"]/g, '').toLowerCase();
        let campo = nombreClave;

        if (nombreClave.includes('cedula')) campo = 'cedula';
        else if (nombreClave.includes('rif')) campo = 'rif';
        else if (nombreClave.includes('cuenta')) campo = 'cuenta_bancaria';

        return {
            campo,
            mensaje: `Ya existe un registro con el mismo valor en "${obtenerEtiquetaCampo(campo, etiquetas)}".`
        };
    }

    if (/foreign key constraint fails/i.test(mensaje)) {
        return {
            campo: null,
            mensaje: 'Uno de los valores seleccionados ya no está disponible. Actualice la lista y vuelva a intentarlo.'
        };
    }

    return null;
};

/**
 * Crea el objeto que consume el componente FormFeedback.
 */
export const crearFeedbackDeError = ({
    titulo = 'No se pudo completar el registro',
    mensaje,
    errores = {},
    etiquetas = {},
    sugerencia
}) => ({
    type: 'danger',
    title: titulo,
    message: mensaje,
    items: Object.entries(errores).map(([campo, detalle]) => ({
        label: obtenerEtiquetaCampo(campo, etiquetas),
        message: detalle || 'Revise este dato e intente nuevamente.'
    })),
    hint: sugerencia || 'Los datos que ya ingresó se conservan. Corrija los campos señalados y vuelva a intentarlo.'
});

/**
 * Mensaje corto para el campo afectado según el tipo de error del servidor.
 */
export const mensajeParaCampo = (mensaje = '') => {
    if (/ya existe|duplicad/i.test(mensaje)) {
        return 'Ya existe un registro con este dato. Verifique e ingrese uno diferente.';
    }
    if (/obligatori|requerid|no puede.*vac[ií]o|faltan/i.test(mensaje)) {
        return 'Este dato es obligatorio.';
    }
    if (/no existe|no encontrad/i.test(mensaje)) {
        return 'El valor seleccionado no existe o ya no está disponible.';
    }
    if (/no corresponde/i.test(mensaje)) {
        return 'El valor seleccionado no es válido para este tipo de registro.';
    }
    return 'Revise este dato e intente nuevamente.';
};

/**
 * Normaliza errores de red para mostrar un texto útil al usuario.
 */
export const obtenerMensajeDeExcepcion = (error, fallback = 'Ocurrió un error inesperado. Intente nuevamente.') => {
    if (!error) return fallback;

    const mensaje = error.message || '';
    if (error instanceof TypeError || /failed to fetch|networkerror|load failed|fetch failed/i.test(mensaje)) {
        return 'No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.';
    }

    return mensaje || fallback;
};
