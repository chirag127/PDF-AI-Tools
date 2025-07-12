
# Masterplan for PDF AI Tools

**Document Version:** 1.0
**Owner:** Chirag Singhal
**Status:** Final
**Prepared for:** augment code assistant
**Prepared by:** Friendly CTO

---

## Project Overview
This document outlines the plan for creating "PDF AI Tools," a web-based suite of utilities designed to help users interact with their PDF documents in intelligent ways. The application will be a single-page application built with Next.js, allowing users to upload a PDF and perform various AI-powered actions on it, such as interactive chat, summarization, translation, and question generation. All AI functionality will be powered by Google's Gemini API, utilizing an API key provided by the user, ensuring user data privacy and control. The application will be stateless, meaning it will not store user files or history, offering a secure and straightforward experience.

## Project Goals
- To develop a user-friendly, high-performance web application for AI-powered PDF analysis.
- To implement four core features: Chat with PDF (using RAG), AI PDF Summarizer, Translate PDF, and AI Question Generator.
- To empower users to leverage the Gemini API by using their own API keys, which are stored securely on the client-side.
- To create a seamless user experience with a unified interface for all tools and a split-screen view for the chat functionality.
- To build a maintainable and scalable codebase using a modern tech stack (Next.js, TypeScript, Tailwind CSS).

## Technical Stack
- **Frontend**: Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Node.js (via Next.js API Routes)
- **PDF Processing**: `pdf-parse` library for text extraction.
- **AI Integration**: Google Generative AI SDK for JavaScript (`@google/generative-ai`).
- **Database**: None (The application is stateless).
- **Deployment**: Vercel

## Project Scope
### In Scope
- A settings page for users to enter and save their Gemini API key to their browser's local storage.
- A user interface for selecting the desired Gemini model for AI operations.
- PDF file upload functionality.
- A unified interface to access all AI tools after a PDF is uploaded.
- **Feature: Chat with PDF**: An interactive, split-screen chat interface using Retrieval Augmented Generation (RAG).
- **Feature: AI PDF Summarizer**: A tool to generate concise summaries of the PDF content.
- **Feature: Translate PDF**: A tool to translate the PDF's text content, supporting all languages available through the Gemini API.
- **Feature: AI Question Generator**: A tool to create questions based on the PDF content.
- Graceful handling of API errors, rate limiting, and token limitations.
- The UI will be in English only, but the codebase will be structured for future internationalization.

### Out of Scope
- User authentication and user accounts.
- Persistent storage of user-uploaded PDFs or chat history on the server.
- Real-time collaboration features.
- Support for password-protected or encrypted PDFs in the initial version.
- Any AI features beyond the four specified (Chat, Summarize, Translate, Question Generation).

## Functional Requirements

### Feature Area 1: PDF Management & Viewing
- **FR1.1:** The user shall be able to upload a PDF file through a drag-and-drop interface or a file picker.
- **FR1.2:** Upon upload, the application shall send the PDF to the backend for processing.
- **FR1.3:** The backend shall extract all text content from the PDF.
- **FR1.4:** The user shall see a view of their PDF document within the application interface.

### Feature Area 2: AI Feature Interaction
- **FR2.1:** After a PDF is processed, the user shall be able to select from a list of available AI tools (Chat, Summarize, etc.).
- **FR2.2:** The application must validate that a Gemini API key is present before attempting to use any AI feature.
- **FR2.3:** The application will display clear loading states while AI operations are in progress and handle potential errors from the Gemini API gracefully.

### Feature Area 3: Chat with PDF
- **FR3.1:** The UI shall feature a split-screen layout, with the PDF viewer on one side and the chat interface on the other.
- **FR3.2:** The backend shall use a Recursive Character Text Splitting strategy to chunk the document text for the RAG process.
- **FR3.3:** User queries shall be combined with relevant text chunks from the PDF to form a prompt for the Gemini API.
- **FR3.4:** The chat response from the AI should be streamed to the UI to improve perceived performance.

### Feature Area 4: Settings & Configuration
- **FR4.1:** A dedicated "Settings" page shall be available.
- **FR4.2:** The user shall be able to input their Gemini API key into a text field on the Settings page.
- **FR4.3:** The API key shall be saved to the browser's `localStorage` for persistence across sessions.
- **FR4.4:** The user shall be able to select their preferred Gemini model from a dropdown list populated with available models.

