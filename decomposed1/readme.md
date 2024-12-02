# Worksona Playground

## Overview
Worksona Playground is a web application designed to help users create and manage AI-powered content generation workflows through persona-based interactions. The application allows users to define agency profiles, create multiple personas, and generate content using OpenAI's GPT models while maintaining context and personality consistency.

## Features
- Dynamic persona management with customizable roles and descriptions
- File upload support for multiple formats (PDF, DOC, DOCX, TXT, MD, and images)
- Interactive content generation with OpenAI integration
- Visual Voronoi diagram background animation
- Exportable workspaces and generated content
- Support for both text and image-based prompts
- Real-time content preview and editing
- Copy-to-clipboard functionality

## Technology Stack
- **Frontend Framework**: React 18.2.0
- **Visualization**: D3.js 7.8.5
- **Document Processing**:
  - PDF.js 3.11.174 for PDF processing
  - Mammoth 1.6.0 for DOC/DOCX processing
- **Development Tools**: Babel for JSX transformation

## Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "d3": "^7.8.5",
    "pdfjs-dist": "^3.11.174",
    "mammoth": "^1.6.0"
  }
}
```

## Project Structure
```
worksona-playground/
├── index.html        # Main HTML file
├── styles.css        # Stylesheet
├── app.js           # React application code
├── personas.json    # Persona and configuration data
└── README.md        # Documentation
```

## Setup and Installation
1. Clone the repository
2. Open index.html in a modern web browser
3. Enter the required credentials (password and OpenAI API key)

## Development Guide

### Adding New Personas
To add new personas, modify the `personas.json` file following the existing structure:
```json
{
  "id": "unique_identifier",
  "name": "Persona Name",
  "emoji": "🔵",
  "description": "Detailed description..."
}
```

### Extending Functionality
1. **Adding New File Types**:
   - Extend the FileProcessor class in app.js
   - Add new mime types to SUPPORTED_IMAGE_TYPES in personas.json

2. **Custom Visualization**:
   - Modify the VoronoiBackground component in app.js
   - Adjust D3.js parameters for different visual effects

3. **New Features**:
   - Add new components to the React component tree
   - Update the state management in the App component
   - Add corresponding styles in styles.css

## API Integration
The application uses the OpenAI Chat Completions API. To integrate with other APIs:
1. Modify the runPrompt function in App component
2. Update the model selection options
3. Adjust the API request format as needed

## Security Considerations
- API keys are stored in memory only
- No server-side storage of credentials
- Client-side file processing for privacy

## Build and Deployment
The application is designed to run directly in the browser without a build step. For production:
1. Minify the JavaScript and CSS files
2. Use production versions of React
3. Configure proper CORS headers if deploying to a custom domain

## Contributing
1. Fork the repository
2. Create a feature branch
3. Submit a pull request with detailed description

## License
MIT License - See LICENSE file for details

## Created By
This project was developed as a tool for streamlining AI-powered content generation workflows while maintaining consistent persona-based interactions.
