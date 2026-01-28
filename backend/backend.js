// server.js - Flowers UZ Backend Server (PostgreSQL + JWT)
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(helmet());

// Rate limiting - xavfsizlik uchun
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 daqiqa
    max: 100, // Har bir IP uchun 100 ta so'rov
    message: { error: "Juda ko'p so'rov yuborildi, iltimos birozdan keyin urinib ko'ring." }
});
app.use('/auth/', limiter);

// PostgreSQL ulanish (Neon.tech bepul database)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Database ulanishini tekshirish
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ PostgreSQL ulanish xatosi:', err);
    } else {
        console.log('✅ PostgreSQL ulandi:', res.rows[0].now);
    }
});

// ========================
// DATABASE SETUP
// ========================

const initDatabase = async() => {
    try {
        // Users jadvali
        await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        // Orders jadvali (30 kun avtomatik o'chirish)
        await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user_email TEXT NOT NULL,
        items JSONB NOT NULL,
        customer JSONB NOT NULL,
        total INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50) DEFAULT 'card',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days'
      )
    `);

        // Index - tezroq qidirish uchun
        await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON orders(expires_at);
    `);

        console.log('✅ Database jadvallar tayyor');
    } catch (error) {
        console.error('❌ Database setup xatosi:', error);
    }
};

initDatabase();

// Muddati o'tgan buyurtmalarni o'chirish (har 24 soatda)
setInterval(async() => {
    try {
        const result = await pool.query(
            'DELETE FROM orders WHERE expires_at < NOW() RETURNING id'
        );
        if (result.rowCount > 0) {
            console.log(`🗑️  ${result.rowCount} ta muddati o'tgan buyurtma o'chirildi`);
        }
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}, 24 * 60 * 60 * 1000); // 24 soat

// ========================
// AUTH MIDDLEWARE
// ========================

const authenticateToken = (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        console.error('❌ JWT_SECRET muhit o\'zgaruvchisi o\'rnatilmagan!');
        return res.status(500).json({ error: 'Server konfiguratsiya xatosi' });
    }
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token yo\'q. Iltimos tizimga kiring.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token noto\'g\'ri yoki muddati o\'tgan' });
        }
        req.user = user;
        next();
    });
};

// ========================
// AUTH ROUTES
// ========================

// Ro'yxatdan o'tish
app.post('/auth/register', async(req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validatsiya
        if (!email || !password) {
            return res.status(400).json({ error: 'Email va parol majburiy' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' });
        }

        // Email tekshirish
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1', [email.toLowerCase()]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
        }

        // Parolni hash qilish
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yangi foydalanuvchi yaratish
        const result = await pool.query(
            'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name', [email.toLowerCase(), hashedPassword, name || email.split('@')[0]]
        );

        const user = result.rows[0];

        // JWT token
        const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin },
            process.env.JWT_SECRET, { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Kirish
app.post('/auth/login', async(req, res) => {
    try {
        const { email, password } = req.body;

        // Validatsiya
        if (!email || !password) {
            return res.status(400).json({ error: 'Email va parol majburiy' });
        }

        // Foydalanuvchini topish
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Email yoki parol noto\'g\'ri' });
        }

        const user = result.rows[0];

        // Parolni tekshirish
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Email yoki parol noto\'g\'ri' });
        }

        // JWT token
        const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin },
            process.env.JWT_SECRET, { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// Foydalanuvchi ma'lumotlari
app.get('/auth/me', authenticateToken, async(req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, name, created_at FROM users WHERE id = $1', [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
        }

                const user = result.rows[0];
        delete user.password; // Parolni o'chirish
        res.json({ user });
    } catch (error) {
        console.error('User fetch error:', error);
        res.status(500).json({ error: 'Server xatosi' });
    }
});

// ========================
// ORDER ROUTES
// ========================

// Buyurtma yaratish
app.post('/api/orders', authenticateToken, async(req, res) => {
    try {
        const { items, customer, total, paymentMethod } = req.body;

        // Validatsiya
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Mahsulotlar yo\'q' });
        }

        if (!customer.name || !customer.phone || !customer.address) {
            return res.status(400).json({ error: 'Mijoz ma\'lumotlari to\'liq emas' });
        }

        // Buyurtma yaratish
        const result = await pool.query(
            `INSERT INTO orders (user_id, user_email, items, customer, total, payment_method)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, created_at, expires_at`, [
                req.user.id,
                req.user.email,
                JSON.stringify(items),
                JSON.stringify(customer),
                total,
                paymentMethod || 'card'
            ]
        );

        const order = result.rows[0];

        console.log('🎉 Yangi buyurtma:', {
            orderId: order.id,
            userId: req.user.id,
            total,
            itemsCount: items.length,
            expiresAt: order.expires_at
        });

        res.json({
            success: true,
            orderId: order.id,
            message: 'Buyurtma qabul qilindi',
            expiresAt: order.expires_at
        });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Buyurtma yaratishda xatolik' });
    }
});

// Foydalanuvchi buyurtmalarini ko'rish
app.get('/api/orders', authenticateToken, async(req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, items, customer, total, status, payment_method, created_at, expires_at
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`, [req.user.id]
        );

        res.json({ orders: result.rows });
    } catch (error) {
        console.error('Orders fetch error:', error);
        res.status(500).json({ error: 'Buyurtmalarni yuklashda xatolik' });
    }
});

// Bitta buyurtmani ko'rish
app.get('/api/orders/:orderId', authenticateToken, async(req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM orders WHERE id = $1 AND user_id = $2`, [parseInt(req.params.orderId), req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Buyurtma topilmadi' });
        }

        res.json({ order: result.rows[0] });
    } catch (error) {
        console.error('Order fetch error:', error);
        res.status(500).json({ error: 'Buyurtmani yuklashda xatolik' });
    }
});

// Buyurtmani bekor qilish
app.delete('/api/orders/:orderId', authenticateToken, async(req, res) => {
    try {
        const result = await pool.query(
            `UPDATE orders SET status = 'cancelled' WHERE id = $1 AND user_id = $2 RETURNING id`, [req.params.orderId, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Buyurtma topilmadi' });
        }

        res.json({ success: true, message: 'Buyurtma bekor qilindi' });
    } catch (error) {
        console.error('Order cancellation error:', error);
        res.status(500).json({ error: 'Buyurtmani bekor qilishda xatolik' });
    }
});

// ========================
// ADMIN ROUTES
// ========================

// Barcha buyurtmalar (Admin)
app.get('/api/admin/orders', authenticateToken, async(req, res) => {
    try {
        // Admin tekshirish
        if (!req.user.is_admin) {
            return res.status(403).json({ error: 'Ruxsat yo\'q. Faqat administratorlar uchun.' });
        }
        const result = await pool.query(
            `SELECT o.*, u.email as user_email, u.name as user_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 100`
        );

        res.json({ orders: result.rows });
    } catch (error) {
        console.error('Admin orders fetch error:', error);
        res.status(500).json({ error: 'Buyurtmalarni yuklashda xatolik' });
    }
});

// ========================
// HEALTH CHECK
// ========================

app.get('/health', async(req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: error.message
        });
    }
});

// Test endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Flowers UZ API',
        version: '1.0.0',
        endpoints: {
            auth: '/auth/register, /auth/login, /auth/me',
            orders: '/api/orders',
            health: '/health'
        }
    });
});

// ========================
// ERROR HANDLER
// ========================

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Server xatosi yuz berdi' });
});

// ========================
// SERVER START
// ========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal qabul qilindi: server yopilmoqda...');
    pool.end(() => {
        console.log('PostgreSQL pool yopildi');
        process.exit(0);
    });
});