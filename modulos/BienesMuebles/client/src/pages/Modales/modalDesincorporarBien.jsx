// components/modals/ModalDesincorporarBien.js

import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Alert from "../../components/atoms/Alert"; // Asegúrate que la ruta sea correcta

// Componente del Modal para Desincorporar un Bien
function ModalDesincorporarBien({ show, handleClose, BienId, onSuccess }) {
  // Estado para los campos del formulario de desincorporación
  const [comIde, setComIde] = useState('');
  const [bimFed, setBimFed] = useState('');

  // Estados para la gestión del modal y la comunicación
  const [formEnviado, setFormEnviado] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [tipoMensaje, setTipoMensaje] = useState('danger');
  
  // Estados para la búsqueda del bien
  const [bienData, setBienData] = useState(null);
  const [codigoBienInput, setCodigoBienInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Hook para buscar los datos del bien si se pasa un ID como prop
  useEffect(() => {
    if (BienId) {
      fetchBienData(BienId);
    }
  }, [BienId]);

  // Limpia el estado cuando el modal se cierra o cambia el BienId
  useEffect(() => {
    if (!show) {
      limpiarFormulario();
    }
  }, [show]);


  const limpiarFormulario = () => {
    setBienData(null);
    setCodigoBienInput('');
    setComIde('');
    setBimFed('');
    setMensaje('');
    setFormEnviado(false);
  };
  
  // Función para buscar un bien por su código
  const fetchBienData = async (id) => {
    if (!id) return;
    setLoading(true);
    setMensaje('');
    try {
      const response = await fetch(`/api/bienes/${id}`); // Ajusta si tu ruta base es otra
      if (!response.ok) {
        throw new Error('No se pudo encontrar el bien con el código proporcionado.');
      }
      const data = await response.json();
      setBienData(data);
    } catch (error) {
      setBienData(null);
      setTipoMensaje('danger');
      setMensaje(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Maneja el envío del formulario de desincorporación
  const handleSubmit = async () => {
    if (!bienData || !comIde || !bimFed) {
        setTipoMensaje('danger');
        setMensaje('Debe seleccionar la condición de movimiento y la fecha.');
        return;
    }

    const datosParaDesincorporar = {
      com_ide: comIde,
      bim_fed: bimFed
    };

    setLoading(true);
    setMensaje('');

    try {
      const response = await fetch(`/api/bienes/${bienData.bim_ide}/desincorporar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // Incluir token de autenticación si es necesario
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosParaDesincorporar)
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || 'Ocurrió un error al desincorporar el bien.');
      }

      setTipoMensaje('success');
      setMensaje('¡Bien desincorporado con éxito!');
      setFormEnviado(true);

      // Llama a la función onSuccess para que el componente padre pueda refrescar la lista de bienes
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        handleClose();
      }, 2000); // Cierra el modal después de 2 segundos

    } catch (error) {
      setTipoMensaje('danger');
      setMensaje(error.message);
      setFormEnviado(false);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Desincorporar Bien Mueble</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Muestra el buscador solo si no se ha pasado un ID de bien directamente */}
          {!BienId && (
            <Form.Group className="mb-3">
              <Form.Label>Ingrese el código del bien a desincorporar</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="text"
                  value={codigoBienInput}
                  onChange={(e) => setCodigoBienInput(e.target.value)}
                  placeholder="Código del bien"
                  disabled={loading}
                />
                <Button 
                  variant="primary" 
                  onClick={() => fetchBienData(codigoBienInput)}
                  disabled={loading || !codigoBienInput}
                  className="ms-2"
                >
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </Form.Group>
          )}

          {/* Alerta para mostrar mensajes de éxito o error */}
          {mensaje && (
             <Alert type={tipoMensaje}>
               {mensaje}
             </Alert>
          )}

          {/* Muestra los datos del bien una vez que se ha encontrado */}
          {bienData && (
            <>
              <h5>Datos del Bien</h5>
              <p><strong>Código:</strong> {bienData.bim_ide || 'N/A'}</p>
              <p><strong>Descripción:</strong> {bienData.bim_des || 'N/A'}</p>
              <p><strong>Departamento Actual:</strong> {bienData.departamento || 'N/A'}</p>
              <hr />

              {/* Campos para la desincorporación */}
              <Form.Group className="mb-3" controlId="com_ide">
                <Form.Label>Condición del Movimiento (Desincorporación)</Form.Label>
                <Form.Select 
                  aria-label="Seleccione la condición"
                  value={comIde}
                  onChange={(e) => setComIde(e.target.value)}
                  disabled={formEnviado}
                >
                  <option value="">-- Seleccionar una opción --</option>
                  {/* Aquí deberías cargar las opciones desde tu BD */}
                  <option value="10">OBSOLESCENCIA</option>
                  <option value="11">DESUSO</option>
                  <option value="12">ROBO O HURTO</option>
                  <option value="13">DAÑO</option>
                  <option value="14">OTRO</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="bim_fed">
                <Form.Label>Fecha de Desincorporación</Form.Label>
                <Form.Control 
                  type="date" 
                  value={bimFed}
                  onChange={(e) => setBimFed(e.target.value)}
                  disabled={formEnviado}
                />
              </Form.Group>
            </>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          onClick={handleSubmit}
          disabled={!bienData || loading || formEnviado}
        >
          {loading ? 'Procesando...' : 'Desincorporar Bien'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalDesincorporarBien;