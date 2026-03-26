import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';

const ModalGenerarEtiquetas = ({ show, handleClose }) => {
  // Estado para el tipo de generación (departamento o individual)
  const [tipoGeneracion, setTipoGeneracion] = useState('departamento');

  // Estados para la opción "Por Departamento"
  const [departamentos, setDepartamentos] = useState([]);
  const [selectedDepId, setSelectedDepId] = useState('');
  const [selectedDepName, setSelectedDepName] = useState('');

  // Estados para la opción "Por Bien Específico"
  const [codigoBienInput, setCodigoBienInput] = useState('');
  
  // Estados comunes
  const [bienesParaEnviar, setBienesParaEnviar] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Para carga inicial (departamentos)
  const [isSearching, setIsSearching] = useState(false); // Para buscar bienes
  const [isGenerating, setIsGenerating] = useState(false); // Para generar el PDF
  const [error, setError] = useState('');

  // Limpiar estados al cerrar el modal
  const resetModalState = useCallback(() => {
    setTipoGeneracion('departamento');
    setDepartamentos([]);
    setSelectedDepId('');
    setSelectedDepName('');
    setCodigoBienInput('');
    setBienesParaEnviar([]);
    setError('');
    setIsLoading(false);
    setIsSearching(false);
    setIsGenerating(false);
  }, []);

  // Hook para manejar el cierre del modal
  useEffect(() => {
    if (!show) {
      // Usamos un timeout para que el estado no se limpie antes de que la animación de cierre termine
      setTimeout(resetModalState, 300);
    }
  }, [show, resetModalState]);


  // Cargar la lista de departamentos cuando el modal se abre
  useEffect(() => {
    if (show) {
      const fetchDepartamentos = async () => {
        setIsLoading(true);
        setError('');
        try {
          const response = await fetch('/api/departamentos', { credentials: 'include' });
          if (!response.ok) {
            throw new Error('No se pudo cargar la lista de departamentos.');
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

  // Hook para buscar bienes cuando se selecciona un departamento
  useEffect(() => {
    if (tipoGeneracion === 'departamento' && selectedDepId) {
      const fetchBienesPorDepartamento = async () => {
        setIsSearching(true);
        setError('');
        setBienesParaEnviar([]);
        try {
          const response = await fetch(`/api/bienes/all?dep=${selectedDepId}&inc=1`);
          if (!response.ok) {
            throw new Error('No se pudieron encontrar bienes para este departamento.');
          }
          const data = await response.json();
          
          // Formatear los datos para el endpoint de PDF
          const bienesFormateados = data.map(bien => ({
            bim_ide: bien.bim_ide,
            departamento: bien.departamento,
            descripcion: bien.bim_des || 'N/A',
            bim_fec: new Date(bien.bim_fec).toLocaleDateString('es-ES') // Formato DD/MM/YYYY
          }));
          
          setBienesParaEnviar(bienesFormateados);

        } catch (err) {
          setError(err.message);
        } finally {
          setIsSearching(false);
        }
      };

      fetchBienesPorDepartamento();
    } else {
        // Limpiar si no hay departamento seleccionado
        setBienesParaEnviar([]);
    }
  }, [selectedDepId, tipoGeneracion]);


  // Handler para cambiar la selección de departamento
  const handleDepartmentChange = (e) => {
    const selectedId = e.target.value;
    setSelectedDepId(selectedId);
    setError('');

    const selectedDep = departamentos.find(dep => dep.dep_ide.toString() === selectedId);
    setSelectedDepName(selectedDep ? selectedDep.dep_nom : '');
  };

  // Handler para buscar un bien específico por su código
  const handleBuscarBienEspecifico = async () => {
    if (!codigoBienInput) return;

    setIsSearching(true);
    setError('');
    setBienesParaEnviar([]);

    try {
      const response = await fetch(`/api/bienes/${codigoBienInput}`);
      if (!response.ok) {
        throw new Error('Este código no está asignado a ningún bien.');
      }
      const data = await response.json();
      
      // Formatear el bien encontrado y ponerlo en un array
      const bienFormateado = {
        bim_ide: data.bim_ide,
        departamento: data.departamento,
        descripcion: data.bim_des,
        bim_fec: new Date(data.bim_fec).toLocaleDateString('es-ES')
      };

      setBienesParaEnviar([bienFormateado]);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  // Handler principal para enviar la solicitud y generar el PDF
  const handleGenerarPDF = async () => {
    if (bienesParaEnviar.length === 0) {
      setError('No hay bienes seleccionados para generar etiquetas.');
      return;
    }
    
    setIsGenerating(true);
    setError('');

    const payload = {
      tipo: "etiquetas",
      datos: {
        // Solo añadir el departamento principal si la generación es por departamento
        ...(tipoGeneracion === 'departamento' && { departamento: selectedDepName }),
        bienes: bienesParaEnviar,
      }
    };

    try {
      const response = await fetch('/api/pdf/etiquetas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error al generar el PDF.' }));
        throw new Error(errorData.message || 'Error desconocido del servidor.');
      }
      
      // Manejar la respuesta del blob (archivo PDF)
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `etiquetas-${selectedDepName || codigoBienInput}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      handleClose(); // Cerrar el modal al generar exitosamente

    } catch (err) {
        setError(err.message);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Generar Etiquetas de Bienes</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label><strong>Tipo de Generación</strong></Form.Label>
          <div>
            <Form.Check
              inline
              label="Por Departamento"
              name="tipoGeneracion"
              type="radio"
              id="radio-depto"
              value="departamento"
              checked={tipoGeneracion === 'departamento'}
              onChange={(e) => setTipoGeneracion(e.target.value)}
            />
            <Form.Check
              inline
              label="Por Bien Específico"
              name="tipoGeneracion"
              type="radio"
              id="radio-individual"
              value="individual"
              checked={tipoGeneracion === 'individual'}
              onChange={(e) => setTipoGeneracion(e.target.value)}
            />
          </div>
        </Form.Group>

        <hr />

        {tipoGeneracion === 'departamento' ? (
          <Form.Group controlId="departamentoSelect" className="mb-3">
            <Form.Label><strong>Seleccione un Departamento</strong></Form.Label>
            <Form.Select
              aria-label="Selector de departamento"
              value={selectedDepId}
              onChange={handleDepartmentChange}
              disabled={isLoading || isSearching}
            >
              <option value="">-- Por favor elija un departamento --</option>
              {departamentos.map((dep) => (
                <option key={dep.dep_ide} value={dep.dep_ide}>
                  {dep.dep_nom}
                </option>
              ))}
            </Form.Select>
            {isLoading && <Spinner animation="border" size="sm" className="mt-2" />}
          </Form.Group>
        ) : (
          <Form.Group className="mb-3">
            <Form.Label><strong>Ingrese el código del bien</strong></Form.Label>
            <div className="d-flex">
              <Form.Control
                type="text"
                value={codigoBienInput}
                onChange={(e) => setCodigoBienInput(e.target.value)}
                placeholder="Ej: CET-00123"
                disabled={isSearching}
              />
              <Button
                variant="primary"
                onClick={handleBuscarBienEspecifico}
                disabled={isSearching || !codigoBienInput}
                className="ms-2"
                style={{ width: '120px' }} 
              >
                {isSearching ? <Spinner as="span" animation="border" size="sm" /> : 'Buscar'}
              </Button>
            </div>
          </Form.Group>
        )}
        
        {(isSearching && tipoGeneracion === 'departamento') && (
            <div className="text-center">
                <Spinner animation="border" variant="primary" />
                <p>Buscando bienes en {selectedDepName}...</p>
            </div>
        )}

        {bienesParaEnviar.length > 0 && (
          <Alert variant="info">
            Se generarán <strong>{bienesParaEnviar.length}</strong> etiqueta(s).
          </Alert>
        )}

      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose} disabled={isGenerating}>
          Cancelar
        </Button>
        <Button 
            variant="success" 
            onClick={handleGenerarPDF} 
            disabled={isGenerating || isSearching || bienesParaEnviar.length === 0}
            style={{ width: '160px' }} 
        >
          {isGenerating ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              {' '}Generando...
            </>
          ) : (
            'Generar PDF'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalGenerarEtiquetas;