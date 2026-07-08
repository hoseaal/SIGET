import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';

// --- AUXILIARY FUNCTIONS ---
function numberToWords(num) {
  const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const tens = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  if (num === 0) return 'cero';

  function convertLessThanOneThousand(n) {
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const ten = tens[Math.floor(n / 10)];
      const unit = units[n % 10];
      if (ten === 'veinte') {
        return unit ? 'veinti' + unit : 'veinte';
      } else {
        return ten + (unit ? ' y ' + unit : '');
      }
    }
    if (n === 100) return 'cien';
    const hundred = hundreds[Math.floor(n / 100)];
    const rest = convertLessThanOneThousand(n % 100);
    return hundred + (rest ? ' ' + rest : '');
  }

  if (num < 1000) return convertLessThanOneThousand(num);
  const thousands = Math.floor(num / 1000);
  const remainder = num % 1000;

  let result = '';
  if (thousands === 1) {
    result += 'mil';
  } else {
    result += units[thousands] + ' mil';
  }

  if (remainder > 0) {
    result += ' ' + convertLessThanOneThousand(remainder);
  }

  return result.trim();
}

function formatCurrentDateTime() {
  const now = new Date();
  const day = now.getDate();
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  const month = monthNames[now.getMonth()];
  const mes = now.getMonth() + 1;
  const year = now.getFullYear();
  const yearInWords = numberToWords(year);
  const fechacorta = `${day}/${mes}/${year}`;

  return { day, month, yearInWords, fechacorta };
}

