const express = require('express');
const router = express.Router();

const SITE_URL = process.env.SITE_URL || 'https://prokitchen.app';

// ── Публичные маршруты с приоритетами для sitemap ───────────────────────────
const PUBLIC_ROUTES = [
    { path: '/', changefreq: 'monthly', priority: '1.0' },
    { path: '/calc', changefreq: 'monthly', priority: '0.9' },
    { path: '/allergens', changefreq: 'weekly', priority: '0.9' },
    { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
];

// ── GET /sitemap.xml ────────────────────────────────────────────────────────
router.get('/sitemap.xml', (req, res) => {
    const now = new Date().toISOString().split('T')[0];

    const urls = PUBLIC_ROUTES.map(
        ({ path, changefreq, priority }) => `
  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
    ).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=86400'); // кешируем на сутки
    res.send(xml);
});

// ── GET /robots.txt ─────────────────────────────────────────────────────────
router.get('/robots.txt', (req, res) => {
    const content = `User-agent: *
Allow: /
Allow: /calc
Allow: /allergens
Allow: /privacy

Disallow: /admin/
Disallow: /settings
Disallow: /favorites
Disallow: /labels
Disallow: /login
Disallow: /register
Disallow: /custom-dishes/
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=86400');
    res.send(content);
});

// ── GET /api/v1/seo/jsonld/dish/:id ────────────────────────────────────────
// Возвращает JSON-LD (Recipe) для конкретного блюда (для SSR или пре-рендера)
router.get('/jsonld/dish/:id', async (req, res, next) => {
    try {
        const { getDatabase } = require('../../shared/database/connection');
        const db = getDatabase();
        const { id } = req.params;

        const dish = await new Promise((resolve, reject) => {
            db.get(
                `SELECT d.id, d.name, d.notes, d.portions,
                        GROUP_CONCAT(i.name || ' ' || di.quantity || ' ' || di.unit) AS ingredient_list
                   FROM dishes d
                   LEFT JOIN dish_ingredients di ON di.dish_id = d.id
                   LEFT JOIN ingredients i ON i.id = di.ingredient_id
                  WHERE d.id = ? AND d.is_public = 1
                  GROUP BY d.id`,
                [id],
                (err, row) => (err ? reject(err) : resolve(row))
            );
        });

        if (!dish) {
            return res.status(404).json({ error: 'NotFound', message: 'Блюдо не найдено или недоступно' });
        }

        const ingredients = dish.ingredient_list
            ? dish.ingredient_list.split(',').map((s) => s.trim())
            : [];

        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Recipe',
            name: dish.name,
            description: dish.notes ?? '',
            recipeYield: `${dish.portions ?? 1} порций`,
            recipeIngredient: ingredients,
            url: `${SITE_URL}/dishes/${dish.id}`,
        };

        res.set('Content-Type', 'application/json; charset=utf-8');
        res.set('Cache-Control', 'public, max-age=3600');
        res.json(jsonLd);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
