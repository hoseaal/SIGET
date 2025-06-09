import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner'; // Para indicar carga
import Alert from 'react-bootstrap/Alert'; // Para mostrar errores

// El componente recibe 'show' y 'handleClose' como props para controlar su visibilidad
function ModalBM1({ show, handleClose }) {
  // Estado para la lista de departamentos
  const [departamentos, setDepartamentos] = useState([]);
  // Estado para el ID del departamento seleccionado en el <select>
  const [selectedDep, setSelectedDep] = useState('');
  
  // Estados para manejar la carga y los errores
  const [isLoading, setIsLoading] = useState(false); // Para la carga de departamentos
  const [isGenerating, setIsGenerating] = useState(false); // Para la generación del Excel
  const [error, setError] = useState('');

  // useEffect se ejecuta cuando el modal se muestra (show === true)
  useEffect(() => {
    // Solo hacemos la petición si el modal está visible
    if (show) {
      // Reseteamos estados previos al abrir
      setIsLoading(true);
      setError('');
      setDepartamentos([]);
      setSelectedDep('');

      const fetchDepartamentos = async () => {
        try {
          const response = await fetch('/api/departamentos', {
             credentials: 'include' // Importante si la API requiere autenticación
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

  // Función para manejar la descarga del reporte
  const handleDownloadBM1 = async () => {
    if (!selectedDep) {
      setError('Por favor, seleccione un departamento para generar el reporte.');
      return;
    }

    setIsGenerating(true);
    setError(''); // Limpiar errores previos

    try {
      const depId = selectedDep;
      const url = `/api/excel/BM1?dep=${depId}`;

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        // Intentamos leer el mensaje de error del backend si lo hay
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `Error del servidor: ${response.status}`;
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `BM1_DEP-${depId}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      handleClose();

    } catch (err) {
      console.error('Error al generar el reporte BM1:', err);
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Generar Reporte BM-1</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Mostramos un spinner mientras se cargan los departamentos */}
        {isLoading && (
          <div className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <p>Cargando departamentos...</p>
          </div>
        )}

        {/* Mostramos el formulario solo si no está cargando y no hay error fatal */}
        {!isLoading && (
          <Form>
            <Form.Group controlId="departamentoSelect">
              <Form.Label><strong>Seleccione un Departamento</strong></Form.Label>
              <Form.Select 
                aria-label="Selector de departamento"
                value={selectedDep}
                onChange={(e) => {
                    setSelectedDep(e.target.value);
                    setError(''); // Limpiar error al cambiar la selección
                }}
                disabled={isGenerating} // Deshabilitar mientras se genera
              >
                <option value="">-- Por favor elija un departamento --</option>
                {departamentos.map((dep) => (
                  <option key={dep.dep_ide} value={dep.dep_ide}>
                    {dep.dep_nom}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Form>
        )}
        
        {/* Mostramos una alerta si ocurre algún error */}
        {error && (
            <Alert variant="danger" className="mt-3">
                {error}
            </Alert>
        )}

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isGenerating}>
          Cerrar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleDownloadBM1} 
          disabled={!selectedDep || isGenerating || isLoading} // Deshabilitar si no hay selección o si algo está en proceso
        >
          {isGenerating ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
              <span className="ms-2">Generando...</span>
            </>
          ) : (
            'Generar Reporte'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalBM1;