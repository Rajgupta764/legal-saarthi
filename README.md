# 🏛️ Rural Legal Saathi (ग्रामीण कानूनी साथी)

> **Your Trusted Legal Companion for Rural Communities**

A comprehensive, bilingual legal assistance platform designed to bridge the justice gap in rural India. Rural Legal Saathi empowers rural citizens with easy access to legal information, document verification, complaint filing, and AI-powered legal guidance—all in their native language.

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/Backend-Flask-000000?style=flat&logo=flask)](https://flask.palletsprojects.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🌟 Key Features

### 📄 **Document Verification & Analysis**
- Upload and verify legal documents
- AI-powered document analysis
- Identify potential issues and risks
- Get instant legal insights

### 🎙️ **Voice-Enabled Complaint System**
- Record complaints in Hindi/regional languages
- Automatic speech-to-text transcription
- Generate FIR drafts automatically
- No literacy barriers

### 🗺️ **Legal Aid Finder**
- Locate nearby police stations, courts, legal aid centers
- Interactive map with contact information
- Distance and directions to nearest facilities

### 📝 **Document Draft Generator**
- Generate FIR (First Information Report)
- Create legal applications and petitions
- Pre-filled templates for common cases
- Download in PDF format

### 🎯 **Government Scheme Matcher**
- Match users with eligible government schemes
- Personalized recommendations
- Step-by-step application guidance

### 🛡️ **Legal Rights & Protection Guide**
- Know your legal rights
- Understand laws and protections
- FAQs for common legal scenarios
- Fear removal through knowledge

### 💬 **AI Legal Chatbot**
- 24/7 legal assistance
- Ask questions in Hindi/English
- Get instant legal guidance
- Context-aware responses

### 🎤 **Voice Assistant**
- Hands-free operation
- Voice commands in Hindi
- Accessible for illiterate users

### 🔐 **Secure Authentication**
- JWT-based authentication
- MongoDB for user data storage
- Secure password encryption
- Protected routes and data

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **State Management:** Context API
- **UI/UX:** Responsive design with Hindi/English support

### **Backend**
- **Framework:** Flask (Python 3.10+)
- **Authentication:** JWT (PyJWT)
- **Password Hashing:** bcrypt
- **Database:** MongoDB (PyMongo)
- **CORS:** Flask-CORS
- **Environment:** python-dotenv

### **Database**
- **Primary:** MongoDB Atlas (Cloud)
- **Collections:** Users, Documents, Complaints, Queries

---

## 📁 Project Structure

```
rural-legal-saathi/
├── frontend/                      # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Reusable components
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   ├── features/         # Feature components
│   │   │   │   ├── Chatbot.jsx
│   │   │   │   ├── DocumentUpload.jsx
│   │   │   │   ├── DraftGenerator.jsx
│   │   │   │   ├── LegalHelpFinder.jsx
│   │   │   │   ├── SchemeMatcher.jsx
│   │   │   │   ├── VoiceAssistant.jsx
│   │   │   │   ├── VoiceComplaint.jsx
│   │   │   │   └── LegalFearRemovalMode.jsx
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx
│   │   │       └── Footer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Auth.jsx          # Login/Signup
│   │   │   ├── Dashboard.jsx
│   │   │   └── Upload.jsx
│   │   ├── services/
│   │   │   ├── api.js            # Axios configuration
│   │   │   └── supabase.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/                       # Flask Backend
│   ├── app/
│   │   ├── __init__.py           # Flask app factory
│   │   ├── routes/               # API routes
│   │   │   ├── auth_routes.py
│   │   │   ├── document_routes.py
│   │   │   ├── chatbot_routes.py
│   │   │   ├── draft_routes.py
│   │   │   ├── scheme_routes.py
│   │   │   ├── legal_aid_routes.py
│   │   │   └── legal_education_routes.py
│   │   ├── services/             # Business logic
│   │   │   ├── auth_service.py
│   │   │   ├── document_service.py
│   │   │   ├── chatbot_service.py
│   │   │   └── legal_education_service.py
│   │   ├── models/
│   │   │   └── user.py
│   │   ├── config/
│   │   │   └── mongodb.py        # MongoDB connection
│   │   └── utils/
│   │       └── helpers.py
│   ├── app.py                    # Entry point
│   ├── requirements.txt
│   └── .env
│
├── README.md
└── .gitignore
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16+ and npm
- **Python** 3.10+
- **MongoDB** (Local or Atlas)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/rural-legal-saathi.git
cd rural-legal-saathi
```

### 2️⃣ Backend Setup

```bash
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env and add your MongoDB connection string
```

**Backend `.env` Configuration:**
```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DATABASE_NAME=legal_saathi_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY_HOURS=24

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

```bash
# Start the backend server
python app.py
```

Backend will run on `http://localhost:5000`

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Frontend `.env` Configuration:**
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start the development server
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🔑 Authentication Flow

1. **Signup:** Create account with name, email, phone, and password
2. **Login:** Authenticate with email and password
3. **JWT Token:** Server issues JWT token on successful login
4. **Protected Routes:** Dashboard and features require authentication
5. **Auto-login:** Token stored in localStorage for persistence
6. **Logout:** Clear token and redirect to home

---

## 📱 Features Overview

### Dashboard
- **8 Main Features** accessible from sidebar navigation
- User profile with avatar (first letter of name)
- Online status indicator (green dot)
- Logout option in navbar (desktop) and mobile menu

### Document Upload
- Drag-and-drop interface
- Support for PDF, images, and documents
- AI-powered analysis and verification

### Voice Complaint
- Record audio complaints
- Speech-to-text conversion
- Generate FIR drafts automatically

### Legal Help Finder
- Find nearby legal resources
- Police stations, courts, legal aid centers
- Interactive maps with directions

### Draft Generator
- Generate FIR, complaints, applications
- Pre-filled templates
- Download as PDF

### Scheme Matcher
- Match with government schemes
- Eligibility checker
- Application guidance

### Legal Education
- Learn about your rights
- Legal concepts explained simply
- Hindi and English content

### Chatbot & Voice Assistant
- AI-powered legal guidance
- Hindi/English support
- 24/7 availability

---

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/signup       # Register new user
POST /api/auth/login        # Login user
POST /api/auth/verify-token # Verify JWT token
GET  /api/auth/user         # Get current user info
```

### Documents
```
POST /api/documents/upload  # Upload document
POST /api/documents/analyze # Analyze document
```

### Drafts
```
POST /api/drafts/fir        # Generate FIR
POST /api/drafts/complaint  # Generate complaint
```

### Legal Aid
```
GET /api/legal-aid/nearby   # Find nearby legal aid
```

### Schemes
```
POST /api/schemes/match     # Match schemes
```

### Chatbot
```
POST /api/chatbot/query     # Chat with AI
```

---

## 🎨 Design Features

- **Bilingual UI:** Hindi & English
- **Responsive Design:** Works on mobile, tablet, and desktop
- **Accessibility:** Voice features for illiterate users
- **Modern UI:** Clean, intuitive interface with Tailwind CSS
- **Color Scheme:** Saffron and trust-blue gradient theme

---

## 🔒 Security

- JWT-based authentication
- Bcrypt password hashing
- Protected API routes
- CORS configuration
- Environment variables for sensitive data
- Input validation and sanitization

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Developed with ❤️ for rural communities in India.

---

## 📧 Contact

For questions or suggestions, please open an issue or contact us.

---

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by the need to make legal services accessible to all
- Built for rural India with love

---

**⚖️ Empowering Rural India with Legal Knowledge**

*"Justice delayed is justice denied. Let's make justice accessible."*
│   │   │   ├── ai_service.py         # AI/LLM integration
│   │   │   └── translation_service.py
│   │   │
│   │   ├── utils/                    # Helper utilities
│   │   │   ├── __init__.py
│   │   │   ├── helpers.py
│   │   │   ├── validators.py
│   │   │   └── decorators.py
│   │   │
│   │   ├── config/                   # Configuration
│   │   │   ├── __init__.py
│   │   │   └── config.py             # Dev/Prod/Test settings
│   │   │
│   │   └── middleware/               # Middleware
│   │       ├── __init__.py
│   │       ├── auth_middleware.py
│   │       └── error_handlers.py
│   │
│   ├── tests/                        # Test files
│   │   ├── __init__.py
│   │   ├── test_auth.py
│   │   └── test_legal.py
│   │
│   ├── run.py                        # Application entry point
│   ├── requirements.txt              # Python dependencies
│   └── .env
│
├── .gitignore
└── README.md
```

---

## 🎯 Architecture Overview

### Frontend (React + Vite)

| Folder | Purpose |
|--------|---------|
| `components/common/` | Reusable UI components (Button, Input, Modal) |
| `components/layout/` | Layout structure (Header, Footer, Sidebar) |
| `components/features/` | Feature-specific components (ChatBox, Forms) |
| `pages/` | Route-level page components |
| `hooks/` | Custom React hooks |
| `services/` | API calls via Axios |
| `utils/` | Helper functions, constants, validators |
| `context/` | React Context for global state |
| `router/` | React Router configuration |
| `styles/` | Global CSS with Tailwind |

### Backend (Flask)

| Folder | Purpose |
|--------|---------|
| `routes/` | API endpoint definitions (Blueprints) |
| `models/` | Database models & schemas |
| `services/` | Business logic & AI service integration |
| `utils/` | Helper functions & decorators |
| `config/` | Environment configurations |
| `middleware/` | Auth middleware & error handlers |
| `tests/` | Unit & integration tests |

---

## 🛠️ Tech Stack

**Frontend:**
- React 18 (Vite)
- Tailwind CSS
- Axios
- React Router v6

**Backend:**
- Python 3.10+
- Flask
- Flask-CORS

---

## 📝 File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `ChatBox.jsx` |
| Hooks | camelCase with `use` prefix | `useFetch.js` |
| Services | camelCase with `Service` suffix | `authService.js` |
| Utils | camelCase | `helpers.js` |
| Python Modules | snake_case | `ai_service.py` |
| Routes | snake_case with `_routes` suffix | `auth_routes.py` |

---

## 🚀 Getting Started

Instructions to be added after code generation.
