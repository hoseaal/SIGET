import pool from '../utils/database.js';

/**
 * GET /api/rrhh/mi-perfil/nomina
 *
 * Devuelve el historial de recibos de nómina del empleado autenticado.
 * - Si es Visualizador: el middleware `requireEmployeeScope` ya garantizó
 *   que req.query.empleado_id = req.user.empleado_id (inmutable).
 * - Si es Administrador: puede consultar cualquier empleado vía ?empleado_id=X.
 */
export const getMiNomina = async (req, res) => {
  try {
    // Para el Visualizador, este valor ya fue forzado por requireEmployeeScope.
    // Para un Admin, viene del query param que él mismo envía.
    const { empleado_id } = req.query;

    // --- DOBLE VALIDACIÓN DE SEGURIDAD ---
    // Validación 1: el empleado_id siempre debe existir en este punto.
    if (!empleado_id) {
      return res.status(400).json({ error: 'Se requiere un ID de empleado' });
    }

    // Validación 2 (la más importante): si el usuario es Visualizador,
    // el empleado_id solicitado DEBE coincidir con el suyo propio.
    // Aunque requireEmployeeScope ya lo garantiza, esta línea es una segunda
    // capa de defensa defensiva (Defense in Depth).
    if (req.user.nombre_rol === 'Visualizador' &&
      Number(empleado_id) !== Number(req.user.empleado_id)) {
      return res.status(403).json({ error: 'Acceso denegado: no puedes consultar datos de otros empleados' });
    }

    // --- CONSULTA SQL AISLADA ---
    // La cláusula WHERE usa estrictamente el empleado_id validado,
    // nunca un valor crudo del usuario.
    const [recibos] = await pool.query(
      `SELECT 
          hp.id_historial AS historial_id,
          CONCAT(hp.quincena_no, ' quincena ', hp.mes, '-', hp.anio) AS periodo,
          hp.fecha_registro AS fecha_pago,
          hp.tipo_personal AS tipo_nomina,
          hp.salario_neto AS monto_total,
          hp.fecha_registro AS creado_en
       FROM historial_pagos hp
       WHERE hp.empleado_id = ?   -- Aislamiento garantizado
       ORDER BY hp.anio DESC, hp.mes DESC, hp.quincena_no DESC
       LIMIT 24`,
      [Number(empleado_id)]  // Forzado a número para evitar inyección de tipo
    );

    return res.json({
      empleado_id: Number(empleado_id),
      total: recibos.length,
      recibos
    });

  } catch (error) {
    console.error('Error en getMiNomina:', error);
    return res.status(500).json({ error: 'Error interno del servidor', detail: error.message });
  }
};


/**
 * GET /api/rrhh/mi-perfil/datos-laborales
 *
 * Devuelve los datos laborales del empleado autenticado.
 * Mismo patrón de aislamiento que getMiNomina.
 */
