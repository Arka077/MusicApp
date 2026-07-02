# 🎵 MusicApp

A full-stack music application with a modern React frontend, Node/Express backend APIs, and a Python ML service.  
The app is deployed on Vercel and provides a responsive, modular architecture for music-related features.

🌐 **Live App:** https://music-app-phi-six.vercel.app/

---

## 📌 Project Overview

**MusicApp** is structured as a multi-service repository:

- **Frontend**: React + Vite web client
- **Backend**: Node.js/Express REST APIs with authentication, uploads, and DB integration
- **ML Service**: Python-based service for machine-learning powered functionality (recommendations/analysis, depending on your implementation)

This split architecture makes the app easier to scale and maintain.

---

## 🧰 Tech Stack

### Frontend (`/frontend`)
- React
- Vite
- React Router DOM
- Axios
- CSS

### Backend (`/backend`)
- Node.js
- Express
- MySQL (`mysql2`)
- JWT (`jsonwebtoken`)
- Bcrypt
- Multer
- Cookie Parser
- CORS
- Dotenv
- ImageKit SDK

### ML Service (`/ml_service`)
- Python (service module in separate directory)

---

## 📁 Repository Structure

```bash
MusicApp/
├── .github/
├── backend/
│   ├── package.json
│   └── ... (server and API source files)
├── frontend/
│   ├── package.json
│   └── ... (React app source files)
├── ml_service/
│   └── ... (Python ML service files)
└── .gitignore
```

---

## 🏗️ How the Project is Built

MusicApp is built as a **3-layer architecture**:

### 1) Frontend Layer (React + Vite)
- Handles UI rendering, routing, and user interaction.
- Uses `react-router-dom` for page navigation.
- Uses `axios` for API calls to backend services.
- Built and served with Vite for fast local development and production bundling.

### 2) Backend API Layer (Node + Express)
- Exposes REST APIs consumed by the frontend.
- Manages business logic (auth, user/session handling, data operations).
- Uses:
  - `jsonwebtoken` + `bcrypt` for authentication/security
  - `mysql2` for database communication
  - `multer` for file upload handling
  - `cookie-parser` and `cors` for HTTP/session flow
  - `@imagekit/nodejs` for media workflow support

### 3) ML Service Layer (Python)
- Isolated Python service for ML-specific tasks.
- Keeps model/analysis logic separate from core backend APIs.
- Can be called by backend routes (or directly, depending on your setup) for prediction/recommendation features.

### Service Communication Flow
1. User interacts with React frontend.
2. Frontend sends requests to Node/Express backend.
3. Backend reads/writes data (MySQL) and handles authentication.
4. Backend calls ML service when intelligent processing is required.
5. Processed response is returned to frontend and shown in UI.

This modular approach allows each layer to be updated independently.

---

## ⚙️ Local Development Setup

> Run each service in its own terminal.

---

### 1) Clone the repository

```bash
git clone https://github.com/Arka077/MusicApp.git
cd MusicApp
```

---

### 2) Frontend setup (`/frontend`)

```bash
cd frontend
npm install
npm run dev
```

Frontend scripts (from your `frontend/package.json`):

- `npm run dev` → starts Vite dev server
- `npm run build` → production build
- `npm run preview` → preview build locally
- `npm run lint` → lint code

---

### 3) Backend setup (`/backend`)

```bash
cd backend
npm install
npm run dev
```

Backend scripts (from your `backend/package.json`):

- `npm run dev` → starts server with nodemon (`server.js`)
- `npm start` → starts server with Node (`server.js`)

---

### 4) ML service setup (`/ml_service`)

```bash
cd ml_service
# create venv (recommended)
python -m venv venv

# activate venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# install dependencies (if requirements.txt exists)
pip install -r requirements.txt

# run the service (update command per your entry file)
python app.py
# or
python main.py
```

---

## 🔐 Environment Variables

Create `.env` files in services that require secrets/config.

### Example: backend `.env`

```env
PORT=5000
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=musicapp
JWT_SECRET=your_jwt_secret
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=your_url_endpoint
CORS_ORIGIN=http://localhost:5173
```

### Example: frontend `.env` (if needed)

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Example: ml_service `.env` (if needed)

```env
MODEL_PATH=./models/model.pkl
SERVICE_PORT=8000
```

> Keep `.env` files out of Git. Commit only `.env.example` templates.

---

## 🚀 Deployment

The frontend is deployed on **Vercel**:

🔗 https://music-app-phi-six.vercel.app/

## 👤 Author

**Arka077**  
GitHub: https://github.com/Arka077

---

If you like this project, consider giving it a ⭐
