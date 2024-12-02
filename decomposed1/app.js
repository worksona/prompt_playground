// Access configuration from global scope
const { PERSONAS, OPENAI_MODELS, SUPPORTED_IMAGE_TYPES, MAX_IMAGE_SIZE } = window.config;

// Import React hooks from global scope
const { useState, useEffect } = React;

// Voronoi Background Component
const VoronoiBackground = () => {
    useEffect(() => {
        const canvas = document.getElementById('voronoi-canvas');
        const context = canvas.getContext('2d');
        const numPoints = 100;
        const points = [];
        let width = window.innerWidth;
        let height = window.innerHeight;
        let animationFrameId;

        class Point {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 2;
                this.vy = (Math.random() - 0.5) * 2;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
        }

        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        function initPoints() {
            points.length = 0;
            for (let i = 0; i < numPoints; i++) {
                points.push(new Point());
            }
        }

        function drawVoronoi() {
            context.clearRect(0, 0, width, height);
            points.forEach(point => point.update());
            const delaunay = d3.Delaunay.from(points.map(p => [p.x, p.y]));
            const voronoi = delaunay.voronoi([0, 0, width, height]);
            context.beginPath();
            context.strokeStyle = "rgba(90, 125, 154, 0.2)";
            voronoi.render(context);
            context.stroke();
        }

        function animate() {
            drawVoronoi();
            animationFrameId = requestAnimationFrame(animate);
        }

        resizeCanvas();
        initPoints();
        window.addEventListener('resize', () => {
            resizeCanvas();
            initPoints();
        });
        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return null;
};

// File Processing Utility
const FileProcessor = {
    async readPDFFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let text = '';
            
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const strings = content.items.map(item => item.str);
                text += strings.join(' ') + '\n';
            }
            
            return text.trim();
        } catch (error) {
            console.error('PDF Processing Error:', error);
            throw new Error(`Failed to process PDF file: ${error.message}`);
        }
    },

    async readDocFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            return result.value.trim();
        } catch (error) {
            console.error('DOC Processing Error:', error);
            throw new Error(`Failed to process DOC/DOCX file: ${error.message}`);
        }
    },

    async readTextFile(file) {
        try {
            const text = await file.text();
            return text.trim();
        } catch (error) {
            console.error('Text File Processing Error:', error);
            throw new Error(`Failed to read text file: ${error.message}`);
        }
    },

    async processImage(file) {
        if (!file || !SUPPORTED_IMAGE_TYPES.includes(file.type)) {
            throw new Error('Unsupported image type');
        }

        if (file.size > MAX_IMAGE_SIZE) {
            throw new Error('Image size too large (max 10MB)');
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Error reading image'));
            reader.readAsDataURL(file);
        });
    },

    async processFile(file) {
        if (!file) throw new Error('No file provided');

        const fileType = file.type;
        if (SUPPORTED_IMAGE_TYPES.includes(fileType)) {
            return await this.processImage(file);
        }

        const extension = file.name.toLowerCase().split('.').pop();
        switch (extension) {
            case 'pdf':
                return await this.readPDFFile(file);
            case 'doc':
            case 'docx':
                return await this.readDocFile(file);
            case 'txt':
            case 'md':
                return await this.readTextFile(file);
            default:
                throw new Error(`Unsupported file type: ${extension}`);
        }
    }
};
// React Components
const CopyButton = ({ text }) => {
    const [copied, setCopied] = useState(false);
    
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button 
            onClick={copyToClipboard} 
            className="copy-button" 
            title={copied ? "Copied!" : "Copy to clipboard"}
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {copied ? (
                    <path d="M20 6L9 17l-5-5"/>
                ) : (
                    <>
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </>
                )}
            </svg>
        </button>
    );
};

const ProcessingIndicator = ({ isVisible }) => (
    <div className={`processing-file ${!isVisible ? 'hidden' : ''}`}>
        <h3>Processing File...</h3>
        <p>Please wait while we process your content</p>
    </div>
);

