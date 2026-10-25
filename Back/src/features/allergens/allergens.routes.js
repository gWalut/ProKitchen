const express = require('express');
const router = express.Router();
const allergensModel = require('./allergens.model');

// Получить список всех аллергенов
router.get('/', async (req, res, next) => {
    try {
        const allergens = await allergensModel.getAll();
        res.json({
            success: true,
            data: allergens
        });
    } catch (error) {
        next(error);
    }
});

// Получить аллерген по ID
router.get('/:id', async (req, res, next) => {
    try {
        const allergen = await allergensModel.getById(req.params.id);
        if (!allergen) {
            return res.status(404).json({
                success: false,
                message: 'Allergen not found'
            });
        }
        res.json({
            success: true,
            data: allergen
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