## Non-Functional Requirements (NFR)
- **Performance:** The application should process and extract text from a 10MB PDF in under 10 seconds. AI interactions should provide feedback (e.g., streaming response) within 3 seconds.
- **Scalability:** The application must handle at least 100 concurrent users without significant performance degradation. The backend processing must be stateless to allow for horizontal scaling.
- **Usability:** The interface must be modern, clean, and intuitive, adhering to WCAG 2.1 AA accessibility standards.
- **Security:** The user's Gemini API key must not be transmitted to or stored on our servers. It will be held exclusively in the client's browser and sent directly to the Gemini API or passed with each request to our backend for a server-side API call.

## Implementation Plan

This section outlines the implementation plan, including phases and tasks. It is designed to be comprehensive enough for an AI code assistant to execute.

### Phase 1: Project Setup & Foundation (1-2 days)
- **Task 1:** Initialize a new Next.js project with TypeScript and Tailwind CSS.
- **Task 2:** Set up the project structure with `app/`, `components/`, `lib/`, and `styles/` directories.
- **Task 3:** Create the main application layout (`app/layout.tsx`) with a header and a main content area.
- **Task 4:** Design and implement the static UI for the main PDF interaction page and the Settings page. Create placeholder components for the PDF viewer, chat window, and tool selection panel.

### Phase 2: Core PDF Handling & Processing (2-3 days)
- **Task 1:** Implement the file upload component with drag-and-drop and file selection capabilities.
- **Task 2:** Create a Next.js API route (`/api/process-pdf`) that accepts a `multipart/form-data` request.
- **Task 3:** Integrate the `pdf-parse` library into the API route to extract text from the uploaded PDF file.
- **Task 4:** Implement the text chunking logic using a Recursive Character Text Splitting strategy. The API should return the extracted text (or chunked text) as JSON.
- **Task 5:** Implement state management on the frontend (e.g., using React Context or Zustand) to hold the processed PDF text.
- **Task 6:** Integrate a basic PDF viewing library (e.g., `react-pdf`) to display the uploaded document.

### Phase 3: Gemini Integration & Settings (2-3 days)
- **Task 1:** Build the Settings page UI with an input for the API key and a dropdown for model selection.
- **Task 2:** Implement the logic to save the API key to `localStorage` and retrieve it.
- **Task 3:** Create a backend service/helper in `/lib` to configure and use the `@google/generative-ai` SDK. This service will be initialized with the user's key, passed from the frontend with each request.
- **Task 4:** Implement an API route (`/api/gemini/list-models`) that can be called to populate the model selection dropdown on the frontend. *Note: Since the JS SDK may not support listing models directly, this might involve calling a helper script or hardcoding a list of compatible models initially.*

### Phase 4: AI Feature Implementation (4-6 days)
- **Task 1: Chat with PDF:**
    - Create the API route `/api/gemini/chat`.
    - This endpoint accepts a user query and the chunked text context.
    - It will find the most relevant chunks (e.g., using basic keyword matching or embeddings in a future version) to include in the prompt.
    - It will call the Gemini API with the composed RAG prompt and stream the response back to the client.
    - Implement the split-screen chat UI on the frontend to send requests and render the streamed response.
- **Task 2: AI PDF Summarizer:**
    - Create the API route `/api/gemini/summarize`.
    - This endpoint accepts the full text of the PDF.
    - It calls the Gemini API with a prompt asking for a concise summary.
    - Implement the UI to trigger this feature and display the resulting summary.
- **Task 3: Translate PDF:**
    - Create the API route `/api/gemini/translate`.
    - It accepts the PDF text and a target language.
    - It calls the Gemini API with a prompt to translate the text.
    - Implement the UI with a language selector and a display for the translated text.
- **Task 4: AI Question Generator:**
    - Create the API route `/api/gemini/generate-questions`.
    - It accepts the PDF text.
    - It calls the Gemini API with a prompt to generate relevant questions about the content.
    - Implement the UI to display the generated questions.

### Phase 5: Testing, Refinement & Deployment (2-3 days)
- **Task 1:** Implement comprehensive error handling for API routes, frontend components, and API interactions.
- **Task 2:** Conduct end-to-end testing of all user flows.
- **Task 3:** Refine UI/UX based on testing feedback. Ensure all states (loading, error, success) are handled gracefully.
- **Task 4:** Create the `README.md` and `CHANGELOG.md` files.
- **Task 5:** Deploy the application to Vercel and configure environment variables.