export const getMisDatosLaborales = async (req, res) => {
  try {
    const { empleado_id } = req.query;

    if (!empleado_id) {
      return res.status(400).json({ error: 'Se requiere un ID de empleado' });
    }

    if (req.user.nombre_rol === 'Visualizador' &&
      Number(empleado_id) !== Number(req.user.empleado_id)) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const [rows] = await pool.query(
      `SELECT 
          e.nombres, e.apellidos, e.cedula,
          e.fecha_nacimiento, e.genero, e.estado_civil,
          e.fecha_ingreso, e.correo_principal, e.celular, e.telefono_fijo,
          dl.condicion_laboral_id,
          cet.nombre AS cargo_cet_nombre,
          ona.nombre AS cargo_onapre_nombre,
          niv.salario_base,
          dir.nombre AS direccion_nombre,
          divi.nombre AS division_nombre,
          uni.nombre AS unidad_nombre,
          cl.nombre AS condicion_laboral
       FROM empleados e
       LEFT JOIN datos_laborales dl ON e.empleado_id = dl.empleado_id
       LEFT JOIN cargos_cet cet ON dl.cargo_cet_id = cet.cargo_cet_id
       LEFT JOIN cargos_onapre ona ON dl.cargo_onapre_id = ona.cargo_onapre_id
       LEFT JOIN niveles_salariales niv ON dl.nivel_salarial_id = niv.nivel_salarial_id
       LEFT JOIN direcciones dir ON dl.direccion_id = dir.direccion_id
       LEFT JOIN divisiones divi ON dl.division_id = divi.division_id
       LEFT JOIN unidades uni ON dl.unidad_id = uni.unidad_id
       LEFT JOIN condiciones_laborales cl ON dl.condicion_laboral_id = cl.condicion_laboral_id
       WHERE e.empleado_id = ?`,

      [Number(empleado_id)]
    );

    if (!rows[0]) {
      return res.status(404).json({ error: 'Empleado no encontrado' });
    }

    return res.json(rows[0]);

  } catch (error) {
    console.error('Error en getMisDatosLaborales:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getMisAntiguedades = async (req, res) => {
  try {
    const { empleado_id } = req.query;
    if (!empleado_id) return res.status(400).json({ error: 'Se requiere un ID de empleado' });

    const [rows] = await pool.query(
      `SELECT ra.antiguedad_id, ra.fecha_inicio AS fecha_ingreso, ra.fecha_fin AS fecha_egreso,
        COALESCE(ci.nombre, ra.institucion_alternativa) AS institucion,
        TIMESTAMPDIFF(YEAR, ra.fecha_inicio, COALESCE(ra.fecha_fin, CURDATE())) AS anios_reconocidos,
        TIMESTAMPDIFF(MONTH, ra.fecha_inicio, COALESCE(ra.fecha_fin, CURDATE())) % 12 AS meses_reconocidos,
        DATEDIFF(
            COALESCE(ra.fecha_fin, CURDATE()), 
            ra.fecha_inicio + INTERVAL TIMESTAMPDIFF(MONTH, ra.fecha_inicio, COALESCE(ra.fecha_fin, CURDATE())) MONTH
        ) AS dias_reconocidos
       FROM registros_antiguedades ra
       LEFT JOIN catalogo_instituciones ci ON ra.id_institucion = ci.id_institucion
       WHERE ra.empleado_id = ?
       ORDER BY ra.fecha_inicio DESC`,
      [Number(empleado_id)]
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error en getMisAntiguedades:', error);
    return res.status(500).json({ error: 'Error interno del servidor', detail: error.message });
  }
};

export const getMisEncargos = async (req, res) => {
  try {
    const { empleado_id } = req.query;
    if (!empleado_id) return res.status(400).json({ error: 'Se requiere un ID de empleado' });

    const [rows] = await pool.query(
      `SELECT e.encargo_id, e.fecha_inicio, e.fecha_fin, e.estatus_encargo,
              c.nombre AS cargo_cet, n.salario_base, d.nombre AS direccion
       FROM encargos_temporales e
       LEFT JOIN cargos_cet c ON e.cargo_cet_id = c.cargo_cet_id
       LEFT JOIN niveles_salariales n ON e.nivel_salarial_id = n.nivel_salarial_id
       LEFT JOIN direcciones d ON e.direccion_id = d.direccion_id
       WHERE e.empleado_id = ?
       ORDER BY e.fecha_inicio DESC`,
      [Number(empleado_id)]
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error en getMisEncargos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getMisVacaciones = async (req, res) => {
  try {
    const { empleado_id } = req.query;
    if (!empleado_id) return res.status(400).json({ error: 'Se requiere un ID de empleado' });

    const [rows] = await pool.query(
      `SELECT 
          v.id_vacaciones AS vacacion_id, 
          YEAR(v.fecha_tope) AS periodo, 
          fv.fecha_inicio, 
          fv.fecha_fin, 
          fv.dias_habiles AS dias_disfrute, 
          sv.descripcion AS estatus
       FROM vacaciones v
       JOIN fechas_vacaciones fv ON v.id_vacaciones = fv.id_vacaciones
       LEFT JOIN status_vacaciones sv ON fv.id_status_vacaciones = sv.id_status_vacaciones
       WHERE v.id_empleado = ?
       ORDER BY fv.fecha_inicio DESC`,
      [Number(empleado_id)]
    );
    return res.json(rows);
  } catch (error) {
    console.error('Error en getMisVacaciones:', error);
    return res.status(500).json({ error: 'Error interno del servidor', detail: error.message });
  }
};