const LoginScreen = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (password === 'wowsona' && apiKey) {
            onLogin(apiKey);
        } else {
            setError('Incorrect password or missing API key');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    return (
        <div className="login-screen">
            <div className="login-box">
                <h2 style={{ marginBottom: '1rem', color: 'var(--deep-blue)' }}>Login Required</h2>
                <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="password-input"
                    onKeyPress={handleKeyPress}
                />
                <input
                    type="text"
                    placeholder="Enter OpenAI API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="api-key-input"
                    onKeyPress={handleKeyPress}
                />
                <button 
                    onClick={handleLogin}
                    className="btn btn-primary"
                >
                    Login
                </button>
                {error && <div className="error">{error}</div>}
            </div>
        </div>
    );
};

const PersonaCard = ({ persona, onUpdate, onDelete }) => {
    const handleNameChange = (e) => {
        onUpdate(persona.cardId, { name: e.target.value });
    };

    const handleDirectionChange = (e) => {
        onUpdate(persona.cardId, { direction: e.target.value });
    };

    const handleDescriptionChange = (e) => {
        onUpdate(persona.cardId, { description: e.target.value });
    };

    return (
        <div className="persona-card">
            <div className="persona-header">
                <span className="persona-emoji">{persona.emoji}</span>
                <span className="persona-title">PERSONA CARD</span>
                <input 
                    type="text" 
                    className="persona-name" 
                    value={persona.name} 
                    onChange={handleNameChange}
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
                onChange={handleDirectionChange}
                className="direction-selector"
            >
                <option value="from">AUTHOR</option>
                <option value="to">AUDIENCE</option>
            </select>
            
            <textarea
                value={persona.description}
                onChange={handleDescriptionChange}
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

const PersonaTray = ({ onAddPersona }) => {
    const [selectedPersona, setSelectedPersona] = useState('');

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
        <div className="persona-tray" style={{ marginBottom: '1rem' }}>
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
const PromptCard = ({ prompt, sourceOptions, loading, onUpdate, onDelete, onRun, uploadedImages }) => {
    const isImageMode = prompt.sourceType === 'image';

    const handleSourceTypeChange = (type) => {
        onUpdate(prompt.id, { 
            sourceType: type, 
            selectedImage: type === 'image' ? prompt.selectedImage : null,
            source: type === 'text' ? prompt.source : 'SOURCE'
        });
    };

    const handleImageSelect = (e) => {
        onUpdate(prompt.id, { selectedImage: parseInt(e.target.value) });
    };

    const handleSourceSelect = (e) => {
        onUpdate(prompt.id, { source: e.target.value });
    };

    const handleTextChange = (e) => {
        onUpdate(prompt.id, { text: e.target.value });
    };

    return (
        <div className={`prompt-card ${isImageMode ? 'image-mode' : ''}`}>
            <div className="source-type-selector">
                <button 
                    className={`source-type-button ${!isImageMode ? 'active' : ''}`}
                    onClick={() => handleSourceTypeChange('text')}
                >
                    Text
                </button>
                <button 
                    className={`source-type-button ${isImageMode ? 'active' : ''}`}
                    onClick={() => handleSourceTypeChange('image')}
                >
                    Image
                </button>
            </div>

            {isImageMode ? (
                <select
                    value={prompt.selectedImage || ''}
                    onChange={handleImageSelect}
                    className="source-selector"
                >
                    <option value="">Select an image...</option>
                    {uploadedImages.map(img => (
                        <option key={img.id} value={img.id}>
                            {img.name || `Image ${img.id}`}
                        </option>
                    ))}
                </select>
            ) : (
                <select 
                    value={prompt.source}
                    onChange={handleSourceSelect}
                    className="source-selector"
                >
                    <option value="SOURCE">SOURCE</option>
                    {sourceOptions.map(option => (
                        <option key={option.id} value={`RESULT${option.id}`}>
                            RESULT{option.id}
                        </option>
                    ))}
                </select>
            )}
            
            <textarea
                value={prompt.text}
                onChange={handleTextChange}
                placeholder={isImageMode ? "Enter your image analysis prompt..." : "Enter your prompt..."}
                className="prompt-textarea"
                spellCheck="true"
                autoComplete="off"
                rows="6"
            />
            
            <div className="result-label">RESULT{prompt.id}</div>
            
            <div className="result-container">
                <textarea
                    value={prompt.result || ''}
                    readOnly
                    placeholder="Results will appear here..."
                    className="result-textarea"
                    rows="8"
                />
                <CopyButton text={prompt.result || ''} />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                    onClick={() => onRun(prompt.id)} 
                    className="btn btn-success"
                    disabled={loading || (isImageMode && !prompt.selectedImage)}
                >
                    {loading ? (
                        <span className="loading-spinner" />
                    ) : (
                        isImageMode ? 'Analyze Image' : 'Run'
                    )}
                </button>
                <button 
                    onClick={() => onDelete(prompt.id)}
                    className="btn btn-danger"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

// Image Tray Component
const ImageTray = ({ images, onDeleteImage }) => (
    <div className="image-tray">
        <div className="image-tray-title">Uploaded Images</div>
        <div className="image-preview-list">
            {images.map(image => (
                <div key={image.id} className="image-preview-item">
                    <img src={image.url} alt={image.name} />
                    <button 
                        className="delete-button"
                        onClick={() => onDeleteImage(image.id)}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    </div>
);
// Main App Component
window.App = function App() {
    // State Management
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [model, setModel] = useState(OPENAI_MODELS[0]);
    const [sourceContent, setSourceContent] = useState('');
    const [uploadedImages, setUploadedImages] = useState([]);
    const [agencyName, setAgencyName] = useState('');
    const [agencyDescription, setAgencyDescription] = useState('');
    const [personaCards, setPersonaCards] = useState([]);
    const [prompts, setPrompts] = useState([{ 
        id: 1, 
        text: '', 
        result: '',
        source: 'SOURCE',
        sourceType: 'text',
        selectedImage: null
    }]);
    const [loading, setLoading] = useState({});
    const [error, setError] = useState('');
    const [isProcessingFile, setIsProcessingFile] = useState(false);

    // Handle file upload
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsProcessingFile(true);
        setError('');

        try {
            const content = await FileProcessor.processFile(file);
            
            if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
                const imageId = Date.now();
                setUploadedImages(current => [...current, {
                    id: imageId,
                    url: content,
                    name: file.name
                }]);
            } else {
                setSourceContent(content);
            }
        } catch (error) {
            setError('Error processing file: ' + error.message);
        } finally {
            setIsProcessingFile(false);
        }
    };

    // Image management
    const deleteImage = (imageId) => {
        setUploadedImages(current => current.filter(img => img.id !== imageId));
        setPrompts(current => current.map(prompt => 
            prompt.selectedImage === imageId 
                ? {...prompt, selectedImage: null}
                : prompt
        ));
    };

    // Persona management
    const addPersonaCard = (persona) => {
        setPersonaCards(current => [...current, persona]);
    };

    const updatePersonaCard = (id, changes) => {
        setPersonaCards(current => current.map(p => 
            p.cardId === id ? {...p, ...changes} : p
        ));
    };

    const deletePersonaCard = (id) => {
        setPersonaCards(current => current.filter(p => p.cardId !== id));
    };

    // Prompt management
    const addPrompt = () => {
        const newPrompt = {
            id: Date.now(),
            text: '',
            result: '',
            source: 'SOURCE',
            sourceType: 'text',
            selectedImage: null
        };
        setPrompts(current => [...current, newPrompt]);
    };

    const deletePrompt = (id) => {
        setPrompts(current => current.filter(p => p.id !== id));
    };

    const updatePrompt = (id, changes) => {
        setPrompts(current => current.map(p => 
            p.id === id ? {...p, ...changes} : p
        ));
    };

    // Prompt source handling
    const getPromptSource = (promptId) => {
        const prompt = prompts.find(p => p.id === promptId);
        if (!prompt || prompt.source === 'SOURCE') return sourceContent;
        
        const sourcePromptId = parseInt(prompt.source.replace('RESULT', ''));
        const sourcePrompt = prompts.find(p => p.id === sourcePromptId);
        return sourcePrompt ? sourcePrompt.result : '';
    };

    // Persona context generation
    const getPersonaContext = () => {
        const fromPersonas = personaCards.filter(p => p.direction === 'from');
        const toPersonas = personaCards.filter(p => p.direction === 'to');
        
        let context = '';
        
        if (fromPersonas.length > 0) {
            context += `\nRespond FROM the perspective of: ${fromPersonas.map(p => 
                `${p.name} (${p.description})`).join(', ')}`;
        }
        
        if (toPersonas.length > 0) {
            context += `\nTarget your response TO: ${toPersonas.map(p => 
                `${p.name} (${p.description})`).join(', ')}`;
        }
        
        return context;
    };

    // OpenAI API interaction
    const runPrompt = async (id) => {
        setLoading(prev => ({ ...prev, [id]: true }));
        setError('');

        try {
            const prompt = prompts.find(p => p.id === id);
            let requestBody;

            if (prompt.sourceType === 'image') {
                const selectedImage = uploadedImages.find(img => img.id === prompt.selectedImage);
                if (!selectedImage) throw new Error('No image selected');

                requestBody = {
                    model: model,
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: `${getPersonaContext()}\n${prompt.text}`
                                },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: selectedImage.url
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens: 500
                };
            } else {
                const sourceText = getPromptSource(id);
                const personaContext = getPersonaContext();
                requestBody = {
                    model: model,
                    messages: [
                        { 
                            role: "system", 
                            content: `Context:\n${sourceText}${personaContext}`
                        },
                        { 
                            role: "user", 
                            content: prompt.text 
                        }
                    ]
                };
            }

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();
            
            if (data.error) {
                if (data.error.code === 'model_not_found' || data.error.message.includes('deprecated')) {
                    throw new Error('This model has been deprecated. Please select a different model from the dropdown.');
                }
                throw new Error(data.error.message);
            }

            const result = data.choices[0].message.content;
            updatePrompt(id, { result });

        } catch (err) {
            setError(err.message || 'Error running prompt');
        } finally {
            setLoading(prev => ({ ...prev, [id]: false }));
        }
    };

    const runAllPrompts = async () => {
        for (const prompt of prompts) {
            await runPrompt(prompt.id);
        }
    };

    // Export functionality
    const exportAgency = async () => {
        try {
            const exportData = {
                agencyName,
                agencyDescription,
                sourceContent,
                uploadedImages,
                personaCards,
                prompts: prompts.map(({ id, text, result, source, sourceType, selectedImage }) => ({
                    id,
                    text,
                    result,
                    source,
                    sourceType,
                    selectedImage
                })),
                settings: { model }
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `agency-export-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            setError('Error exporting agency: ' + error.message);
        }
    };

    const exportContent = () => {
        try {
            const content = prompts.map(prompt => {
                let promptContent = `PROMPT ${prompt.id}:\n${prompt.text}\n\n`;
                if (prompt.sourceType === 'image') {
                    promptContent += `[Image Analysis]\n`;
                }
                promptContent += `RESULT ${prompt.id}:\n${prompt.result}\n\n---\n\n`;
                return promptContent;
            }).join('');
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `agency-content-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            setError('Error exporting content: ' + error.message);
        }
    };

    // Import functionality
    const loadAgency = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.prompts || !data.settings) {
                    throw new Error('Invalid agency file structure');
                }

                setSourceContent(data.sourceContent || '');
                setPrompts(data.prompts);
                setModel(data.settings.model || OPENAI_MODELS[0]);
                setAgencyName(data.agencyName || '');
                setAgencyDescription(data.agencyDescription || '');
                setUploadedImages(data.uploadedImages || []);
                setPersonaCards(data.personaCards || []);
            } catch (error) {
                setError('Error loading agency: ' + error.message);
            }
        };
        reader.readAsText(file);
    };

    // Check if user is logged in
    if (!isLoggedIn) {
        return (
            <>
                <VoronoiBackground />
                <LoginScreen onLogin={(key) => { setApiKey(key); setIsLoggedIn(true); }} />
            </>
        );
    }

    // Main render
    return (
        <>
            <VoronoiBackground />
            <div className="container">
                <ProcessingIndicator isVisible={isProcessingFile} />
                
                <div className="fixed-section">
                    <input
                        type="file"
                        id="fileInput"
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.md,image/*"
                        onChange={handleFileUpload}
                    />
                    <button 
                        onClick={() => document.getElementById('fileInput').click()}
                        className="btn btn-primary"
                        style={{ marginBottom: '1rem' }}
                    >
                        Upload File or Image
                    </button>

                    <textarea
                        value={sourceContent}
                        onChange={(e) => setSourceContent(e.target.value)}
                        placeholder="Enter or upload source content..."
                        style={{ 
                            display: 'block',
                            width: '80%',
                            minHeight: '200px',
                            margin: '1rem auto',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            border: '1px solid var(--deep-blue)',
                            resize: 'vertical'
                        }}
                    />

                    <ImageTray 
                        images={uploadedImages}
                        onDeleteImage={deleteImage}
                    />
                    <PersonaTray onAddPersona={addPersonaCard} />

                    <div className="model-selector-wrapper">
                        <select 
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            className="model-selector"
                        >
                            {OPENAI_MODELS.map(model => (
                                <option key={model} value={model}>{model}</option>
                            ))}
                        </select>
                    </div>

                    {error && <div className="error">{error}</div>}
                </div>

                <div className="content-area">
                    <div className="agency-details">
                        <textarea
                            value={agencyName}
                            onChange={(e) => setAgencyName(e.target.value)}
                            placeholder="Enter Agency Name..."
                            className="agency-name-textarea"
                            style={{ paddingRight: '1rem' }}
                        />
                        <textarea
                            value={agencyDescription}
                            onChange={(e) => setAgencyDescription(e.target.value)}
                            placeholder="Enter Agency Description..."
                            className="agency-description-textarea"
                            style={{ paddingRight: '1rem' }}
                        />
                    </div>
                    
                    <div className="horizontal-scroll">
                        {personaCards.map(persona => (
                            <PersonaCard
                                key={persona.cardId}
                                persona={persona}
                                onUpdate={updatePersonaCard}
                                onDelete={deletePersonaCard}
                            />
                        ))}
                        {prompts.map(prompt => (
                            <PromptCard
                                key={prompt.id}
                                prompt={prompt}
                                sourceOptions={prompts.filter(p => p.id < prompt.id)}
                                loading={loading[prompt.id]}
                                onUpdate={updatePrompt}
                                onDelete={deletePrompt}
                                onRun={runPrompt}
                                uploadedImages={uploadedImages}
                            />
                        ))}
                    </div>
                </div>

                <div className="footer">
                    <button onClick={addPrompt} className="btn btn-agency">
                        Add Prompt
                    </button>
                    <button onClick={runAllPrompts} className="btn btn-agency">
                        Run All
                    </button>
                    <input
                        type="file"
                        id="loadAgencyInput"
                        className="hidden"
                        accept=".json"
                        onChange={loadAgency}
                    />
                    <button 
                        onClick={() => document.getElementById('loadAgencyInput').click()} 
                        className="btn btn-agency"
                    >
                        Load Agency
                    </button>
                    <button onClick={exportAgency} className="btn btn-agency">
                        Export Agency
                    </button>
                    <button onClick={exportContent} className="btn btn-agency">
                        Export Content
                    </button>
                </div>
            </div>
        </>
    );
};

// Initialize React App
window.addEventListener('load', function() {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(React.createElement(window.App));
});