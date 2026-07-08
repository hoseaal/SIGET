import express from 'express'
import {
  obtenerHistorialFuncionario, 
  obtenerRegistroSalario,
  crearRegistroSalario,
  actualizarRegistroSalario,
  eliminarRegistroSalario
} from '../controllers/historialSalario.controller.js'

const router = express.Router()

// GET Historial de un Funcionario (con filtros de fecha y paginación)
router.get('/funcionario/:empleado_id', obtenerHistorialFuncionario)

// CRUD individual por ID de Registro (historial_salario_id) para correcciones
router.get('/:id', obtenerRegistroSalario)
router.post('/', crearRegistroSalario)
router.put('/:id', actualizarRegistroSalario)
router.delete('/:id', eliminarRegistroSalario)

export default router

/* JSON para probar Endpoints 
1. Obtener Últimos Pagos (Paginado) Endpoint: GET http://localhost:3000/api/historial-salarios/funcionario/1?page=1&limit=5 Descripción: Trae los últimos 5 pagos del funcionario ID 1.

2. Obtener Pagos de un Año Específico (Rango de Fechas) Endpoint: GET http://localhost:3000/api/historial-salarios/funcionario/1?fecha_inicio=2023-01-01&fecha_fin=2023-12-31 Descripción: Filtra solo los pagos del año 2023.

3. Obtener Todo el Historial (Sin Paginación) Endpoint: GET http://localhost:3000/api/historial-salarios/funcionario/1?all=true Descripción: Útil para exportar a PDF/Excel.

4. Crear Registro Endpoint: POST http://localhost:3000/api/historial-salarios */