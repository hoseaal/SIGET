import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';

const InfiniteSelect = ({ options, value, onChange, direction = 'right', onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);

  // Filtrar opciones basadas en el término de búsqueda
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Renderizar cada item de la lista
   const Row = ({ index, style }) => (
    <div
      style={style}
      className={`dropdown-item ${value === filteredOptions[index].value ? 'active' : ''}`}
      onClick={() => {
        onChange(filteredOptions[index].value); // Esto ejecutará handleTipoChange
        setIsOpen(false);
      }}
    >
      {filteredOptions[index].label}
    </div>
  );

  // Calcular altura del menú (máximo 300px)
  const menuHeight = Math.min(100, filteredOptions.length * 35);

  const handleButtonClick = useCallback(() => {
        const newState = !isOpen;
        setIsOpen(newState);
        if (onToggle) {
            onToggle(newState); // Notificar al padre sobre el cambio de estado
        }
    }, [isOpen, onToggle]);

     useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setIsOpen(false);
                if (onToggle) {
                    onToggle(false); // Notificar al padre sobre el cierre
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectRef, onToggle]);

     const getMenuStyle = () => {
        if (!selectRef.current) return {};
        const rect = selectRef.current.getBoundingClientRect();
        const style = {
            width: rect.width,
            top: rect.height,
            zIndex: 1050,
            // maxHeight: menuHeight + 'px', // Opcional: podríamos necesitar ajustar esto
            position: 'absolute',
            left: 'auto',
            right: 'auto',
            // Eliminar overflowY: 'auto' aquí
            // overflowY: 'auto', // <--- ELIMINAR ESTA LÍNEA
        };

        if (direction === 'left') {
            style.right = 0;
        } else {
            style.left = 0;
        }
        return style;
    };

  return (
    <div className={`dropdown ${direction === 'left' ? 'dropend' : ''}`} ref={selectRef}>
      <button
        className="btn btn-primary dropdown-toggle"
        onClick={handleButtonClick}
      >
        {options.find(opt => opt.value === value)?.label || 'Tipo'}
      </button>
      
      {isOpen && (
        <div className="dropdown-menu show" style={getMenuStyle()}>
          {/* Campo de búsqueda */}
          <div className="px-2 py-1">
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          
          {/* Lista con infinite scroll */}
          {filteredOptions.length > 0 ? (
                        <List
                            height={menuHeight}
                            itemCount={filteredOptions.length}
                            itemSize={35}
                            width="100%"
                        >
                            {Row}
                        </List>
                    ) : (
                        <div className="dropdown-item text-muted">No hay opciones</div>
                    )}
        </div>
      )}
    </div>
  );
};

// Componente para el filtro de tipo
const EstadoDeUsoSelect = ({ tipoBien, value, onChange }) => {
  // Preparar opciones
  const options = [
    { value: null, label: 'Condicion fisica' },
    ...tipoBien.map(item => ({
      value: item.con_ide,
      label: item.con_con
    }))
  ];

  return (
    <InfiniteSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Condición física"
    />
  );
};

const EstadoSelect = ({ tipoBien, value, onChange, onToggle }) => {
  // Preparar opciones
  const options = [
    { value: null, label: 'Estado' },
    ...tipoBien.map(item => ({
      value: item.est_ide,
      label: item.est_est
    }))
  ];

  return (
    <InfiniteSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Estados"
      direction= "left"
      onToggle={onToggle}
    />
  );
};

const DepartamentoSelect = ({ tipoBien, value, onChange, onToggle }) => {
  // Preparar opciones
  const options = [
    { value: null, label: 'Departamento' },
    ...tipoBien.map(item => ({
      value: item.dep_ide,
      label: item.dep_nom
    }))
  ];

  return (
    <InfiniteSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Departamentos"
      direction= "left"
      onToggle={onToggle}
    />
  );
};

export {EstadoSelect, EstadoDeUsoSelect, DepartamentoSelect};