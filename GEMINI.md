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

## 3. Example Implementation

### Backend Service
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const generateContent = async (prompt: string) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};
```

### API Route
```typescript
// src/routes/ai.ts
router.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  try {
    const content = await generateContent(prompt);
    res.json({ content });
  } catch (error) {
    res.status(500).json({ error: "AI generation failed" });
  }
});
```

## 4. Use Cases

### A. Assignment Helper
- **Input:** Subject, Topic, Difficulty Level.
- **Output:** A structured assignment description with learning objectives.

### B. Quiz Generator
- **Input:** Text content or topic.
- **Output:** A JSON array of multiple-choice questions.

## 5. Rate Limiting & Cost
- Implement rate limiting on the backend to prevent abuse.
- Cache common responses where possible to save on API calls.
