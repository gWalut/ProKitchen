import { test, expect } from '@playwright/test';

test.describe('Основной флоу', () => {
    test('register → calc → favorite → print preview', async ({ page }) => {
        // Регистрация
        await page.goto('/register');
        await page.fill('[name="email"]', 'test@example.com');
        await page.fill('[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // Проверяем редирект на главную
        await expect(page).toHaveURL('/');

        // Переход к калькулятору
        await page.click('text=Калькулятор стоимости');

        // Заполнение формы калькулятора
        await page.fill('[placeholder="Поиск ингредиента"]', 'Мука');
        await page.click('text=Мука пшеничная');
        await page.fill('[name="quantity"]', '500');
        await page.click('button[aria-label="Добавить ингредиент"]');

        // Добавление в избранное
        await page.click('button[aria-label="Добавить в избранное"]');
        await expect(page.locator('text=Добавлено в избранное')).toBeVisible();

        // Предпросмотр печати
        await page.click('button[aria-label="Печать"]');
        const printPage = await page.waitForEvent('popup');
        await expect(printPage.locator('text=Калькуляция стоимости')).toBeVisible();
    });
});

// Добавляем тесты для проверки мобильной версии
test.describe('Мобильная версия', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('адаптивное отображение калькулятора', async ({ page }) => {
        await page.goto('/calc');

        // Проверяем что таблица прокручивается горизонтально
        const table = page.locator('table');
        expect(await table.evaluate((el) => el.scrollWidth > el.clientWidth)).toBeTruthy();

        // Проверяем что кнопки действий видны
        await expect(page.locator('button[aria-label="Добавить ингредиент"]')).toBeVisible();
        await expect(page.locator('button[aria-label="Печать"]')).toBeVisible();
    });
});