# Flowers UZ - Backend API

Ushbu loyiha Flowers UZ veb-sahifasi uchun backend qismi hisoblanadi. Node.js, Express va PostgreSQL texnologiyalari asosida qurilgan.

## Xususiyatlari
- **JWT Auth**: Foydalanuvchilarni ro'yxatdan o'tkazish va tizimga kirish.
- **PostgreSQL**: Ma'lumotlar bazasi sifatida PostgreSQL ishlatilgan.
- **Xavfsizlik**: 
  - `helmet` orqali HTTP sarlavhalarini himoya qilish.
  - `express-rate-limit` orqali brute-force hujumlaridan himoya.
  - `bcryptjs` orqali parollarni xavfsiz saqlash.
  - JWT tokenlari orqali autentifikatsiya.
- **Admin Panel**: Administratorlar uchun maxsus buyurtmalarni ko'rish imkoniyati.

## O'rnatish va ishga tushirish

1. **Kutubxonalarni o'rnatish**:
   ```bash
   npm install
   ```

2. **Muhit o'zgaruvchilarini sozlash**:
   `.env.example` faylini `.env` deb nomlang va kerakli ma'lumotlarni (DATABASE_URL, JWT_SECRET) kiriting.

3. **Ishga tushirish**:
   ```bash
   npm start
   ```
   Dasturchilar uchun (nodemon bilan):
   ```bash
   npm run dev
   ```

## API Endpoints

### Auth
- `POST /auth/register` - Ro'yxatdan o'tish
- `POST /auth/login` - Tizimga kirish
- `GET /auth/me` - Foydalanuvchi ma'lumotlari (Token talab qilinadi)

### Orders
- `POST /api/orders` - Yangi buyurtma yaratish
- `GET /api/orders` - Foydalanuvchi buyurtmalari
- `GET /api/orders/:id` - Bitta buyurtma tafsilotlari
- `DELETE /api/orders/:id` - Buyurtmani bekor qilish

### Admin
- `GET /api/admin/orders` - Barcha buyurtmalarni ko'rish (Faqat adminlar uchun)

### Health Check
- `GET /health` - Server va DB holatini tekshirish