function ModalActaVerificacion({ show, handleClose }) {
  const [departamentos, setDepartamentos] = useState([]);
  const [selectedDepId, setSelectedDepId] = useState('');
  const [selectedDepName, setSelectedDepName] = useState('');

  const [directorNombre, setDirectorNombre] = useState('');
  const [directorCedula, setDirectorCedula] = useState('');
  const [directorCargo, setDirectorCargo] = useState('');
  const [analistaNombre, setAnalistaNombre] = useState('');
  const [analistaCedula, setAnalistaCedula] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);
  const [error, setError] = useState('');

  // Estados para Vista Previa
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    if (show) {
      setIsLoading(false);
      setPreviewLoading(false);
      setError('');
      setPreviewError('');
      setDepartamentos([]);
      setSelectedDepId('');
      setSelectedDepName('');
      setDirectorNombre('');
      setDirectorCedula('');
      setDirectorCargo('');
      setAnalistaNombre('');
      setAnalistaCedula('');
      setPreviewData(null);

      const fetchDepartamentos = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/departamentos', {
            credentials: 'include'
          });
          if (!response.ok) {
            throw new Error('No se pudo cargar la lista de departamentos.');
          }
          const data = await response.json();
          setDepartamentos(Array.isArray(data) ? data : (data.data || []));
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDepartamentos();
    }
  }, [show]);

  // Carga asíncrona de datos de vista previa al cambiar de departamento
  useEffect(() => {
    if (selectedDepId) {
      fetchPreviewData(selectedDepId);
    } else {
      setPreviewData(null);
    }
  }, [selectedDepId]);

  const fetchPreviewData = async (depId) => {
    setPreviewLoading(true);
    setPreviewError('');
    try {
      // 1. Definir fetches paralelos emulando al backend
      const promises = [
        fetch(`/api/bienes/all?dep=${depId}&inc=1`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
        fetch(`/api/prestamos/almacen?dep_origen_id=${depId}`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
        fetch(`/api/prestamos/normales?dep_origen_id=${depId}`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
        fetch(`/api/prestamos/normales?dep_destino_id=${depId}`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
        fetch(`/api/bienes/all?dep=${depId}&inc=1&con=4`, { credentials: 'include' }).then(r => r.ok ? r.json() : [])
      ];

      const esAlmacenPiso4 = Number(depId) === 9;
      const esAlmacenPiso3 = Number(depId) === 11;
      const esDepartamentoAlmacen = esAlmacenPiso4 || esAlmacenPiso3;

      if (esDepartamentoAlmacen) {
        promises.push(fetch(`/api/prestamos/almacen?dep_destino_id=${depId}`, { credentials: 'include' }).then(r => r.ok ? r.json() : []));
      }

      const results = await Promise.all(promises);

      const [
        bienesData,
        bienesEnAlmacenData,
        prestadosAOtroData,
        prestadosDeOtroData,
        bienesMalEstadoEnDepartamentoData,
        tercerosEnMiAlmacenData // undefined si no aplica
      ] = results;

      const todosLosBienes = Array.isArray(bienesData) ? bienesData : (bienesData?.data || []);
      const bienesFaltantes = todosLosBienes.filter(b => b.est_ide === 3);
      const bienesSinEtiqueta = todosLosBienes.filter(b => b.est_ide === 1);
      const bienesMalEstadoEnDepartamento = Array.isArray(bienesMalEstadoEnDepartamentoData)
        ? bienesMalEstadoEnDepartamentoData
        : (bienesMalEstadoEnDepartamentoData?.data || []);

      const extraerBienesPrestamo = (data) => {
        return (data || []).flatMap(prestamo => {
          try {
            const detalles = typeof prestamo.bienes_detalles === 'string'
              ? JSON.parse(prestamo.bienes_detalles)
              : (prestamo.bienes_detalles || []);
            const bienesArray = Array.isArray(detalles) ? detalles : [detalles];
            return bienesArray.map(bien => ({
              ...prestamo,
              ...bien,
              bim_des: bien.bim_des ? bien.bim_des.replace(/\s+/g, ' ').trim() : 'N/A'
            }));
          } catch (e) {
            return [];
          }
        });
      };

      const bienesEnviadosAlmacen = extraerBienesPrestamo(bienesEnAlmacenData);
      const bienesPrestadosAOtro = extraerBienesPrestamo(prestadosAOtroData);
      const bienesPrestadosDeOtro = extraerBienesPrestamo(prestadosDeOtroData);
      const bienesTercerosEnMiAlmacen = esDepartamentoAlmacen
        ? extraerBienesPrestamo(tercerosEnMiAlmacenData)
        : [];

      // Mal estado locales (excluye los enviados a almacén)
      const bienesMalEstadoSoloEnDepartamento = bienesMalEstadoEnDepartamento.filter(b =>
        !bienesEnviadosAlmacen.some(m => m.bim_ide === b.bim_ide)
      );

      // --- CÁLCULO DE TOTALES IDENTICO AL SERVIDOR ---
      const countFaltantes = bienesFaltantes.length;
      const countMalEstado = bienesEnviadosAlmacen.length + bienesMalEstadoSoloEnDepartamento.length + bienesTercerosEnMiAlmacen.length;
      const countPrestadosAOtro = bienesPrestadosAOtro.length;
      const countPrestadosDeOtro = bienesPrestadosDeOtro.length;

      const countEnServicio = todosLosBienes.length - countFaltantes - countPrestadosAOtro - (bienesEnviadosAlmacen.length + bienesMalEstadoSoloEnDepartamento.length);
      const totalBienesTabla = countEnServicio + countFaltantes + countMalEstado + countPrestadosAOtro + countPrestadosDeOtro;

      setPreviewData({
        countEnServicio,
        countFaltantes,
        countMalEstado,
        countPrestadosAOtro,
        countPrestadosDeOtro,
        totalBienesTabla,
        bienesFaltantes,
        bienesSinEtiqueta,
        bienesMalEstadoSoloEnDepartamento,
        bienesEnviadosAlmacen,
        bienesPrestadosDeOtro,
        bienesPrestadosAOtro,
        bienesTercerosEnMiAlmacen,
        esDepartamentoAlmacen
      });
    } catch (err) {
      console.error("Error al cargar vista previa del acta:", err);
      setPreviewError("Ocurrió un error al procesar el inventario para la vista previa.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!selectedDepId) {
      setError('Por favor, seleccione un departamento para generar el acta de verificación.');
      return;
    }
    if (!directorNombre || !directorCedula || !directorCargo || !analistaNombre || !analistaCedula) {
      setError('Por favor, complete todos los campos de director y analista para el PDF.');
      return;
    }

    setIsGeneratingPdf(true);
    setError('');

    try {
      const dataToSend = {
        dep_ide: selectedDepId,
        departamento_nombre: selectedDepName,
        director_nombre: directorNombre,
        director_cedula: directorCedula,
        director_cargo: directorCargo,
        analista_nombre: analistaNombre,
        analista_cedula: analistaCedula,
      };

      const response = await fetch('/api/pdf/acta-verificacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Error del servidor: ${response.status}`;
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `Acta_Verificacion_${selectedDepName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error al generar el Acta de Verificación PDF:', err);
      setError(err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleGenerateExcel = async () => {
    if (!selectedDepId) {
      setError('Por favor, seleccione un departamento para generar el Excel del acta de verificación.');
      return;
    }
    if (!directorNombre || !directorCedula || !directorCargo || !analistaNombre || !analistaCedula) {
      setError('Por favor, complete todos los campos de director y analista para el Excel.');
      return;
    }

    setIsGeneratingExcel(true);
    setError('');

    try {
      const queryParams = new URLSearchParams({
        dep_ide: selectedDepId,
        departamento_nombre: selectedDepName
      }).toString();

      const response = await fetch(`/api/excel/acta-verificacion?${queryParams}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || `Error del servidor: ${response.status}`);
        } catch {
          throw new Error(`Error del servidor: ${response.status} - ${errorText || response.statusText}`);
        }
      }

      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `Acta_Verificacion_Excel_${selectedDepName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-8''|[^;]+)?filename=['"]?([^"']+)/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = decodeURIComponent(filenameMatch[1].replace(/%../g, decodeURIComponent));
        }
      }

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Error al generar el Acta de Verificación Excel:', err);
      setError(err.message);
    } finally {
      setIsGeneratingExcel(false);
    }
  };

  const handleDepartmentChange = (e) => {
    const selectedId = e.target.value;
    setSelectedDepId(selectedId);
    setError('');

    const selectedDep = departamentos.find(dep => dep.dep_ide === Number(selectedId));
    if (selectedDep) {
      setSelectedDepName(selectedDep.dep_nom);
    } else {
      setSelectedDepName('');
    }
  };

  const isAnyGenerating = isGeneratingPdf || isGeneratingExcel;

  // Lógica reactiva de Vista Previa del párrafo
  const dateParts = formatCurrentDateTime();
  const depUpper = selectedDepName ? selectedDepName.toUpperCase() : '[DEPARTAMENTO]';
  const dirNombreUpper = directorNombre ? directorNombre.toUpperCase() : '[DIRECTOR]';
  const dirCedulaUpper = directorCedula ? directorCedula.toUpperCase() : '[CÉDULA]';
  const dirCargoUpper = directorCargo ? directorCargo.toUpperCase() : '[CARGO]';
  const anaNombreUpper = analistaNombre ? analistaNombre.toUpperCase() : '[ANALISTA]';
  const anaCedulaUpper = analistaCedula ? analistaCedula.toUpperCase() : '[CÉDULA]';
  const totalBienes = previewData ? previewData.totalBienesTabla : '0';

  const openingText = `En la ciudad de San Cristóbal a los ${dateParts.day} días del mes de ${dateParts.month} del año ${dateParts.yearInWords} reunidos en la dirección de ${depUpper} los Ciudadanos: ${dirNombreUpper}, titular de la cédula de identidad N° ${dirCedulaUpper} (${dirCargoUpper}) y Lcda. ${anaNombreUpper}, titular de la cédula de identidad N° ${anaCedulaUpper} (Analista de Bienes e Inventarios I), para dejar constancia de la verificación por percepción directa del inventario físico al ${dateParts.fechacorta}, fecha del reporte BM1 bienes adscritos a la Unidad antes mencionada, los cuales ascienden a un total de ${totalBienes} bienes, según la relación de bienes muebles formulario BM-1.`;

  // Renderizar snippets de lista
  const renderItemSnippet = (title, items) => {
    if (!items || items.length === 0) return null;
    const limit = 3;
    const sorted = [...items].sort((a, b) => String(a.bim_ide).localeCompare(String(b.bim_ide), undefined, { numeric: true }));
    const sliced = sorted.slice(0, limit);
    const hasMore = items.length > limit;

    return (
      <div className="mb-3 p-2 bg-light rounded border border-light">
        <strong style={{ fontSize: '0.78rem', color: '#495057' }} className="d-block mb-1 text-uppercase">
          {title} ({items.length})
        </strong>
        <ul className="ps-3 mb-0" style={{ fontSize: '0.75rem', color: '#6c757d' }}>
          {sliced.map((item, idx) => (
            <li key={idx}>
              <strong>Nº {item.bim_ide}:</strong> {item.bim_des || 'Sin descripción'}
            </li>
          ))}
          {hasMore && (
            <li className="list-unstyled text-muted mt-1">
              <em>... y {items.length - limit} bienes más.</em>
            </li>
          )}
        </ul>
      </div>
    );
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered backdrop="static">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <i className="bx bxs-file-pdf me-2 text-primary fs-3 align-middle"></i>
          Generar Acta de Verificación de Inventario
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4" style={{ backgroundColor: '#f8f9fa' }}>
        <Row className="g-4">
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <Col lg={5}>
            <div className="card shadow-none border h-100 p-3 bg-white">
              <h5 className="card-title fw-bold text-secondary mb-3 border-bottom pb-2">
                <i className="bx bx-cog me-1"></i> Parámetros del Reporte
              </h5>
              
              {isLoading ? (
                <div className="text-center my-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">Cargando departamentos...</p>
                </div>
              ) : (
                <Form>
                  <Form.Group controlId="departamentoSelect" className="mb-4">
                    <Form.Label className="fw-semibold text-dark">Departamento a Evaluar</Form.Label>
                    <Form.Select
                      aria-label="Selector de departamento"
                      value={selectedDepId}
                      onChange={handleDepartmentChange}
                      disabled={isAnyGenerating}
                      className="border-primary"
                    >
                      <option value="">-- Elija un departamento --</option>
                      {departamentos.map((dep) => (
                        <option key={dep.dep_ide} value={dep.dep_ide}>
                          {dep.dep_nom}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <div className="bg-light p-3 rounded mb-4">
                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-1">
                      <i className="bx bx-user me-1 text-primary"></i> Datos de Custodia y Firmas
                    </h6>
                    
                    <Form.Group controlId="directorNombre" className="mb-3">
                      <Form.Label className="small fw-semibold text-muted mb-1">Nombre del Director / Jefe</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={directorNombre} 
                        onChange={(e) => setDirectorNombre(e.target.value)} 
                        disabled={isAnyGenerating} 
                        placeholder="Ej. Maria Rodriguez" 
                        className="form-control-sm border"
                      />
                    </Form.Group>
                    <Form.Group controlId="directorCedula" className="mb-3">
                      <Form.Label className="small fw-semibold text-muted mb-1">Cédula del Director</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={directorCedula} 
                        onChange={(e) => setDirectorCedula(e.target.value)} 
                        disabled={isAnyGenerating} 
                        placeholder="Ej. V-11.111.111" 
                        className="form-control-sm border"
                      />
                    </Form.Group>
                    <Form.Group controlId="directorCargo" className="mb-3">
                      <Form.Label className="small fw-semibold text-muted mb-1">Cargo del Director</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={directorCargo} 
                        onChange={(e) => setDirectorCargo(e.target.value)} 
                        disabled={isAnyGenerating} 
                        placeholder="Ej. Directora de Despacho de Contralor" 
                        className="form-control-sm border"
                      />
                    </Form.Group>
                  </div>

                  <div className="bg-light p-3 rounded">
                    <h6 className="fw-bold text-dark mb-3 border-bottom pb-1">
                      <i className="bx bx-user me-1 text-success"></i> Datos de Inspección
                    </h6>
                    
                    <Form.Group controlId="analistaNombre" className="mb-3">
                      <Form.Label className="small fw-semibold text-muted mb-1">Nombre del Analista</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={analistaNombre} 
                        onChange={(e) => setAnalistaNombre(e.target.value)} 
                        disabled={isAnyGenerating} 
                        placeholder="Ej. Ana Pérez" 
                        className="form-control-sm border"
                      />
                    </Form.Group>
                    <Form.Group controlId="analistaCedula" className="mb-3">
                      <Form.Label className="small fw-semibold text-muted mb-1">Cédula del Analista</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={analistaCedula} 
                        onChange={(e) => setAnalistaCedula(e.target.value)} 
                        disabled={isAnyGenerating} 
                        placeholder="Ej. V-22.222.222" 
                        className="form-control-sm border"
                      />
                    </Form.Group>
                  </div>
                </Form>
              )}

              {error && (
                <Alert variant="danger" className="mt-3 py-2 small">
                  <i className="bx bx-error-circle me-1 align-middle"></i> {error}
                </Alert>
              )}
            </div>
          </Col>

          {/* COLUMNA DERECHA: VISTA PREVIA */}
          <Col lg={7}>
            <div className="card shadow-none border h-100 p-3 bg-white d-flex flex-column">
              <h5 className="card-title fw-bold text-secondary mb-3 border-bottom pb-2 d-flex justify-content-between align-items-center">
                <span><i className="bx bx-show me-1"></i> Vista Previa del Acta</span>
                <span className="badge bg-label-primary text-uppercase" style={{ fontSize: '0.65rem' }}>Borrador Digital</span>
              </h5>

              <div 
                className="flex-grow-1 overflow-auto border p-4 bg-white rounded"
                style={{ 
                  maxHeight: '520px', 
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)',
                  minHeight: '400px'
                }}
              >
                {!selectedDepId ? (
                  <div className="text-center my-5 py-5 text-muted">
                    <i className="bx bx-file-blank fs-1 d-block mb-3 text-warning"></i>
                    <p className="fw-semibold mb-1">Ningún Departamento Seleccionado</p>
                    <small>Elija un departamento a la izquierda para cargar los números del acta.</small>
                  </div>
                ) : previewLoading ? (
                  <div className="text-center my-5 py-5 text-muted">
                    <Spinner animation="border" variant="secondary" className="mb-2" size="sm" />
                    <p className="small mb-0">Procesando y consolidando base de datos de bienes...</p>
                  </div>
                ) : previewError ? (
                  <Alert variant="warning" className="my-4 text-center">
                    <i className="bx bx-error fs-3 d-block mb-2"></i>
                    {previewError}
                  </Alert>
                ) : previewData ? (
                  <div 
                    className="acta-sheet-mockup px-3 py-2" 
                    style={{ 
                      fontFamily: 'Courier New, Courier, monospace', 
                      fontSize: '0.75rem', 
                      lineHeight: 1.4,
                      color: '#212529'
                    }}
                  >
                    {/* Encabezado del Acta */}
                    <div className="text-center border-bottom pb-2 mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <i className="bx bxs-shield-alt-2 fs-2 text-secondary"></i>
                        <div className="text-end fw-bold" style={{ fontSize: '0.55rem', color: '#495057' }}>
                          REPÚBLICA BOLIVARIANA DE VENEZUELA<br />
                          CONTRALORÍA DEL ESTADO TÁCHIRA
                        </div>
                      </div>
                      <div className="fw-bold mt-2" style={{ letterSpacing: '1px' }}>
                        DIVISIÓN DE COMPRAS, BIENES E INVENTARIOS
                      </div>
                      <div className="fw-bold mt-2 text-decoration-underline" style={{ fontSize: '0.8rem' }}>
                        ACTA DE VERIFICACIÓN DEL INVENTARIO DE BIENES MUEBLES
                      </div>
                    </div>

                    {/* Cuerpo - Párrafo reactivo */}
                    <p className="text-justify mb-3" style={{ textAlign: 'justify', textIndent: '20px' }}>
                      {openingText}
                    </p>

                    {/* Tabla de Resultados Cuantitativos */}
                    <div className="my-3">
                      <table className="table table-bordered table-sm" style={{ fontSize: '0.7rem', borderColor: '#212529' }}>
                        <thead>
                          <tr className="fw-bold text-center bg-light">
                            <th style={{ width: '50%' }}>Estatus del Bien Mueble</th>
                            <th style={{ width: '15%' }}>Total</th>
                            <th style={{ width: '35%' }}>Observaciones (Códigos)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Bienes en Servicio en la dirección:</td>
                            <td className="text-center">{previewData.countEnServicio}</td>
                            <td className="text-center">-</td>
                          </tr>
                          <tr>
                            <td>Bienes Faltantes:</td>
                            <td className="text-center">{previewData.countFaltantes}</td>
                            <td className="text-wrap" style={{ wordBreak: 'break-all' }}>
                              {previewData.bienesFaltantes.map(b => b.bim_ide).join(', ') || '-'}
                            </td>
                          </tr>
                          <tr>
                            <td>Bienes en Mal Estado:</td>
                            <td className="text-center">{previewData.countMalEstado}</td>
                            <td className="text-wrap" style={{ wordBreak: 'break-all' }}>
                              {[...previewData.bienesEnviadosAlmacen, ...previewData.bienesMalEstadoSoloEnDepartamento, ...previewData.bienesTercerosEnMiAlmacen].map(b => b.bim_ide).join(', ') || '-'}
                            </td>
                          </tr>
                          <tr>
                            <td>Bienes en Préstamo a otras direcciones:</td>
                            <td className="text-center">{previewData.countPrestadosAOtro}</td>
                            <td className="text-wrap" style={{ wordBreak: 'break-all' }}>
                              {previewData.bienesPrestadosAOtro.map(b => b.bim_ide).join(', ') || '-'}
                            </td>
                          </tr>
                          <tr>
                            <td>Bienes en préstamo de otras direcciones:</td>
                            <td className="text-center">{previewData.countPrestadosDeOtro}</td>
                            <td className="text-wrap" style={{ wordBreak: 'break-all' }}>
                              {previewData.bienesPrestadosDeOtro.map(b => b.bim_ide).join(', ') || '-'}
                            </td>
                          </tr>
                          <tr className="fw-bold bg-light">
                            <td className="text-end">TOTAL:</td>
                            <td className="text-center">{previewData.totalBienesTabla}</td>
                            <td className="text-center">-</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Resumen de Observación y Listado Sintetizado (No listado completo) */}
                    <div className="mt-4 border-top pt-2">
                      <div className="fw-bold mb-2 text-uppercase" style={{ fontSize: '0.78rem' }}>
                        OBSERVACIÓN (Resumen Sintético de Bienes):
                      </div>
                      
                      {renderItemSnippet("Prestados de otras direcciones", previewData.bienesPrestadosDeOtro)}
                      {renderItemSnippet("Trasladados a Almacén", previewData.bienesEnviadosAlmacen)}
                      {renderItemSnippet("Mal estado en departamento", previewData.bienesMalEstadoSoloEnDepartamento)}
                      {previewData.esDepartamentoAlmacen && renderItemSnippet("Terceros en mi Almacén", previewData.bienesTercerosEnMiAlmacen)}
                      {renderItemSnippet("Prestados a otras direcciones", previewData.bienesPrestadosAOtro)}
                      {renderItemSnippet("Sin etiqueta de inventario", previewData.bienesSinEtiqueta)}
                      {renderItemSnippet("Bienes faltantes", previewData.bienesFaltantes)}

                      {(!previewData.bienesPrestadosDeOtro.length && 
                        !previewData.bienesEnviadosAlmacen.length && 
                        !previewData.bienesMalEstadoSoloEnDepartamento.length && 
                        !previewData.bienesPrestadosAOtro.length && 
                        !previewData.bienesSinEtiqueta.length && 
                        !previewData.bienesFaltantes.length) && (
                          <div className="text-muted small my-2">
                            <em>Ninguna observación ni bien clasificado en estatus crítico en este departamento.</em>
                          </div>
                      )}
                    </div>

                    {/* Firmas en Borrador */}
                    <div className="mt-5 border-top pt-4">
                      <Row className="g-2 text-center" style={{ fontSize: '0.68rem' }}>
                        <Col xs={6}>
                          <div className="mx-auto border-bottom border-dark mb-2" style={{ width: '80%', height: '30px' }}></div>
                          <span className="fw-bold d-block">Lcda. {analistaNombre || '[ANALISTA]'}</span>
                          <span className="text-muted">Analista de Bienes e Inventarios I</span>
                        </Col>
                        <Col xs={6}>
                          <div className="mx-auto border-bottom border-dark mb-2" style={{ width: '80%', height: '30px' }}></div>
                          <span className="fw-bold d-block">{directorNombre || '[DIRECTOR]'}</span>
                          <span className="text-muted">{directorCargo || '[CARGO]'}</span>
                        </Col>
                      </Row>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={handleClose} disabled={isAnyGenerating}>
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={handleGeneratePdf}
          disabled={!selectedDepId || isAnyGenerating || isLoading || previewLoading || !directorNombre || !directorCedula || !directorCargo || !analistaNombre || !analistaCedula}
        >
          {isGeneratingPdf ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Generando PDF...</span>
            </>
          ) : (
            <>
              <i className="bx bxs-file-pdf me-1"></i> Generar PDF Acta
            </>
          )}
        </Button>
        <Button
          variant="success"
          onClick={handleGenerateExcel}
          disabled={!selectedDepId || isAnyGenerating || isLoading || previewLoading || !directorNombre || !directorCedula || !directorCargo || !analistaNombre || !analistaCedula}
          className="ms-2"
        >
          {isGeneratingExcel ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Generando Excel...</span>
            </>
          ) : (
            <>
              <i className="bx bxs-file me-1"></i> Generar Excel
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalActaVerificacion;