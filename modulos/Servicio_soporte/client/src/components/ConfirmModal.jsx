import React from "react";
import { Modal, Button } from "react-bootstrap";

export const ConfirmModal = ({
    show,
    onHide,
    onConfirm,
    title = "Confirmar Acción",
    message = "¿Está seguro de realizar esta acción?",
    confirmText = "Sí, Eliminar",
    cancelText = "Cancelar",
    variant = "danger",
    loading = false,
}) => {
    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    {cancelText}
                </Button>
                <Button variant={variant} onClick={onConfirm} disabled={loading}>
                    {loading ? "Procesando..." : confirmText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
