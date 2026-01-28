# Flowers UZ - Loyihani Sozlash va Ishga Tushirish

## Loyihaning Tuzilishi

flowers-uz-project/
├── backend/              # Node.js/Express backend
│   ├── backend.js        # Asosiy server fayli
│   ├── package.json      # Dependencies
│   ├── .env.example      # Environment o'zgaruvchilari
│   └── README.md         # Backend hujjatlari
│
└── frontend/             # React frontend
    ├── src/
    │   ├── App.jsx       # Asosiy komponent
    │   ├── index.css     # Tailwind CSS
    │   └── index.js      # Entry point
    ├── package.json      # Dependencies
    ├── tailwind.config.js
    └── README_FLOWERS.md # Frontend hujjatlari

## Boshlang'ich Sozlash

### 1. Backend'ni Sozlash

cd backend
npm install
cp .env.example .env
# .env faylida DATABASE_URL va JWT_SECRET'ni to'ldiring
npm start

Backend http://localhost:5000 da ishga tushadi.

### 2. Frontend'ni Sozlash

cd frontend
npm install
npm start

Frontend http://localhost:3000 da ochiladi.

## Environment O'zgaruvchilari

### Backend (.env)

DATABASE_URL=postgres://user:password@host:port/database
JWT_SECRET=your_very_strong_secret_key
PORT=5000
FRONTEND_URL=http://localhost:3000

### Frontend

src/App.jsx faylida API_BASE o'zgaruvchisini o'zgartiring:

const API_BASE = 'http://localhost:5000'; // Development

## Xavfsizlik Tadbiri

✅ Backend:
- JWT tokenlar maxfiy kaliti bilan shifrlangan
- Parollar bcryptjs bilan hash qilingan
- Helmet middleware HTTP hujumlardan himoya qiladi
- Rate limiting brute-force hujumlardan himoya qiladi

✅ Frontend:
- JWT tokenlar sessionStorage'da saqlanadi
- Parol ma'lumotlari frontend'da saqlanmaydi

## Litsenziya

© 2025 flowers_uz. All rights reserved.
