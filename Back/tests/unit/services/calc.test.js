const calcService = require('../../../src/shared/services/calc.service');

describe('calc.service (Unit)', () => {
    it('should correctly calculate cost', () => {
        const dish = {
            portion_size: 1,
            ingredients: [
                { id: 1, name: 'Potato', quantity: 200, unit: 'g', price_per_unit: 0.1 }
            ]
        };
        const result = calcService.calculateCost(dish, 2);
        expect(result).toBeDefined();
        expect(result.totalCost).toBeCloseTo(40);
    });

    it('should throw or handle invalid inputs gracefully', () => {
        expect(() => {
            calcService.calculateCost(null, 0);
        }).toThrow();
    });
});
