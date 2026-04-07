import React, { useState, useEffect } from 'react';
import { Form, Modal, Button } from 'react-bootstrap';
import Alert from "../../components/atoms/Alert";

export const ModalInsertNivelSalarial = ({ show, handleClose, onSuccess, dataOna, matrizNiveles, tableName = 'niveles_salariales' }) => {
    // ==========================================
    // CONFIGURACIÓN DINÁMICA SEGÚN LA TABLA
    // ==========================================

    console.log('Tabla en ModalInsertNivelSalarial:', tableName);
    const isAntiguo = tableName === 'niveles_salariales_antiguos';
    const endpoint = isAntiguo ? '/api/niveles-salariales-antiguos' : '/api/niveles-salariales';
    const fieldNom = isAntiguo ? 'nombre' : 'niv_nom';
    const fieldSal = isAntiguo ? 'salario_antiguo' : 'salario_base';

    // Usamos nombres genéricos en el estado para facilitar el manejo de los inputs
    const [formData, setFormData] = useState({ cargo_onapre_id: '', nom: '', sal: '' });
    const [enviando, setEnviando] = useState(false);
    const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

    const todosLosNiveles = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

    // Calculamos qué niveles están ocupados para el cargo seleccionado
    const nivelesOcupados = formData.cargo_onapre_id && matrizNiveles[formData.cargo_onapre_id] 
        ? Object.keys(matrizNiveles[formData.cargo_onapre_id]) 
        : [];
    
    // Filtramos los niveles que aún están disponibles
    const nivelesDisponibles = todosLosNiveles.filter(lvl => !nivelesOcupados.includes(lvl));
    const estaLleno = formData.cargo_onapre_id !== '' && nivelesDisponibles.length === 0;

    // Resetear formulario al abrir/cerrar
    useEffect(() => {
        if (show) {
            setFormData({ cargo_onapre_id: '', nom: '', sal: '' });
            setMensaje({ tipo: '', texto: '' });
        }
    }, [show]);

    // Limpiar el nivel seleccionado si se cambia de cargo ONAPRE
    const handleChangeCargo = (e) => {
        setFormData({ ...formData, cargo_onapre_id: e.target.value, nom: '' });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setEnviando(true);
        setMensaje({ tipo: '', texto: '' });

        // Construir el objeto a enviar con los nombres de campos que pide la API
        const payload = {
            cargo_onapre_id: formData.cargo_onapre_id,
            [fieldNom]: formData.nom,
            [fieldSal]: formData.sal
        };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Error al insertar el nivel salarial');
            }

            setMensaje({ tipo: 'success', texto: 'Nivel registrado con éxito' });
            setTimeout(() => {
                handleClose();
                if (onSuccess) onSuccess();
            }, 1000);
        } catch (error) {
            setMensaje({ tipo: 'danger', texto: error.message });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>
                    {isAntiguo ? 'Agregar Nivel Salarial Antiguo' : 'Agregar Nuevo Nivel Salarial'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form id="formInsertNivel" onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Cargo ONAPRE</Form.Label>
                        <Form.Select name="cargo_onapre_id" value={formData.cargo_onapre_id} onChange={handleChangeCargo} required>
                            <option value="">Seleccione el cargo...</option>
                            {dataOna.map((ona) => (
                                <option key={ona.cargo_onapre_id} value={ona.cargo_onapre_id}>
                                    {ona.nombre}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {estaLleno ? (
                        <Alert type="warning">
                            Este cargo ONAPRE ya tiene los VII niveles salariales registrados. No se pueden agregar más.
                        </Alert>
                    ) : (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Nivel Salarial</Form.Label>
                                <Form.Select 
                                    name="nom" 
                                    value={formData.nom} 
                                    onChange={handleChange} 
                                    required 
                                    disabled={!formData.cargo_onapre_id}
                                >
                                    <option value="">Seleccione el nivel...</option>
                                    {nivelesDisponibles.map((lvl) => (
                                        <option key={lvl} value={lvl}>Nivel {lvl}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Salario Mensual (Bs)</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    name="sal"
                                    value={formData.sal}
                                    onChange={handleChange}
                                    placeholder="Ej: 130.00"
                                    required
                                    disabled={!formData.cargo_onapre_id}
                                />
                            </Form.Group>
                        </>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                <Button variant="primary" type="submit" form="formInsertNivel" disabled={enviando || estaLleno}>
                    {enviando ? 'Guardando...' : 'Guardar Nivel'}
                </Button>
            </Modal.Footer>
            {mensaje.texto && (
                <div className="p-3 pb-0">
                    <Alert type={mensaje.tipo}>{mensaje.texto}</Alert>
                </div>
            )}
        </Modal>
    );
};
