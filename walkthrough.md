# PharmaGuard System Integration Walkthrough

This document outlines the changes made to integrate the frontend, Express backend, and FastAPI backend, and provides instructions on how to run the system.

## 1. Integration Details

### Backend Integration
- **Express Service (Node.js)**:
  - Updated `upload.controller.js` to handle VCF uploads and trigger analysis in the FastAPI service.
  - Added new endpoints:
    - `POST /api/v1/analyze`: Triggers the analysis process.
    - `GET /api/v1/records/id/:recordId`: Fetches analysis results by record ID.
  - Configured to run on **Port 3000** (proxied from Vite /api).
- **FastAPI Service (Python)**:
  - Created `requirements.txt` with necessary dependencies (`fastapi`, `uvicorn`, `pydantic`, `requests`, `groq`).
  - Configured to run on **Port 8000**.

### Frontend Integration
- **API Service**:
  - Created `src/services/analysisApi.ts` to handle communication with the Express backend.
  - Maps backend data structures to the frontend `StoredAnalysis` interface.
- **Pages**:
  - **VCFUpload.tsx**: Refactored to perform real file uploads using `analysisApi`.
  - **LandingPage.tsx**: Refactored to support the full analysis workflow (upload -> drug selection -> analysis).
  - **ReportPage.tsx**: Refactored to fetch real analysis data from the backend using the new API service.
- **Routing**:
  - Updated navigation to redirect to `/report/:id` after analysis.

## 2. Startup Instructions

### Unified Startup Script
A batch script `start-app.bat` has been created in the project root to start all services simultaneously.

1.  **Prerequisites**:
    - Ensure Node.js and Python are installed.
    - Install dependencies (if not already done):
      ```cmd
      cd frontend && npm install
      cd ../backend/express-service && npm install
      cd ../fastapi-service && pip install -r requirements.txt
      ```

2.  **Running the App**:
    - Double-click `start-app.bat` or run it from the terminal:
      ```cmd
      d:\Desktop\PharmaGuard\start-app.bat
      ```
    - This will open separate command prompts for:
      - Express Service (Port 3000)
      - FastAPI Service (Port 8000)
      - Frontend (Port 5173 - opens in browser)

### Manual Startup (Alternative)
If you prefer running services individually:

1.  **Express Backend**:
    ```bash
    cd backend/express-service
    npm start
    ```
2.  **FastAPI Backend**:
    ```bash
    cd backend/fastapi-service
    python -m uvicorn app.main:app --port 8000
    ```
3.  **Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```

## 3. Usage Workflow
1.  Open the frontend (http://localhost:5173).
2.  **Upload VCF**: Drag and drop a valid `.vcf` file.
3.  **Select Drugs**: Choose drugs for analysis.
4.  **Analyze**: Click "Run Pharmacogenomic Analysis".
5.  **View Report**: You will be redirected to the report page displaying the results.
