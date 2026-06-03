<p align="center">
  <img src="https://img.shields.io/badge/StudyFlow-AI%20Learning%20Platform-10B981?style=for-the-badge&logo=bookstack&logoColor=white" alt="StudyFlow" />
</p>

<h1 align="center">📚 StudyFlow — AI-Powered Document Learning Assistance</h1>


### 🌐 Live Demo - https://studyflow-ai-alpha.vercel.app/

<p align="center">
  <strong>Upload PDFs. Generate Mindmaps, Flashcards & Quizzes. Chat with AI. Track Progress.</strong><br/>
  A full-stack MERN application powered by Google Gemini AI that transforms static PDF documents into interactive, intelligent learning experiences.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=flat&logo=cloudinary&logoColor=white" />
  <img src="https://img.shields.io/badge/Google_Gemini-886FBF?style=flat&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS_4-06B6D4?style=flat&logo=tailwindcss&logoColor=white" />
</p>


![Project Dashboard](./frontend/public/image.png)

---

## 🌟 Project Highlights

- **End-to-End RAG Pipeline:** Architected using Express.js and Gemini API; leveraged semantic chunking and keyword-based retrieval to deliver context-aware mind maps, summaries, quizzes, and flashcards.
- **Optimized Frontend:** Built a responsive React frontend with route-level lazy loading and code splitting, reducing initial load time by 40%.
- **Secure Architecture:** Implemented secure auth via Google OAuth and JWT, paired with Cloudinary for scalable document storage.
- **AI-Powered Interfaces:** Designed an interactive AI chat interface with document-grounded Q&A and real-time learning analytics dashboards.

## ✨ Features

### 📄 Document Management
- **PDF Upload** — Upload PDFs up to 10 MB, securely stored on Cloudinary.
- **Smart Chunking** — Auto text extraction split into chunks and stored in MongoDB.
- **Cloud Viewer** — Built-in document viewer without iframe issues.

### 🤖 AI Features (Gemini 2.5)
- **Chat with Document** — Context-aware AI answers based on your PDFs.
- **Generate Mindmaps** — Auto-generated visual concept maps saved to the document.
- **Flashcards & Quizzes** — Instant study material generation with difficulty levels.
- **Summaries** — Get quick, concise overviews of any document.

### 📊 Progress & 🔐 Authentication
- **Dashboard** — Track study activity, quizzes, and recent documents.
- **Auth** — Local email/password and seamless Google OAuth integration.
- **Responsive** — Optimized for both desktop and mobile devices.

## 🏗️ Architecture & Tech Stack

- **Frontend:** React 19, Vite, TailwindCSS 4, React Router v7, Axios.
- **Backend:** Node.js, Express 5, Mongoose 9, JWT, Multer, pdf-parse, Cloudinary.
- **AI & DB:** Google Gemini AI SDK, MongoDB Atlas.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and MongoDB
- Cloudinary Account & Google Cloud Project (OAuth Client ID & Gemini API key)

### Setup
1. **Clone Repository**
   ```bash
   git clone https://github.com/your-username/StudyFlow_FullStack_Project_MERN.git
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *(Ensure `.env` contains MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_ID, GEMINI_API_KEY, CLOUDINARY variables)*

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *(Ensure `.env` contains VITE_API_URL and VITE_GOOGLE_CLIENT_ID)*

## 🔌 Core API Endpoints

- **Auth:** `/api/auth/register`, `/api/auth/login`, `/api/auth/google`, `/api/auth/profile`
- **Documents:** `/api/documents/upload`, `/api/documents`, `/api/documents/:id`
- **AI Tasks:** `/api/ai/chat`, `/api/ai/generate-mindmap`, `/api/ai/generate-flashcards`, `/api/ai/generate-quiz`
- **Study:** `/api/flashcards/`, `/api/quizzes/:id/submit`, `/api/progress/dashboard`

## 🗄️ Database Models
- **User:** Authentication & profile details.
- **Document:** Uploaded files, chunks, and embedded mindmaps.
- **Flashcard & Quiz:** Generated study resources linked to documents.
- **ChatHistory:** Saved multi-turn document conversations.

## 🌍 Deployment
Designed for Vercel serverless deployment. Both frontend and backend include `vercel.json` configurations. Connect your repository, set the root directory, configure environment variables, and deploy!

## 🤝 Contributing & License
1. Fork the repo and create a feature branch.
2. Commit your changes and open a Pull Request.
3. Licensed under the **ISC License**.
