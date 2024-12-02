// Main App Component
const App = () => {  // Changed to arrow function for consistency
    // State Management
    const [apiKey, setApiKey] = React.useState('');
    const [model, setModel] = React.useState(OPENAI_MODELS[0]);
    const [sourceContent, setSourceContent] = React.useState('');
    const [uploadedImages, setUploadedImages] = React.useState([]);
    const [agencyName, setAgencyName] = React.useState('');
    const [agencyDescription, setAgencyDescription] = React.useState('');
    const [personaCards, setPersonaCards] = React.useState([]);
    const [prompts, setPrompts] = React.useState([{ 
        id: 1, 
        text: '', 
        result: '',
        sources: ['SOURCE'],
        sourceType: 'text',
        selectedImage: null
    }]);
    const [loading, setLoading] = React.useState({});
    const [error, setError] = React.useState('');
    const [isProcessingFile, setIsProcessingFile] = React.useState(false);

    // File Handling Functions
    const handleFileUpload = async (file) => {
        if (!file) return;

        setIsProcessingFile(true);
        setError('');

        try {
            if (SUPPORTED_IMAGE_TYPES.includes(file.type)) {
                // Handle image upload
                const imageUrl = await FileProcessor.processImage(file);
                const imageId = Date.now();
                setUploadedImages(current => [...current, {
                    id: imageId,
                    url: imageUrl,
                    name: file.name
                }]);
            } else {
                // Handle text document upload
                const content = await FileProcessor.processFile(file);
                if (content) {
                    setSourceContent(content);
                }
            }
        } catch (error) {
            console.error('File Processing Error:', error);
            setError('Error processing file: ' + error.message);
        } finally {
            setIsProcessingFile(false);
        }
    };

    const deleteImage = (imageId) => {
        setUploadedImages(current => current.filter(img => img.id !== imageId));
        // Also update any prompts that were using this image
        setPrompts(current => current.map(prompt => 
            prompt.selectedImage === imageId 
                ? {...prompt, selectedImage: null}
                : prompt
        ));
    };

    // Persona Management Functions
    const addPersonaCard = (persona) => {
        setPersonaCards([...personaCards, persona]);
    };

    const updatePersonaCard = (id, changes) => {
        setPersonaCards(personaCards.map(p => 
            p.cardId === id ? {...p, ...changes} : p
        ));
    };

    const deletePersonaCard = (id) => {
        setPersonaCards(personaCards.filter(p => p.cardId !== id));
    };

    // Prompt Management Functions
    const addPrompt = () => {
        const newPrompt = {
            id: Date.now(),
            text: '',
            result: '',
            sources: ['SOURCE'],
            sourceType: 'text',
            selectedImage: null
        };
        setPrompts([...prompts, newPrompt]);
    };

    const deletePrompt = (id) => {
        setPrompts(prompts.filter(p => p.id !== id));
    };

    const updatePrompt = (id, changes) => {
        setPrompts(prompts.map(p => 
            p.id === id ? {...p, ...changes} : p
        ));
    };

    // Source Content Management
    const getPromptSources = (promptId) => {
        const prompt = prompts.find(p => p.id === promptId);
        if (!prompt) return [];
        
        return prompt.sources.map(source => {
            if (source === 'SOURCE') return sourceContent;
            const sourcePromptId = parseInt(source.replace('RESULT', ''));
            const sourcePrompt = prompts.find(p => p.id === sourcePromptId);
            return sourcePrompt ? sourcePrompt.result : '';
        }).filter(Boolean);
    };

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

    // OpenAI API Interaction
    const runPrompt = async (id) => {
        if (!isValidApiKey(apiKey)) {
            setError('Please enter a valid OpenAI API key');
            return;
        }

        setLoading(prev => ({ ...prev, [id]: true }));
        setError('');

        try {
            const prompt = prompts.find(p => p.id === id);
            let result;

            if (prompt.sourceType === 'image') {
                const selectedImage = uploadedImages.find(img => img.id === prompt.selectedImage);
                if (!selectedImage) throw new Error('No image selected');

                // For image analysis, always use GPT-4 Vision model
                result = await callOpenAI(
                    apiKey,
                    prompt.text || 'Analyze this image and describe what you see.',
                    'gpt-4-vision-preview',
                    '',
                    selectedImage.url
                );
            } else {
                const sources = getPromptSources(id);
                const combinedSource = sources.join('\n\n');
                result = await callOpenAI(
                    apiKey,
                    prompt.text,
                    model,
                    `${combinedSource}${getPersonaContext()}`
                );
            }

            updatePrompt(id, { result });
        } catch (err) {
            console.error('Error running prompt:', err);
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

    // Export Functions
    const exportAgency = async () => {
        try {
            const exportData = {
                agencyName,
                agencyDescription,
                sourceContent,
                uploadedImages,
                personaCards,
                prompts: prompts.map(({ id, text, result, sources, sourceType, selectedImage }) => ({
                    id,
                    text,
                    result,
                    sources,
                    sourceType,
                    selectedImage
                })),
                settings: { model }
            };
            
            const filename = agencyName 
                ? `${sanitizeFileName(agencyName)}.json`
                : `agency-export-${formatDate(new Date())}.json`;
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            setError('Error exporting agency: ' + error.message);
        }
    };

    const exportContent = async () => {
        try {
            const contentData = {
                sourceContent,
                promptResults: prompts.map(prompt => ({
                    promptText: prompt.text,
                    result: prompt.result
                }))
            };
            
            const filename = `content-export-${formatDate(new Date())}.json`;
            
            const blob = new Blob([JSON.stringify(contentData, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            setError('Error exporting content: ' + error.message);
        }
    };

    // Import Functions
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

    // Render Function
    return (
        <>
            <VoronoiBackground />
            <div className="container">
                <ProcessingIndicator isVisible={isProcessingFile} />
                
                {/* Left Fixed Section */}
                <div className="fixed-section">
                    <input
                        type="text"
                        placeholder="Enter OpenAI API Key"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="api-key-input"
                    />
                    
                    <select 
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="model-selector"
                    >
                        {OPENAI_MODELS.map(model => (
                            <option key={model} value={model}>{model}</option>
                        ))}
                    </select>

                    <FileUploadZone 
                        onFileSelect={handleFileUpload}
                        accept=".pdf,.doc,.docx,.txt,.md,.html,.htm,image/*"
                    />

                    <textarea
                        value={sourceContent}
                        onChange={(e) => setSourceContent(e.target.value)}
                        placeholder="Enter or upload source content..."
                        className="source-content"
                    />

                    <ImageTray 
                        images={uploadedImages}
                        onDeleteImage={deleteImage}
                    />

                    <PersonaTray onAddPersona={addPersonaCard} />
                    
                    {error && <div className="error">{error}</div>}
                </div>

                {/* Main Content Area */}
                <div className="content-area">
                    {/* Agency Details */}
                    <div className="agency-details">
                        <textarea
                            value={agencyName}
                            onChange={(e) => setAgencyName(e.target.value)}
                            placeholder="Enter Agency Name..."
                            className="agency-name-textarea"
                        />
                        <textarea
                            value={agencyDescription}
                            onChange={(e) => setAgencyDescription(e.target.value)}
                            placeholder="Enter Agency Description..."
                            className="agency-description-textarea"
                        />
                    </div>
                    
                    {/* Personas and Prompts */}
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

                {/* Footer */}
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
