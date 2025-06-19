import React from 'react'
import { useState, useEffect } from "react"
import ModalActaVerificacion  from '../Modales/modalActaVerificacion'
export const Reportes = () => {
    const [showVeriModal, setShowVeriModal] = useState(false);
    
      const handleOpenModal = () => setShowVeriModal(true);
    
       const handleCloseModal = () => {
        console.log("Cerrando modal...", showVeriModal);
        setShowVeriModal(false);
      };
    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="py-3 mb-4"><span className="text-muted fw-light">Reportes/</span> </h4>
            </div>
            <div className="card">
                <h5 className="card-header">Generacion de reportes</h5>
                <div className="card-body">
                        
                            <button id="exportToExcel" className="btn btn-primary btn-lg ms-1" onClick={handleOpenModal}>
                                    <i className="bx bx-file me-1"></i> Generar Acta de verificacion
                                </button>

                            <button id="exportToExcel" className="btn btn-primary btn-lg ms-1" >
                                <i className="bx bx-file me-1"></i> Generar Etiquetas
                            </button>
                </div>
            </div>

                <ModalActaVerificacion
                    show={showVeriModal}
                    handleClose={handleCloseModal}
                />
        </>
    )
}