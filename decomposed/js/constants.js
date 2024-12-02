// Make constants available globally
window.APP_CONSTANTS = {
    OPENAI_MODELS: [
        "gpt-4-vision-preview",  // Added vision model for image analysis
        "gpt-4",
        "gpt-3.5-turbo-1106",
        "gpt-3.5-turbo",
    ],
    SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
    MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
};

// Constants
const OPENAI_MODELS = [
    "gpt-4o",
    "gpt-3.5-turbo-1106",
    "gpt-3.5-turbo",
];

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Persona Constants
const PERSONAS = [
    {
        id: 'engineer',
        name: 'Software Engineer',
        emoji: '👨‍💻',
        description: 'Expert in software development, architecture, and best practices'
    },
    {
        id: 'designer',
        name: 'UX Designer',
        emoji: '🎨',
        description: 'Focused on user experience, interface design, and accessibility'
    },
    {
        id: 'pm',
        name: 'Product Manager',
        emoji: '📊',
        description: 'Drives product strategy, roadmap, and feature prioritization'
    },
    {
        id: 'writer',
        name: 'Technical Writer',
        emoji: '📝',
        description: 'Specializes in documentation, guides, and technical communication'
    }
];

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
            // For HTML files, use DOMParser to extract text content
            if (file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm')) {
                try {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(text, 'text/html');
                    // Remove script and style elements
                    const scripts = doc.getElementsByTagName('script');
                    const styles = doc.getElementsByTagName('style');
                    for (let i = scripts.length - 1; i >= 0; i--) {
                        scripts[i].remove();
                    }
                    for (let i = styles.length - 1; i >= 0; i--) {
                        styles[i].remove();
                    }
                    // Get text content and clean up whitespace
                    return doc.body.textContent.replace(/\s+/g, ' ').trim();
                } catch (parseError) {
                    console.warn('HTML parsing failed, using raw text:', parseError);
                }
            }
            // For non-HTML text files or if HTML parsing fails, return raw text
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
            reader.onload = (e) => {
                // Create an image element to verify the image loads correctly
                const img = new Image();
                img.onload = () => resolve(reader.result);
                img.onerror = () => reject(new Error('Invalid image file'));
                img.src = reader.result;
            };
            reader.onerror = () => reject(new Error('Error reading image'));
            reader.readAsDataURL(file);
        });
    },

    async processFile(file) {
        if (!file) throw new Error('No file provided');

        console.log('Processing file:', file.name, 'Type:', file.type);

        const fileType = file.type;
        if (SUPPORTED_IMAGE_TYPES.includes(fileType)) {
            console.log('Processing as image');
            return await this.processImage(file);
        }

        const extension = file.name.toLowerCase().split('.').pop();
        console.log('File extension:', extension);

        try {
            switch (extension) {
                case 'pdf':
                    console.log('Processing as PDF');
                    return await this.readPDFFile(file);
                case 'doc':
                case 'docx':
                    console.log('Processing as DOC/DOCX');
                    return await this.readDocFile(file);
                case 'txt':
                case 'md':
                case 'html':
                case 'htm':
                    console.log('Processing as text file');
                    return await this.readTextFile(file);
                default:
                    throw new Error(`Unsupported file type: ${extension}`);
            }
        } catch (error) {
            console.error('File processing error:', error);
            throw error;
        }
    }
};

// Utility Functions
const sanitizeFileName = (name) => {
    return name.toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};

const isValidApiKey = (key) => {
    return key && key.startsWith('sk-') && key.length > 20;
};

const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};

// API Handlers
const callOpenAI = async (apiKey, prompt, model, sourceContent = '', imageUrl = null) => {
    const messages = [];
    
    if (sourceContent) {
        messages.push({
            role: "system",
            content: sourceContent
        });
    }
    
    if (imageUrl) {
        // Use GPT-4 Vision model for image analysis
        model = "gpt-4-vision-preview";
        messages.push({
            role: "user",
            content: [
                {
                    type: "text",
                    text: prompt
                },
                {
                    type: "image_url",
                    image_url: imageUrl  // Pass the base64 URL directly
                }
            ]
        });
    } else {
        messages.push({
            role: "user",
            content: prompt
        });
    }

    console.log('Calling OpenAI with model:', model);
    console.log('Messages:', messages);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            max_tokens: imageUrl ? 500 : undefined
        })
    });

    const data = await response.json();
    
    if (data.error) {
        console.error('OpenAI API Error:', data.error);
        if (data.error.code === 'model_not_found' || data.error.message.includes('deprecated')) {
            throw new Error('This model has been deprecated. Please select a different model.');
        }
        throw new Error(data.error.message);
    }

    return data.choices[0].message.content;
};
