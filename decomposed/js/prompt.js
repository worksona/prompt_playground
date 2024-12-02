// Prompt Card Component
const PromptCard = ({ prompt, sourceOptions, loading, onUpdate, onDelete, onRun, uploadedImages }) => {
    const isImageMode = prompt.sourceType === 'image';

    const handleSourceChange = (e) => {
        // Handle multiple selection
        const options = Array.from(e.target.selectedOptions).map(option => option.value);
        onUpdate(prompt.id, { sources: options });
    };

    return (
        <div className={`prompt-card ${isImageMode ? 'image-mode' : ''}`}>
            <div className="source-type-selector">
                <button 
                    className={`source-type-button ${!isImageMode ? 'active' : ''}`}
                    onClick={() => onUpdate(prompt.id, { sourceType: 'text', selectedImage: null })}
                >
                    Text
                </button>
                <button 
                    className={`source-type-button ${isImageMode ? 'active' : ''}`}
                    onClick={() => onUpdate(prompt.id, { sourceType: 'image' })}
                >
                    Image
                </button>
            </div>

            {isImageMode ? (
                <select
                    value={prompt.selectedImage || ''}
                    onChange={(e) => onUpdate(prompt.id, { selectedImage: parseInt(e.target.value) })}
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
                    multiple
                    value={prompt.sources}
                    onChange={handleSourceChange}
                    className="source-selector"
                    style={{ height: 'auto', minHeight: '60px' }}
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
                onChange={(e) => onUpdate(prompt.id, { text: e.target.value })}
                placeholder={isImageMode ? "Enter your image analysis prompt..." : "Enter your prompt..."}
                className="prompt-textarea"
                spellCheck="true"
                autoComplete="off"
                rows="6"
            />
            
            <div className="result-label">RESULT{prompt.id}</div>
            
            <div className="result-container">
                <textarea
                    value={prompt.result}
                    onChange={(e) => onUpdate(prompt.id, { result: e.target.value })}
                    placeholder="Results will appear here..."
                    className="result-textarea"
                    readOnly
                    rows="8"
                />
                <CopyButton text={prompt.result} />
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

// Image Components
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

const FileUploadZone = ({ onFileSelect, accept }) => {
    const inputRef = React.useRef(null);
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    const handleFileChange = (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            onFileSelect(files[0]);
        }
    };

    return (
        <div
            className={`file-upload-zone ${isDragging ? 'dragging' : ''}`}
            onClick={() => inputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={accept}
                onChange={handleFileChange}
            />
            <div>Drag & drop or click to upload</div>
        </div>
    );
};
