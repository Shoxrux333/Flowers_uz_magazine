# Flowers UZ - O'rnatish va Ishga Tushirish Qo'llanmasi

## 📋 Talablar

- Node.js 16+ va npm
- PostgreSQL 12+
- Git

## 🚀 Tezkor Boshlash

### 1. Loyihani Yuklab Olish

```bash
unzip flowers-uz-complete.zip
cd flowers-uz-project
```

### 2. Backend'ni Sozlash

```bash
cd backend
npm install
cp .env.example .env
```

`.env` faylida quyidagilarni to'ldiring:

```
DATABASE_URL=postgres://username:password@localhost:5432/flowers_uz
JWT_SECRET=your_very_strong_secret_key_here_min_32_chars
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

Backend'ni ishga tushiring:

```bash
npm start
```

✅ Agar "✅ PostgreSQL ulandi" ko'rsatilsa, database ulanishi muvaffaqiyatli.

### 3. Frontend'ni Sozlash

Yangi terminal oching:

```bash
cd frontend
npm install
npm start
```

Frontend avtomatik ravishda `http://localhost:3000` da ochiladi.

## 🔐 Xavfsizlik Konfiguratsiyasi

### JWT_SECRET Yaratish

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Chiqish natijasini `.env` faylida `JWT_SECRET` qiymatiga qo'ying.

### PostgreSQL Database Yaratish

```bash
psql -U postgres
CREATE DATABASE flowers_uz;
\q
```

## 🧪 Sinovdan O'tkazish

### Backend API'ni Tekshirish

```bash
curl http://localhost:5000/
```

Kutilgan natija:
```json
{
  "message": "Flowers UZ API",
  "version": "1.0.0",
  "endpoints": {...}
}
```

### Health Check

```bash
curl http://localhost:5000/health
```

### Ro'yxatdan O'tish Sinovasi

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

## 📦 Production Deployment

### Backend (Render.com misoli)

1. Render'da yangi Web Service yaratish
2. GitHub'dan loyihani ulash
3. Build command: `npm install`
4. Start command: `npm start`
5. Environment variables'larni o'rnatish:
   - DATABASE_URL
   - JWT_SECRET
   - NODE_ENV=production

### Frontend (Vercel misoli)

1. Vercel'ga GitHub'dan loyihani ulash
2. Build command: `npm run build`
3. Output directory: `build`
4. Environment variables:
   - REACT_APP_API_BASE=https://your-backend-url.com

## 🐛 Masalalarni Bartaraf Qilish

### "DATABASE_URL o'rnatilmagan" xatosi

```bash
# .env faylida DATABASE_URL'ni tekshiring
cat backend/.env | grep DATABASE_URL
```

### "Port 5000 allaqachon ishlatilmoqda" xatosi

```bash
# Boshqa port'da ishga tushiring
PORT=5001 npm start
```

### Frontend backend'ga ulanmayotgan bo'lsa

1. Backend ishga tushganligini tekshiring: `curl http://localhost:5000`
2. `src/App.jsx` faylida `API_BASE` to'g'ri ekanligini tekshiring
3. CORS xatolarini brauzerni console'da tekshiring

### npm install xatosi

```bash
npm cache clean --force
npm install
```

## 📚 Fayllar Tuzilishi

```
flowers-uz-project/
├── backend/
│   ├── backend.js          # Express server
│   ├── package.json        # Dependencies
│   ├── .env.example        # Environment template
│   └── README.md           # Backend hujjatlari
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Asosiy React komponent
│   │   ├── index.css       # Tailwind CSS
│   │   └── index.js        # Entry point
│   ├── package.json        # Dependencies
│   ├── tailwind.config.js  # Tailwind konfiguratsiyasi
│   └── README_FLOWERS.md   # Frontend hujjatlari
│
└── PROJECT_SETUP.md        # Bu fayl
```

## 🔗 API Endpoints

### Authentication
- `POST /auth/register` - Ro'yxatdan o'tish
- `POST /auth/login` - Tizimga kirish
- `GET /auth/me` - Foydalanuvchi ma'lumotlari

### Orders
- `POST /api/orders` - Yangi buyurtma
- `GET /api/orders` - Buyurtmalarni ko'rish
- `DELETE /api/orders/:id` - Buyurtmani bekor qilish

### Admin
- `GET /api/admin/orders` - Barcha buyurtmalar

## 💡 Maslahatlar

1. **Development'da**: `npm run dev` backend uchun (nodemon bilan)
2. **Production'da**: Environment variables'larni xavfsiz saqlang
3. **Database backup**: Muntazam ravishda backup oling
4. **Logs**: Server logs'larini kuzatib turing

## 📞 Yordam

Muammoga duch kelgan bo'lsa:

1. Console'da xatolarni tekshiring
2. `.env` faylini tekshiring
3. Database ulanishini tekshiring
4. Portlar bo'sh ekanligini tekshiring

## 📄 Litsenziya

© 2025 flowers_uz. All rights reserved.
