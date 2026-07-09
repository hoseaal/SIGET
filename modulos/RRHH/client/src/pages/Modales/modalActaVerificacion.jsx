import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';
import Alert from 'react-bootstrap/Alert';

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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false); // Separated loading state for PDF
  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false); // New loading state for Excel
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setIsLoading(true);
      setError('');
      setDepartamentos([]);
      setSelectedDepId('');
      setSelectedDepName('');
      setDirectorNombre('');
      setDirectorCedula('');
      setDirectorCargo('');
      setAnalistaNombre('');
      setAnalistaCedula('');

      const fetchDepartamentos = async () => {
        try {
          const response = await fetch('/api/rrhh/departamentos', {
            credentials: 'include'
          });
          if (!response.ok) {
            throw new Error('No se pudo cargar la lista de departamentos. Verifique la conexión o la sesión.');
          }
          const data = await response.json();
          setDepartamentos(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchDepartamentos();
    }
  }, [show]);

  // Function to handle PDF generation and download (EXISTING LOGIC)
  const handleGeneratePdf = async () => {
    if (!selectedDepId) {
      setError('Por favor, seleccione un departamento para generar el acta de verificación.');
      return;
    }
    if (!directorNombre || !directorCedula || !directorCargo || !analistaNombre || !analistaCedula) {
      setError('Por favor, complete todos los campos de director y analista para el PDF.');
      return;
    }

    setIsGeneratingPdf(true); // Use PDF specific loading state
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

      // Assuming your PDF route is still '/api/rrhh/pdf/acta-verificacion'
      const response = await fetch('/api/rrhh/pdf/acta-verificacion', { // THIS IS YOUR PDF ENDPOINT
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

      // No handleClose() here, as PDF is now separate from Excel

    } catch (err) {
      console.error('Error al generar el Acta de Verificación PDF:', err);
      setError(err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // --- NEW FUNCTION TO HANDLE EXCEL GENERATION AND DOWNLOAD ---
  const handleGenerateExcel = async () => {
    if (!selectedDepId) {
      setError('Por favor, seleccione un departamento para generar el Excel del acta de verificación.');
      return;
    }
    if (!directorNombre || !directorCedula || !directorCargo || !analistaNombre || !analistaCedula) {
      setError('Por favor, complete todos los campos de director y analista para el Excel.');
      return;
    }

    setIsGeneratingExcel(true); // Use Excel specific loading state
    setError('');

    try {
      // Prepare query parameters for the GET request
      const queryParams = new URLSearchParams({
        dep_ide: selectedDepId,
        departamento_nombre: selectedDepName
      }).toString();

      // Use the new Excel endpoint
      const response = await fetch(`/api/rrhh/excel/acta-verificacion?${queryParams}`, { // NEW EXCEL ENDPOINT
        method: 'GET', // Changed to GET as per your route
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get raw text for better error message
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || errorData.error || `Error del servidor: ${response.status}`);
        } catch {
          throw new Error(`Error del servidor: ${response.status} - ${errorText || response.statusText}`);
        }
      }

      const blob = await response.blob(); // Expecting a blob (Excel file)
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

      // No handleClose() here, as PDF is now separate from Excel

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

  // Determine if any generation is in progress for disabling fields
  const isAnyGenerating = isGeneratingPdf || isGeneratingExcel;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Generar Acta de Verificación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading && (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <p>Cargando departamentos...</p>
          </div>
        )}

        {!isLoading && (
          <Form>
            <Form.Group controlId="departamentoSelect" className="mb-3">
              <Form.Label><strong>Seleccione un Departamento</strong></Form.Label>
              <Form.Select
                aria-label="Selector de departamento"
                value={selectedDepId}
                onChange={handleDepartmentChange}
                disabled={isAnyGenerating}
              >
                <option value="">-- Por favor elija un departamento --</option>
                {departamentos.map((dep) => (
                  <option key={dep.dep_ide} value={dep.dep_ide}>
                    {dep.dep_nom}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <hr />
            <h5 className="mb-3">Datos del Director</h5>
            <Form.Group controlId="directorNombre" className="mb-3">
              <Form.Label>Nombre del Director</Form.Label>
              <Form.Control type="text" value={directorNombre} onChange={(e) => setDirectorNombre(e.target.value)} disabled={isAnyGenerating} placeholder="Ej. Lcda. Maria Rodriguez" />
            </Form.Group>
            <Form.Group controlId="directorCedula" className="mb-3">
              <Form.Label>Cédula del Director</Form.Label>
              <Form.Control type="text" value={directorCedula} onChange={(e) => setDirectorCedula(e.target.value)} disabled={isAnyGenerating} placeholder="Ej. V-11.111.111" />
            </Form.Group>
            <Form.Group controlId="directorCargo" className="mb-3">
              <Form.Label>Cargo del Director</Form.Label>
              <Form.Control type="text" value={directorCargo} onChange={(e) => setDirectorCargo(e.target.value)} disabled={isAnyGenerating} placeholder="Ej. Directora de Despacho de Contralor" />
            </Form.Group>

            <hr />
            <h5 className="mb-3">Datos del Analista</h5>
            <Form.Group controlId="analistaNombre" className="mb-3">
              <Form.Label>Nombre del Analista</Form.Label>
              <Form.Control type="text" value={analistaNombre} onChange={(e) => setAnalistaNombre(e.target.value)} disabled={isAnyGenerating} placeholder="Ej. Ana Pérez" />
            </Form.Group>
            <Form.Group controlId="analistaCedula" className="mb-3">
              <Form.Label>Cédula del Analista</Form.Label>
              <Form.Control type="text" value={analistaCedula} onChange={(e) => setAnalistaCedula(e.target.value)} disabled={isAnyGenerating} placeholder="Ej. V-11.111.111" />
            </Form.Group>
          </Form>
        )}

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isAnyGenerating}>
          Cerrar
        </Button>
        <Button
          variant="primary"
          onClick={handleGeneratePdf} // Call PDF generation
          disabled={!selectedDepId || isAnyGenerating || isLoading || !directorNombre || !directorCedula || !directorCargo || !analistaNombre || !analistaCedula}
        >
          {isGeneratingPdf ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Generando PDF...</span>
            </>
          ) : (
            'Generar PDF Acta'
          )}
        </Button>
        {/* --- NEW BUTTON FOR EXCEL GENERATION --- */}
        <Button
          variant="success" // Use a different variant for visual distinction
          onClick={handleGenerateExcel} // Call Excel generation
          disabled={!selectedDepId || isAnyGenerating || isLoading || !directorNombre || !directorCedula || !directorCargo || !analistaNombre || !analistaCedula}
          className="ms-2" // Add some margin
        >
          {isGeneratingExcel ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="ms-2">Generando Excel...</span>
            </>
          ) : (
            'Generar Excel'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalActaVerificacion;