const calcService = require('../src/shared/services/calc.service');

describe('CalcService', () => {
    describe('calculateCost', () => {
        it('должен правильно рассчитать стоимость для одной порции', () => {
            const dish = {
                portion_size: 1,
                ingredients: [
                    {
                        id: 1,
                        name: 'Мука',
                        quantity: 200,
                        unit: 'г',
                        price_per_unit: 0.5
                    },
                    {
                        id: 2,
                        name: 'Яйца',
                        quantity: 2,
                        unit: 'шт',
                        price_per_unit: 10
                    }
                ]
            };

            const result = calcService.calculateCost(dish, 1);

            expect(result.totalCost).toBe(120); // 200г * 0.5₽ + 2шт * 10₽
            expect(result.costPerPortion).toBe(120);
            expect(result.breakdown).toHaveLength(2);
            expect(result.breakdown[0].totalCost).toBe(100); // Мука
            expect(result.breakdown[1].totalCost).toBe(20); // Яйца
        });

        it('должен правильно масштабировать стоимость для нескольких порций', () => {
            const dish = {
                portion_size: 2,
                ingredients: [
                    {
                        id: 1,
                        name: 'Мука',
                        quantity: 400,
                        unit: 'г',
                        price_per_unit: 0.1
                    }
                ]
            };

            const result = calcService.calculateCost(dish, 4);

            expect(result.totalCost).toBe(80); // (400г * 0.1₽) * (4/2)
            expect(result.costPerPortion).toBe(20); // 80₽ / 4 порции
            expect(result.breakdown[0].quantity).toBe(800); // 400г * (4/2)
        });
    });

    describe('convertUnits', () => {
        it('должен конвертировать граммы в килограммы', () => {
            const result = calcService.convertUnits(1000, 'г', 'кг');
            expect(result).toBe(1);
        });

        it('должен конвертировать килограммы в граммы', () => {
            const result = calcService.convertUnits(1.5, 'кг', 'г');
            expect(result).toBe(1500);
        });

        it('должен конвертировать миллилитры в литры', () => {
            const result = calcService.convertUnits(2000, 'мл', 'л');
            expect(result).toBe(2);
        });

        it('должен выбросить ошибку при несовместимых единицах', () => {
            expect(() => {
                calcService.convertUnits(1, 'кг', 'л');
            }).toThrow('Несовместимые единицы измерения');
        });
    });

    describe('сложные сценарии', () => {
        it('должен правильно рассчитать стоимость блюда с разными единицами измерения', () => {
            const dish = {
                portion_size: 1,
                ingredients: [
                    {
                        id: 1,
                        name: 'Мука',
                        quantity: 300,
                        unit: 'г',
                        price_per_unit: 0.1
                    },
                    {
                        id: 2,
                        name: 'Молоко',
                        quantity: 500,
                        unit: 'мл',
                        price_per_unit: 0.08
                    },
                    {
                        id: 3,
                        name: 'Яйца',
                        quantity: 3,
                        unit: 'шт',
                        price_per_unit: 10
                    }
                ]
            };

            const result = calcService.calculateCost(dish, 2);

            expect(result.totalCost).toBe(200); // (300 * 0.1 + 500 * 0.08 + 3 * 10) * 2 = (30 + 40 + 30) * 2
            expect(result.costPerPortion).toBe(100);
            expect(result.breakdown).toHaveLength(3);
        });
    });
});