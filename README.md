# Worksona Prompt Playground #1

## Introduction

The Worksona Prompt Playground is a web application designed to facilitate interactive prompt creation and testing using OpenAI's language models. It provides a user-friendly interface for managing prompts, running them against selected models, and viewing the results in real-time.

## Instructions

1. **Login**: 
   - Upon opening the app, you will be prompted to enter a password. Use the password `wowsona` to gain access.

2. **Select Model**:
   - Choose an OpenAI model from the dropdown menu in the fixed left section.

3. **Upload Source Content**:
   - You can upload a text, PDF, or DOCX file to use as source content for your prompts. Alternatively, you can manually enter or paste content into the provided textarea.

4. **Create and Manage Prompts**:
   - Add new prompts by clicking the "Add Prompt" button.
   - Enter your prompt text in the provided textarea.
   - Run individual prompts by clicking the "Run" button next to each prompt.
   - Delete prompts using the "Delete" button.

5. **Run All Prompts**:
   - Use the "Run All Prompts" button in the footer to execute all prompts simultaneously.

6. **Export Data**:
   - Export your source content and prompt results as a JSON file by clicking the "Export" button.

## Summary of Use and Value

The Worksona Prompt Playground is valuable for developers and researchers working with OpenAI's language models. It allows for efficient testing and iteration of prompts, making it easier to refine and optimize them for specific use cases. The app's ability to handle multiple prompts and export results enhances productivity and collaboration.

## Technical Breakdown

- **Frontend**: 
  - Built with React for a dynamic and responsive user interface.
  - Utilizes D3.js for the Voronoi background animation.

- **Styling**:
  - CSS is used for styling components, with a focus on a clean and modern design.

- **Functionality**:
  - Implements a login screen for access control.
  - Supports file uploads and text input for source content.
  - Provides a horizontal scrollable area for managing multiple prompts.
  - Integrates with OpenAI's API to run prompts and fetch results.

- **Background Animation**:
  - A Voronoi diagram animation is rendered on a canvas element, providing a visually appealing background.

- **Interactivity**:
  - Smooth scrolling and responsive design ensure a seamless user experience.
