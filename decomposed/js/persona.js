// Persona Card Component
const PersonaCard = ({ persona, onUpdate, onDelete }) => {
    return (
        <div className="persona-card">
            <div className="persona-header">
                <span className="persona-emoji">{persona.emoji}</span>
                <span className="persona-title">PERSONA CARD</span>
                <input 
                    type="text" 
                    className="persona-name" 
                    value={persona.name} 
                    onChange={(e) => onUpdate(persona.cardId, { name: e.target.value })}
                    style={{ 
                        border: '1px solid var(--deep-blue)',
                        background: '#f0f8ff',
                        borderRadius: '0.75rem',
                        padding: '0.5rem',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        outline: 'none'
                    }}
                />
            </div>
            
            <select 
                value={persona.direction}
                onChange={(e) => onUpdate(persona.cardId, { direction: e.target.value })}
                className="direction-selector"
            >
                <option value="from">AUTHOR</option>
                <option value="to">AUDIENCE</option>
            </select>
            
            <textarea
                value={persona.description}
                onChange={(e) => onUpdate(persona.cardId, { description: e.target.value })}
                className="persona-textarea"
                spellCheck="true"
                rows="6"
            />
            
            <button 
                onClick={() => onDelete(persona.cardId)}
                className="btn btn-danger"
            >
                Delete
            </button>
        </div>
    );
};

// Persona Tray Component
const PersonaTray = ({ onAddPersona }) => {
    const [selectedPersona, setSelectedPersona] = React.useState('');

    const handleAddPersona = () => {
        if (selectedPersona) {
            const persona = PERSONAS.find(p => p.id === selectedPersona);
            onAddPersona({
                ...persona,
                cardId: Date.now(),
                direction: 'from'
            });
            setSelectedPersona('');
        }
    };

    return (
        <div className="persona-tray">
            <div className="persona-selector-container">
                <select 
                    value={selectedPersona}
                    onChange={(e) => setSelectedPersona(e.target.value)}
                    className="persona-selector"
                >
                    <option value="">Select Persona...</option>
                    {PERSONAS.map(persona => (
                        <option key={persona.id} value={persona.id}>
                            {persona.emoji} {persona.name}
                        </option>
                    ))}
                </select>
                <button 
                    onClick={handleAddPersona}
                    className="add-persona-btn"
                    disabled={!selectedPersona}
                >
                    +
                </button>
            </div>
        </div>
    );
};