## API Endpoints (if applicable)
- `POST /api/process-pdf`
  - **Description**: Uploads a PDF file, extracts its text, chunks it, and returns the text.
  - **Request**: `multipart/form-data` with a `file` field.
  - **Response**: `{ "text": "..." }`
- `POST /api/gemini/chat`
  - **Description**: Sends a user query and context to the Gemini API for a chat response.
  - **Request**: `{ "query": "...", "context": "...", "apiKey": "...", "model": "..." }`
  - **Response**: Streamed text response.
- `POST /api/gemini/summarize`
  - **Description**: Generates a summary of the provided text.
  - **Request**: `{ "context": "...", "apiKey": "...", "model": "..." }`
  - **Response**: `{ "summary": "..." }`
- `POST /api/gemini/translate`
  - **Description**: Translates the provided text to a target language.
  - **Request**: `{ "context": "...", "targetLanguage": "...", "apiKey": "...", "model": "..." }`
  - **Response**: `{ "translatedText": "..." }`
- `POST /api/gemini/generate-questions`
  - **Description**: Generates questions based on the provided text.
  - **Request**: `{ "context": "...", "apiKey": "...", "model": "..." }`
  - **Response**: `{ "questions": ["...", "..."] }`

## Data Models (if applicable)
This application is stateless and has no database models. API request/response bodies serve as the primary data structures.

## Project Structure
```
project-root/
├── app/
│   ├── (api)/              # API Routes
│   │   ├── gemini/
│   │   │   ├── chat/route.ts
│   │   │   ├── summarize/route.ts
│   │   │   ├── translate/route.ts
│   │   │   └── generate-questions/route.ts
│   │   └── process-pdf/route.ts
│   ├── settings/           # Settings page
│   │   └── page.tsx
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main application page
├── components/
│   ├── ui/                 # Reusable UI elements (e.g., Button, Input)
│   ├── chat-window.tsx
│   ├── pdf-uploader.tsx
│   ├── pdf-viewer.tsx
│   └── settings-form.tsx
├── lib/
│   ├── gemini.ts           # Gemini API client and helpers
│   ├── state.ts            # Frontend state management (Zustand or Context)
│   └── utils.ts            # Utility functions
├── public/
│   └── [static assets]
├── styles/
│   └── globals.css
├── .env.example            # Environment variable template
├── next.config.mjs
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Environment Variables
```
# Required environment variables
# This application does not require server-side environment variables as the
# Gemini API key is provided by the client with each request.

# .env.example - to inform developers of local setup.
# No variables are needed for deployment on Vercel.
```

## Testing Strategy
The testing strategy will be multi-layered:
-   **Unit Testing (Jest/Vitest)**: For backend logic, especially the text chunking algorithm in `/lib` and individual API route handlers.
-   **Component Testing (React Testing Library)**: For individual frontend components like `PdfUploader` and `SettingsForm` to ensure they render and behave correctly.
-   **End-to-End (E2E) Testing (Cypress/Playwright)**: To test critical user flows, such as uploading a PDF, entering an API key, and using the "Chat with PDF" feature from start to finish.

## Deployment Strategy
The application will be deployed on Vercel. The deployment process will be automated via a Git integration. The `main` branch will be connected to the production deployment. Every push to `main` will trigger a new build and deployment.

## Maintenance Plan
- **Monitoring**: Vercel's built-in analytics will be used to monitor application health, performance, and usage.
- **Dependency Updates**: Dependencies will be regularly updated using tools like `npm outdated` to patch security vulnerabilities and get new features.
- **Backups**: Not applicable as the application is stateless.
- **Bug Fixes**: A formal issue tracking system (e.g., GitHub Issues) will be used to report and manage bugs.

## Risks and Mitigations
| Risk | Impact | Likelihood | Mitigation |
| :--- | :--- | :--- | :--- |
| **Gemini API Key Exposure** | High | Low | The key is only stored in the client's `localStorage` and is never logged or stored on the server. The UI will clearly state this. |
| **Large PDF Processing Failure** | Medium | Medium | Implement file size limits on upload (e.g., 25MB). Use efficient streaming and chunking on the backend to handle memory usage. |
| **Gemini API Rate Limiting** | Medium | Medium | Implement clear error messaging to the user when a rate limit is hit. Implement exponential backoff for retries on transient errors. |
| **Poor AI Response Quality** | Low | Medium | Invest time in prompt engineering. Allow users to select different Gemini models to find the one that works best for their documents. |

## Future Enhancements
- **User Accounts**: Allow users to sign up and save their PDFs and chat histories.
- **Vector Database Integration**: For more advanced RAG, implement a vector database (e.g., Pinecone) to store embeddings for faster and more accurate context retrieval.
- **Additional AI Tools**: Add more features like "Tone Adjustment," "Content Redaction," or "Fact-Checking."
- **OCR Support**: Integrate an Optical Character Recognition library to process scanned PDFs.

## Development Guidelines
### Code Quality & Design Principles
-   Follow industry-standard coding best practices (clean code, modularity, error handling, security, scalability).
-   Apply SOLID, DRY (via abstraction), and KISS principles.
-   Design modular, reusable components/functions.
-   Add concise, useful function-level comments.
-   Implement comprehensive error handling (try-catch, custom errors, async handling).

### Frontend Development
-   Provide modern, clean, professional, and intuitive UI designs.
-   Adhere to UI/UX principles (clarity, consistency, simplicity, feedback, accessibility/WCAG).
-   Use Tailwind CSS for styling.

### Data Handling & APIs
-   Accept credentials/config (the Gemini Key) from the client; do not store on the server.
-   Centralize all API endpoint URLs in a single location (e.g., `lib/constants.ts`).

### Documentation Requirements
-   Create a comprehensive `README.md` including project overview, setup instructions, and environment variables.
-   Maintain a `CHANGELOG.md` to document changes using semantic versioning.

### Reference: Listing Available Gemini Models (Python Utility)
The following Python script is not part of the production application but is a useful utility for developers to discover the names of available Gemini models. These names can then be used in the application's model selection UI.

```python
# To run this script:
# 1. pip install google-generativeai
# 2. Get your API key from: https://makersuite.google.com/app/apikey
# 3. Run the script and update the model list in the frontend as needed.

