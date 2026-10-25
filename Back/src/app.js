const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./features/auth/auth.routes');
const dishesRoutes = require('./features/dishes/dishes.routes');
const ingredientsRoutes = require('./features/ingredients/ingredients.routes');
const allergensRoutes = require('./features/allergens/allergens.routes');
const customDishesRoutes = require('./features/custom-dishes/custom-dishes.routes');
const adminRoutes = require('./features/admin/admin.routes');
const seoRoutes = require('./features/seo/seo.routes');
const nutritionRoutes = require('./features/nutrition/nutrition.routes');
const errorHandler = require('./shared/middleware/error-handler');
const { notFoundHandler } = require('./shared/middleware/error-handler');
const { RateLimiter } = require('./shared/middleware/rate-limiter');
const rateLimiter = new RateLimiter().middleware();

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimiter);

// Health check routes
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});

app.get('/api/v1/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is healthy', timestamp: new Date().toISOString() });
});

// SEO: sitemap.xml и robots.txt (без /api/v1 — стандартные пути)
app.use('/', seoRoutes);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dishes', dishesRoutes);
app.use('/api/v1/ingredients', ingredientsRoutes);
app.use('/api/v1/allergens', allergensRoutes);
app.use('/api/v1/custom-dishes', customDishesRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/nutrition', nutritionRoutes);
app.use('/api/v1/seo', seoRoutes); // JSON-LD endpoint

// 404 — должен быть ПЕРЕД errorHandler, ПОСЛЕ всех маршрутов
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
});

module.exports = { app, server };