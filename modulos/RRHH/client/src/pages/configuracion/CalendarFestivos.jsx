import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const API_FESTIVOS = '/api/rrhh/festivos';

export const CalendarFestivos = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [festivos, setFestivos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [formData, setFormData] = useState({ id_festivo: null, descripcion: '', recurrente: false });
    const [saving, setSaving] = useState(false);

    const loadFestivos = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_FESTIVOS);
            if (!res.ok) throw new Error(`Error al cargar festivos: ${res.status}`);
            const data = await res.json();
            setFestivos(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadFestivos(); }, []);

    const flash = (setter, msg) => { setter(msg); setTimeout(() => setter(''), 4000); };

    const changeMonth = (offset) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    const openModalForDate = (dateStr, existing = null) => {
        if (existing) {
            setFormData({ id_festivo: existing.id_festivo, descripcion: existing.descripcion, recurrente: Boolean(existing.recurrente) });
        } else {
            setFormData({ id_festivo: null, descripcion: '', recurrente: false });
        }
        setSelectedDate(dateStr);
        setShowModal(true);
    };

    const openModalBlank = () => {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        setFormData({ id_festivo: null, descripcion: '', recurrente: false });
        setSelectedDate(dateStr);
        setShowModal(true);
    };

    const handleDayClick = (day) => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const existing = findFestivo(day, month, year);
        openModalForDate(dateStr, existing);
    };

    const findFestivo = (day, month, year) => festivos.find(f => {
        const raw = (typeof f.fecha === 'string' ? f.fecha : '').split('T')[0] || f.fecha;
        const fDate = new Date(raw + 'T00:00:00');
        if (f.recurrente) return fDate.getMonth() === month && fDate.getDate() === day;
        return fDate.getFullYear() === year && fDate.getMonth() === month && fDate.getDate() === day;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate) return;
        setSaving(true);
        try {
            const method = formData.id_festivo ? 'PUT' : 'POST';
            const url = formData.id_festivo ? `${API_FESTIVOS}/${formData.id_festivo}` : API_FESTIVOS;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fecha: selectedDate, descripcion: formData.descripcion, recurrente: formData.recurrente })
            });
            if (!res.ok) throw new Error('Error al guardar festivo');
            flash(setSuccess, 'Día festivo guardado exitosamente');
            setShowModal(false);
            loadFestivos();
        } catch (err) {
            flash(setError, err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!formData.id_festivo) return;
        if (!window.confirm('¿Seguro que deseas eliminar este día festivo?')) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_FESTIVOS}/${formData.id_festivo}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error al eliminar festivo');
            flash(setSuccess, 'Día festivo eliminado');
            setShowModal(false);
            loadFestivos();
        } catch (err) {
            flash(setError, err.message);
        } finally {
            setSaving(false);
        }
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        const cells = [];

        // Blanks
        for (let i = 0; i < firstDay; i++) {
            cells.push(
                <div key={`b${i}`} style={{ width: '14.28%', minHeight: '72px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }} />
            );
        }

        // Days
        for (let day = 1; day <= daysInMonth; day++) {
            const festivo = findFestivo(day, month, year);
            cells.push(
                <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    style={{
                        width: '14.28%',
                        minHeight: '72px',
                        border: festivo ? '1px solid #dc3545' : '1px solid #dee2e6',
                        backgroundColor: festivo ? '#ffe0e3' : '#fff',
                        cursor: 'pointer',
                        padding: '6px 8px',
                        transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (!festivo) e.currentTarget.style.backgroundColor = '#f1f3f5'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = festivo ? '#ffe0e3' : '#fff'; }}
                >
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{day}</div>
                    {festivo && (
                        <div style={{ fontSize: '0.7rem', color: '#dc3545', lineHeight: 1.2, marginTop: 2 }}>
                            <i className="bx bx-star" /> {festivo.descripcion}{festivo.recurrente ? ' ★' : ''}
                        </div>
                    )}
                </div>
            );
        }

        // Fill remaining
        while (cells.length % 7 !== 0) {
            cells.push(
                <div key={`e${cells.length}`} style={{ width: '14.28%', minHeight: '72px', backgroundColor: '#f8f9fa', border: '1px solid #dee2e6' }} />
            );
        }

        return (
            <>
                {/* Header días */}
                <div style={{ display: 'flex', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6' }}>
                    {DIAS.map(d => (
                        <div key={d} style={{ width: '14.28%', textAlign: 'center', padding: '8px 0', fontWeight: 600, fontSize: '0.85rem', borderRight: '1px solid #dee2e6' }}>
                            {d}
                        </div>
                    ))}
                </div>
                {/* Grid de días */}
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {cells}
                </div>
            </>
        );
    };

    return (
        <div className="card mb-4 shadow-sm">
            {/* Header */}
            <div className="card-header d-flex justify-content-between align-items-center" style={{ flexWrap: 'wrap', gap: '8px' }}>
                <div>
                    <h5 className="mb-0">Días Festivos</h5>
                    <small className="text-muted">Haga clic en un día para marcarlo como feriado. Serán excluidos del cálculo de vacaciones.</small>
                </div>
                <div className="d-flex align-items-center gap-2" style={{ flexWrap: 'wrap' }}>
                    {/* Botón agregar manual */}
                    <button className="btn btn-primary btn-sm" onClick={openModalBlank}>
                        <i className="bx bx-plus me-1"></i> Agregar Festivo
                    </button>
                    {/* Navegación mes */}
                    <div className="d-flex align-items-center gap-1 ms-2">
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => changeMonth(-1)}>
                            <i className="bx bx-chevron-left"></i>
                        </button>
                        <span className="fw-semibold" style={{ minWidth: '130px', textAlign: 'center', fontSize: '0.95rem' }}>
                            {MESES[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button className="btn btn-outline-secondary btn-sm" onClick={() => changeMonth(1)}>
                            <i className="bx bx-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="card-body p-0">
                {error && <div className="p-3"><Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert></div>}
                {success && <div className="p-3"><Alert variant="success" onClose={() => setSuccess('')} dismissible>{success}</Alert></div>}

                {loading ? (
                    <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
                ) : (
                    renderCalendar()
                )}
            </div>

            {/* Lista de festivos del mes */}
            {festivos.length > 0 && (
                <div className="card-footer bg-light">
                    <small className="text-muted fw-semibold">Festivos configurados este mes:</small>
                    <div className="d-flex flex-wrap gap-2 mt-1">
                        {festivos
                            .filter(f => {
                                const raw = (typeof f.fecha === 'string' ? f.fecha : '').split('T')[0];
                                const fDate = new Date(raw + 'T00:00:00');
                                return f.recurrente ? fDate.getMonth() === currentDate.getMonth()
                                    : fDate.getFullYear() === currentDate.getFullYear() && fDate.getMonth() === currentDate.getMonth();
                            })
                            .map(f => {
                                const raw = (typeof f.fecha === 'string' ? f.fecha : '').split('T')[0];
                                const fDate = new Date(raw + 'T00:00:00');
                                return (
                                    <span key={f.id_festivo} className="badge bg-danger-subtle text-danger border border-danger" style={{ fontSize: '0.8rem' }}>
                                        {fDate.getDate()} — {f.descripcion}{f.recurrente ? ' (Anual)' : ''}
                                    </span>
                                );
                            })
                        }
                        {festivos.filter(f => {
                            const raw = (typeof f.fecha === 'string' ? f.fecha : '').split('T')[0];
                            const fDate = new Date(raw + 'T00:00:00');
                            return f.recurrente ? fDate.getMonth() === currentDate.getMonth()
                                : fDate.getFullYear() === currentDate.getFullYear() && fDate.getMonth() === currentDate.getMonth();
                        }).length === 0 && (
                            <small className="text-muted fst-italic">Ninguno en este mes</small>
                        )}
                    </div>
                </div>
            )}

            {/* Modal agregar/editar */}
            <Modal show={showModal} onHide={() => setShowModal(false)} backdrop="static">
                <Form onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                        <Modal.Title>
                            <i className={`bx ${formData.id_festivo ? 'bx-edit' : 'bx-calendar-plus'} me-2`}></i>
                            {formData.id_festivo ? 'Editar Día Festivo' : 'Nuevo Día Festivo'}
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha</Form.Label>
                            <Form.Control
                                type="date"
                                required
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción del Feriado</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ej: Año Nuevo, Día del Trabajador..."
                                required
                                value={formData.descripcion}
                                onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mb-2">
                            <Form.Check
                                type="checkbox"
                                label="Recurrente — se repite cada año en esta misma fecha"
                                checked={formData.recurrente}
                                onChange={e => setFormData({ ...formData, recurrente: e.target.checked })}
                            />
                        </Form.Group>
                        <small className="text-muted">
                            Los días festivos recurrentes aplican para todos los años automáticamente (ej: 1ero de Enero).
                        </small>
                    </Modal.Body>
                    <Modal.Footer className="justify-content-between">
                        {formData.id_festivo ? (
                            <Button variant="outline-danger" type="button" onClick={handleDelete} disabled={saving}>
                                <i className="bx bx-trash me-1"></i> Eliminar
                            </Button>
                        ) : <div />}
                        <div className="d-flex gap-2">
                            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
                                Cancelar
                            </Button>
                            <Button variant="primary" type="submit" disabled={saving}>
                                {saving ? <><Spinner size="sm" className="me-1" /> Guardando...</> : 'Guardar'}
                            </Button>
                        </div>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default CalendarFestivos;