import google.generativeai as genai

# --- CONFIGURATION ---
# Replace with your actual API key
API_KEY = "YOUR_API_KEY_HERE"
# -------------------

def list_gemini_models():
    """
    Lists available Gemini models and their key properties.
    """
    try:
        genai.configure(api_key=API_KEY)
        print("Successfully configured with API Key.")

        print("\nFetching available models...\n")
        models = genai.list_models()

        compatible_models = []
        for model in models:
            # We are interested in models that support 'generateContent'
            if 'generateContent' in model.supported_generation_methods:
                compatible_models.append(model)

        if not compatible_models:
            print("No models compatible with 'generateContent' found.")
            return

        print("--- Compatible Gemini Models ---")
        for model in compatible_models:
            print(f"Model name: {model.name}")
            print(f"  Description: {getattr(model, 'description', 'N/A')}")
            print(f"  Input token limit: {getattr(model, 'input_token_limit', 'N/A')}")
            print(f"  Output token limit: {getattr(model, 'output_token_limit', 'N/A')}")
            print("-" * 40)

    except Exception as e:
        print(f"An error occurred: {e}")
        print("Please ensure your API key is correct and has the necessary permissions.")

if __name__ == "__main__":
    if API_KEY == "YOUR_API_KEY_HERE":
        print("Error: Please replace 'YOUR_API_KEY_HERE' with your actual Gemini API key.")
    else:
        list_gemini_models()
```

## Tool Usage Instructions
### MCP Servers and Tools
-   Use the `context7` MCP server to gather contextual information about the current task.
-   Use the `clear_thought` MCP servers for various problem-solving approaches.
-   Use the date and time MCP server (`getCurrentDateTime_node`) to add "last updated" timestamps to documentation.
-   Use the `websearch` tool to find information on the internet when needed.

### System & Environment Considerations
-   Target system: Windows 11 Home Single Language 23H2.
-   Use semicolon (`;`) as the command separator in PowerShell commands.
-   Use `New-Item -ItemType Directory -Path "path1", "path2", ... -Force` for creating directories in PowerShell.
-   Use Node.js `path` library for robust path manipulation.

### Error Handling & Debugging
-   First attempt to resolve errors autonomously.
-   Perform systematic debugging: consult web resources, modify code, adjust configuration, retry.
-   Report back only if an insurmountable blocker persists after exhausting all self-correction efforts.

## Conclusion
This masterplan provides a comprehensive roadmap for the development of the PDF AI Tools application. By adhering to this plan, we can build a robust, user-friendly, and valuable product. The phased approach ensures that we deliver core functionality quickly while laying a solid foundation for future enhancements.