/**
 * Configuracion del universo de bienes atendidos por Soporte Tecnico.
 * Subcategoria 2 = "Equipos de procesamiento de datos" (cae_ide 1302-1323).
 * Los equipos que no tienen un cae propio (monitor, mouse, UPS, videobeam)
 * se detectan por palabras clave en la descripcion del bien.
 */

export const CAE_SOPORTE = [1302, 1303, 1304, 1305, 1306, 1307, 1308, 1309, 1310, 1311, 1312, 1313, 1314, 1315, 1316, 1317, 1318, 1319, 1320, 1321, 1322, 1323]

export const CAE_EXTRA = {
  Videobeam: [1112],
  UPS: [517, 523, 1060]
}

export const TIPOS_SOPORTE = [
  { value: 'Computador', label: 'Computador', cae: [1308, 1313], keywords: ['COMPUTAD', 'LAPTOP', 'PORTATIL', 'DESKTOP'] },
  { value: 'Monitor', label: 'Monitor', cae: [], keywords: ['MONITOR', 'PANTALLA'] },
  { value: 'Videobeam', label: 'Videobeam', cae: [1112], keywords: ['VIDEO BEAM', 'VIDEOBEAM', 'PROYECTOR'] },
  { value: 'Teclado', label: 'Teclado', cae: [1312], keywords: ['TECLADO'] },
  { value: 'Mouse', label: 'Mouse', cae: [], keywords: ['MOUSE', 'RATON'] },
  { value: 'UPS', label: 'UPS / Regulador', cae: [517, 523, 1060], keywords: ['UPS', 'ESTABILIZAD', 'REGULADOR'] },
  { value: 'Escaner', label: 'Escaner', cae: [1305], keywords: ['ESCANER', 'SCANNER'] },
  { value: 'Impresora', label: 'Impresora', cae: [1303, 1318, 1322], keywords: ['IMPRESOR'] },
  { value: 'Otro equipo de computo', label: 'Otro equipo de computo', cae: [], keywords: [] }
]

export const TIPOS_FILTRO = TIPOS_SOPORTE
  .filter(t => t.value !== 'Otro equipo de computo')
  .map(t => t.value)

export const SCOPE_REGEX = [
  'MONITOR', 'PANTALLA', 'VIDEO[[:space:]]*BEAM', 'VIDEOBEAM', 'PROYECTOR',
  'MOUSE', 'RATON', 'TECLADO', 'ESCANER', 'SCANNER', 'IMPRESOR',
  'UPS', 'ESTABILIZAD', 'REGULADOR', 'COMPUTAD', 'LAPTOP', 'PORTATIL', 'DESKTOP'
].join('|')

/**
 * Expresion SQL que clasifica cada bien en un tipo de soporte.
 * El orden importa: primero los cae explicitos, luego las palabras clave.
 */
export const SQL_TIPO_SOPORTE = `
  CASE
    WHEN b.cae_ide IN (1308, 1313) THEN 'Computador'
    WHEN b.cae_ide = 1312 THEN 'Teclado'
    WHEN b.cae_ide = 1305 THEN 'Escaner'
    WHEN b.cae_ide IN (1303, 1318, 1322) THEN 'Impresora'
    WHEN b.cae_ide = 1112 THEN 'Videobeam'
    WHEN b.cae_ide IN (517, 523, 1060) THEN 'UPS'
    WHEN UPPER(COALESCE(b.bim_des, '')) REGEXP 'MONITOR|PANTALLA' THEN 'Monitor'
    WHEN UPPER(COALESCE(b.bim_des, '')) REGEXP 'VIDEO[[:space:]]*BEAM|VIDEOBEAM|PROYECTOR' THEN 'Videobeam'
    WHEN UPPER(COALESCE(b.bim_des, '')) REGEXP 'MOUSE|RATON' THEN 'Mouse'
    WHEN UPPER(COALESCE(b.bim_des, '')) REGEXP 'TECLADO' THEN 'Teclado'
    WHEN UPPER(COALESCE(b.bim_des, '')) REGEXP 'ESCANER|SCANNER' THEN 'Escaner'
    WHEN UPPER(COALESCE(b.bim_des, '')) REGEXP 'IMPRESOR' THEN 'Impresora'
    WHEN UPPER(COALESCE(b.bim_des, '')) REGEXP 'UPS|ESTABILIZAD|REGULADOR' THEN 'UPS'
    WHEN UPPER(COALESCE(b.bim_des, '')) REGEXP 'COMPUTAD|LAPTOP|PORTATIL|DESKTOP' THEN 'Computador'
    WHEN ca.sca_ide = 2 THEN 'Otro equipo de computo'
    ELSE 'Otro'
  END
`

export const CAMPOS_BIEN = `
  b.bim_ide,
  b.bim_des,
  b.bim_fec,
  b.bim_ndo,
  b.bim_val,
  b.bim_moneda,
  b.bim_color,
  b.bim_ser,
  b.bim_cod,
  b.bim_obs,
  b.bim_sede,
  b.bim_inc,
  b.bim_fed,
  b.est_ide,
  e.est_est AS estado,
  b.foa_ide,
  f.foa_nom AS forma_adquisicion,
  b.con_ide,
  c.con_con AS condicion,
  b.esu_ide,
  eu.esu_esu AS estado_uso,
  b.dep_ide,
  d.dep_nom AS departamento,
  b.mod_ide,
  m.mod_mod AS modelo,
  m.mar_ide,
  mar.mar_mar AS marca,
  b.cae_ide,
  ca.cae_cae AS categoria_especifica,
  ca.sca_ide,
  sc.sca_sca AS subcategoria,
  sc.cat_ide,
  cat.cat_cat AS categoria_general,
  b.com_ide,
  co.com_com AS concepto_movimiento
`

export const JOINS_BIEN = `
  LEFT JOIN tmaest e ON b.est_ide = e.est_ide
  LEFT JOIN tmafoa f ON b.foa_ide = f.foa_ide
  LEFT JOIN tmacon c ON b.con_ide = c.con_ide
  LEFT JOIN tmaesu eu ON b.esu_ide = eu.esu_ide
  LEFT JOIN tesdep d ON b.dep_ide = d.dep_ide
  LEFT JOIN tesmod m ON b.mod_ide = m.mod_ide
  LEFT JOIN tmamar mar ON m.mar_ide = mar.mar_ide
  LEFT JOIN tescae ca ON b.cae_ide = ca.cae_ide
  LEFT JOIN tessca sc ON ca.sca_ide = sc.sca_ide
  LEFT JOIN tmacat cat ON sc.cat_ide = cat.cat_ide
  LEFT JOIN tmacom co ON b.com_ide = co.com_ide
`

export const SORT_FIELDS = {
  bim_ide: 't.bim_ide',
  bim_des: 't.bim_des',
  bim_fec: 't.bim_fec',
  bim_val: 't.bim_val',
  bim_ser: 't.bim_ser',
  bim_cod: 't.bim_cod',
  departamento: 't.departamento',
  estado: 't.estado',
  tipo_soporte: 't.tipo_soporte',
  marca: 't.marca',
  modelo: 't.modelo'
}
