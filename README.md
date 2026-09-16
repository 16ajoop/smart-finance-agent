


# 💰 Smart Finance Agent

### AI-Powered Personal Finance Analytics Platform

Smart Finance Agent is a full-stack AI-powered personal finance application that helps users track expenses, manage budgets, analyze spending, and ask questions about their finances using an AI assistant.

## 🚀 Live Demo

  https://smart-finance-agent.vercel.app/

## ✨ Features

- 📊 Financial dashboard
- 💰 Expense tracking
- 🎤 Voice-based expense entry
- ✍️ Text-based expense entry
- 🧾 Receipt upload and AI expense extraction
- 🤖 AI financial assistant
- 🎯 Monthly budget tracking
- 📈 Spending by category
- 💵 Savings rate and remaining balance
- 👤 Personalized financial profile
- 🔐 Secure user authentication

## 🤖 AI Financial Assistant

Users can ask questions about their financial data in natural language.

Examples:

- Where am I spending the most?
- Can I spend ₹5,000 on travel?
- How much disposable income do I have?
- Am I overspending on food?

The AI assistant analyzes the user's expenses, budgets, and financial profile to provide relevant financial insights.

## 🧾 Expense Management

Expenses can be added using different methods:

- Manual entry
- Text input
- Voice input
- Receipt image upload

For example:

> "Spent ₹450 on dinner using UPI"

The application extracts the expense details and allows the user to review them before saving.

## 📊 Dashboard

The dashboard provides an overview of:

- Monthly income
- Total expenses
- Remaining balance
- Savings rate
- Spending by category
- Budget vs actual spending
- Recent expenses

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- Axios
- CSS

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic

### AI

- Groq API

### Database

- PostgreSQL
- Neon

### Authentication

- Clerk

### Deployment

- Vercel
- Render

## 🏗️ Architecture

```text
                          User
                            │
                            ▼
                      React + Vite Frontend
                            │
                            ▼
                      FastAPI Backend
                            │
                            ├── Clerk Authentication
                            │
                            ├── PostgreSQL Database
                            │
                            └── Groq AI
                             │
                             ▼
                    Financial Analysis
```

## ⚙️ Local Setup

### 1. Clone the repository
    git clone https://github.com/16ajoop/smart-finance-agent.git
    cd smart-finance-agent

### 2. Backend Setup
    cd backend
    python -m venv venv

Activate the virtual environment on Windows: 

    venv\Scripts\activate

Install dependencies:
    
    pip install -r requirements.txt

Create a .env file inside the backend folder:

    DATABASE_URL=your_neon_database_url
    GROQ_API_KEY=your_groq_api_key
    CLERK_SECRET_KEY=your_clerk_secret_key
    FRONTEND_URL=http://localhost:5173

Run the backend:

    uvicorn app.main:app --reload

Backend:

    http://localhost:8000

API documentation:

    http://localhost:8000/docs
    
### 3. Frontend Setup

Open another terminal:

    cd frontend
    npm install

Create a .env file inside the frontend folder:

    VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
    VITE_API_URL=http://localhost:8000/api

Start the frontend:

    npm run dev

Open:

    http://localhost:5173

## 🔐 Environment Variables

Do not upload API keys or .env files to GitHub.

Backend
        
        DATABASE_URL
        GROQ_API_KEY
        CLERK_SECRET_KEY
        FRONTEND_URL
Frontend

        VITE_CLERK_PUBLISHABLE_KEY
        VITE_API_URL

## 📸 Screenshots

### Dashboard
<img width="1843" height="971" alt="Screenshot 2026-09-16 191007" src="https://github.com/user-attachments/assets/aa3c731f-840e-4c93-b494-7015d5ff0504" />

<img width="1846" height="971" alt="image" src="https://github.com/user-attachments/assets/15a42332-6822-479a-b126-9c716c233b42" />

### Expense Manager
<img width="1852" height="973" alt="image" src="https://github.com/user-attachments/assets/bb42095f-b768-4048-be63-6d73df9974c7" />

<img width="1847" height="971" alt="image" src="https://github.com/user-attachments/assets/b891a6bf-609d-4584-afa0-81bd24c153ad" />

<img width="1846" height="967" alt="image" src="https://github.com/user-attachments/assets/8b67cee9-fa4d-454a-ae1c-f06bdd49dc45" />

<img width="1842" height="965" alt="image" src="https://github.com/user-attachments/assets/5227e5bc-911e-4222-9e1f-2f3ad41b54d0" />

<img width="1841" height="962" alt="image" src="https://github.com/user-attachments/assets/59506036-2d3e-4336-a487-87e9e8ed5272" />

### Financial Agent
<img width="1843" height="965" alt="image" src="https://github.com/user-attachments/assets/c3f586fd-0f98-458f-8eda-ac6e9413d12a" />

### Financial Profile
<img width="1838" height="962" alt="image" src="https://github.com/user-attachments/assets/8daa107c-f706-4f9b-beab-64c419d8175f" />

<img width="1847" height="962" alt="image" src="https://github.com/user-attachments/assets/3a4c7bcc-f4d7-434b-b168-f8d1ed000779" />

<img width="1842" height="966" alt="image" src="https://github.com/user-attachments/assets/04112903-85b2-435e-a47e-309d59642819" />

## 🎯 What I Learned

Through this project, I learned how to:

  - Build a full-stack AI application
  - Develop REST APIs using FastAPI
  - Build interfaces using React and Vite
  - Integrate PostgreSQL databases
  - Implement authentication using Clerk
  - Integrate AI APIs using Groq
  - Connect frontend, backend, database, and AI services
  - Deploy applications using Vercel and Render

## 🔮 Future Improvements
  - Financial trend charts
  - Spending predictions
  - Personalized savings recommendations
  - Recurring expense detection
  - Financial alerts
  - Exportable financial reports

## 👩‍💻 Author

Pooja V

B.Tech Artificial Intelligence & Data Science

  - Interests
  - Data Science
  - Artificial Intelligence
  - Machine Learning
  - Generative AI
  - Full-Stack AI Applications

## ⭐ Project

If you find this project useful, feel free to star the repository.







