# 🤖 Gemini AI Integration Patterns

This file documents the patterns and best practices for integrating Gemini AI into the Classroom Management System.

## 1. Purpose
To leverage Gemini's capabilities for:
- **Content Generation:** Creating assignment descriptions, quiz questions, and study materials.
- **Grading Assistance:** Providing preliminary feedback on student submissions.
- **Personalized Learning:** Suggesting resources based on student performance.

## 2. Integration Strategy

### Backend (Node.js)
- **Library:** `@google/generative-ai`
- **Pattern:** Create a dedicated service `src/services/gemini.ts` to handle API interactions.
- **Security:** Store API keys in `.env` as `GEMINI_API_KEY`. Never expose them to the client.

### Frontend (React)
- **Pattern:** Do not call Gemini directly from the frontend. Always route requests through your backend API (e.g., `POST /api/ai/generate`).

### CI/CD & Infrastructure (Exceptions)
- **Pattern:** GitHub Actions and other build-time tools may call the Gemini API directly using GitHub Secrets. 
- **Reason:** These tools run in isolated, secure environments before the application is deployed, and cannot rely on a running backend service for reviews or builds.

## 3. Example Implementation
... (rest of file)
