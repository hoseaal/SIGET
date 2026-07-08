import { useMemo } from 'react';
import { getCETEquivalentes, normalize } from '../data/catalogoCargosCET';
import { findDireccionNode, findDivisionNode } from '../data/orgStructure';

/**
 * Hook reutilizable para selects dependientes (cascading).
 *
 * Resuelve:
 *   1. Cargo ONAPRE → Cargos CET filtrados
 *   2. Dirección → Divisiones + Unidades directas
 *   3. División → Unidades hijas
 *
 * @param {Object} formData - Estado del formulario con los IDs seleccionados
 * @param {Object} catalogos - Catálogos cargados del API (cargosCET, cargosONAPRE, direcciones, etc.)
 * @returns {Object} Listas filtradas y flags de disponibilidad
 */
export function useSelectsDependientes(formData, catalogos) {

  // ─── 1. Cargos CET filtrados según ONAPRE seleccionado ────────────────

  const cargosCETFiltrados = useMemo(() => {
    const cargosONAPRE = Array.isArray(catalogos.cargosONAPRE) ? catalogos.cargosONAPRE : [];
    const cargosCET = Array.isArray(catalogos.cargosCET) ? catalogos.cargosCET : [];

    if (!formData.cargo_onapre_id || cargosONAPRE.length === 0 || cargosCET.length === 0) {
      return [];
    }

    // Buscar el nombre del cargo ONAPRE seleccionado
    const onapreSeleccionado = cargosONAPRE.find(
      o => String(o.cargo_onapre_id) === String(formData.cargo_onapre_id)
    );

    if (!onapreSeleccionado) return [];

    // Obtener nombres CET equivalentes del catálogo
    const nombresCETValidos = getCETEquivalentes(onapreSeleccionado.nombre.trim());

    if (nombresCETValidos.length === 0) return [];

    // Filtrar los CET cargados del API por nombre (insensible a mayúsculas y acentos)
    const nombresCETValidosNormalized = nombresCETValidos.map(n => normalize(n));
    return cargosCET.filter(cet =>
      nombresCETValidosNormalized.includes(normalize(cet.nombre))
    );
  }, [formData.cargo_onapre_id, catalogos.cargosONAPRE, catalogos.cargosCET]);


  // ─── 2. Resolver nombre de la dirección seleccionada ──────────────────

  const direccionSeleccionada = useMemo(() => {
    if (!formData.direccion_id || !catalogos.direcciones?.length) return null;
    return catalogos.direcciones.find(
      d => String(d.direccion_id) === String(formData.direccion_id)
    ) || null;
  }, [formData.direccion_id, catalogos.direcciones]);

  // Nodo del árbol organizacional para la dirección seleccionada
  const direccionNode = useMemo(() => {
    if (!direccionSeleccionada) return null;
    return findDireccionNode(direccionSeleccionada.nombre);
  }, [direccionSeleccionada]);


  // ─── 3. Divisiones disponibles para la dirección seleccionada ─────────

  const divisionesFiltradas = useMemo(() => {
    const divisiones = Array.isArray(catalogos.divisiones) ? catalogos.divisiones : [];
    if (!formData.direccion_id || divisiones.length === 0) return [];

    // Filtrar divisiones que pertenecen a la dirección seleccionada (vía ID de base de datos)
    return divisiones.filter(div =>
      String(div.direccion_id) === String(formData.direccion_id)
    );
  }, [formData.direccion_id, catalogos.divisiones]);


  // ─── 4. Unidades disponibles ──────────────────────────────────────────

  const unidadesFiltradas = useMemo(() => {
    const unidades = Array.isArray(catalogos.unidades) ? catalogos.unidades : [];
    if (!formData.direccion_id || unidades.length === 0) return [];

    if (formData.division_id) {
      // Si hay división seleccionada → filtrar unidades de esa división
      return unidades.filter(u =>
        String(u.division_id) === String(formData.division_id)
      );
    } else {
      // Si NO hay división seleccionada → mostrar unidades directas de la dirección
      // Intentamos usar el árbol jerárquico como guía para unidades directas si existe el nodo
      if (direccionNode && direccionNode.unidades) {
        return unidades.filter(u =>
          direccionNode.unidades.includes(u.nombre)
        );
      }
      
      // Fallback: Si no hay nodo o no tiene unidades definidas en el árbol,
      // buscamos unidades cuyo division_id sea null/0 (si aplica)
      return unidades.filter(u => !u.division_id || u.division_id === 0);
    }
  }, [formData.direccion_id, formData.division_id, direccionNode, catalogos.unidades]);


  // ─── 5. Flags de disponibilidad ───────────────────────────────────────

  const tieneDivisiones = divisionesFiltradas.length > 0;

  // Unidades disponibles: ya sea directas de la dirección o hijas de la división
  const tieneUnidades = unidadesFiltradas.length > 0;

  // Si la dirección tiene unidades directas (sin necesidad de división)
  const tieneUnidadesDirectas = useMemo(() => {
    if (!direccionNode) return false;
    return (direccionNode.unidades || []).length > 0;
  }, [direccionNode]);

  return {
    cargosCETFiltrados,
    divisionesFiltradas,
    unidadesFiltradas,
    tieneDivisiones,
    tieneUnidades,
    tieneUnidadesDirectas
  };
}
