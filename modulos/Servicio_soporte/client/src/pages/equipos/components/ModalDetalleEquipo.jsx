import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FichaTecnicaEquipoInline } from "./FichaTecnicaEquipoInline";

export const ModalDetalleEquipo = ({ show, onHide, equipo }) => {
    if (!equipo) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="bg-light">
                <Modal.Title>
                    <i className="bx bx-file me-2"></i>
                    Ficha Técnica: {equipo.nro_bien}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
                <FichaTecnicaEquipoInline equipo={equipo} />
            </Modal.Body>
            <Modal.Footer className="bg-light">
                <Button variant="secondary" onClick={onHide}>Cerrar Vista</Button>
            </Modal.Footer>
        </Modal>
    );
};
