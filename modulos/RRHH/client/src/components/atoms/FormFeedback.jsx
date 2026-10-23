import React from 'react';

/**
 * Mensaje de validación o de error del servidor para mostrar dentro de un modal.
 * Mantiene el mensaje principal, el detalle por campo y una recomendación de qué hacer.
 */
const FormFeedback = ({
    type = 'danger',
    title,
    message,
    items = [],
    hint,
    onClose
}) => {
    if (!title && !message && items.length === 0) return null;

    const icono = type === 'success'
        ? 'bx-check-circle'
        : type === 'warning'
            ? 'bx-error'
            : 'bx-error-circle';

    return (
        <div
            className={`alert alert-${type} alert-dismissible d-flex align-items-start`}
            role="alert"
            aria-live="assertive"
        >
            <i className={`bx ${icono} fs-5 me-2 mt-1`} aria-hidden="true"></i>

            <div className="flex-grow-1">
                {title && <h6 className="alert-heading mb-2">{title}</h6>}
                {message && <p className="mb-2">{message}</p>}

                {items.length > 0 && (
                    <ul className="mb-2 ps-3">
                        {items.map((item, index) => (
                            <li key={`${item.label || 'campo'}-${index}`}>
                                {item.label && <strong>{item.label}: </strong>}
                                {item.message}
                            </li>
                        ))}
                    </ul>
                )}

                {hint && <p className="mb-0 small">{hint}</p>}
            </div>

            {onClose && (
                <button
                    type="button"
                    className="btn-close"
                    aria-label="Cerrar mensaje"
                    onClick={onClose}
                ></button>
            )}
        </div>
    );
};

export default FormFeedback;
