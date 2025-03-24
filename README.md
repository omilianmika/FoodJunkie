# FoodJunkie - Smart Food Management App

A modern web application that helps you manage your food inventory, track expiration dates, and get recipe recommendations based on your available ingredients.

## Features

- 📸 Barcode and Receipt Scanning
- 📊 Inventory Dashboard
- ⏰ Expiration Date Tracking
- 🍳 Recipe Recommendations
- 🎲 "What Can We Eat?" Random Recipe Carousel
- 📱 Responsive Design

## Tech Stack

- Frontend: React + TypeScript + Vite
- Backend: Python + FastAPI
- Database: PostgreSQL
- UI Framework: Tailwind CSS + Headless UI
- Authentication: JWT

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- PostgreSQL
- Git

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Database Setup

1. Create a PostgreSQL database
2. Update the database connection string in `backend/.env`
3. Run migrations: `alembic upgrade head`

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/foodjunkie
JWT_SECRET=your-secret-key
```

## License

MIT 
