class CalcService {
    /**
     * Расчет стоимости блюда с учетом количества порций
     * @param {Object} dish - Блюдо с ингредиентами
     * @param {number} requestedPortions - Запрашиваемое количество порций
     * @returns {Object} Результат расчета
     */
    calculateCost(dish, requestedPortions) {
        const scaleFactor = requestedPortions / dish.portion_size;

        let totalCost = 0;
        const breakdown = [];

        for (const ingredient of dish.ingredients) {
            const quantity = ingredient.quantity * scaleFactor;
            const cost = quantity * ingredient.price_per_unit;

            totalCost += cost;

            breakdown.push({
                ingredientId: ingredient.id,
                name: ingredient.name,
                quantity: quantity,
                unit: ingredient.unit,
                pricePerUnit: ingredient.price_per_unit,
                totalCost: cost
            });
        }

        totalCost = Math.round(totalCost * 100) / 100;
        const costPerPortion = Math.round((totalCost / requestedPortions) * 100) / 100;

        return {
            totalCost,
            costPerPortion,
            requestedPortions,
            breakdown
        };
    }

    /**
     * Конвертация единиц измерения
     * @param {number} value - Значение для конвертации
     * @param {string} fromUnit - Исходная единица измерения
     * @param {string} toUnit - Целевая единица измерения
     * @returns {number} Конвертированное значение
     */
    convertUnits(value, fromUnit, toUnit) {
        // Базовые коэффициенты конвертации
        const conversions = {
            // Вес
            'г': 1,
            'кг': 1000,
            // Объем
            'мл': 1,
            'л': 1000,
            // Штуки
            'шт': 1,
            'уп': 1
        };

        // Группы совместимых единиц измерения
        const unitGroups = {
            weight: ['г', 'кг'],
            volume: ['мл', 'л'],
            pieces: ['шт', 'уп']
        };

        const getUnitGroup = (unit) => {
            for (const [group, units] of Object.entries(unitGroups)) {
                if (units.includes(unit)) return group;
            }
            return null;
        };

        const fromGroup = getUnitGroup(fromUnit);
        const toGroup = getUnitGroup(toUnit);

        if (!fromGroup || !toGroup || fromGroup !== toGroup) {
            throw new Error(`Несовместимые единицы измерения: ${fromUnit} -> ${toUnit}`);
        }

        return (value * conversions[fromUnit]) / conversions[toUnit];
    }


    calculateHistoricalCost(dish, requestedPortions, date) {
        return this.calculateCost(dish, requestedPortions);
    }
}

module.exports = new CalcService();