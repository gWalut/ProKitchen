module.exports = {
    // Корневая директория
    rootDir: '.',

    // Шаблоны для поиска тестовых файлов
    testMatch: [
        '<rootDir>/tests/**/*.test.js'
    ],

    // Игнорируемые пути
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/'
    ],

    // Окружение
    testEnvironment: 'node',

    // Настройка покрытия кода
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/tests/'
    ],

    // Файлы настройки окружения
    setupFiles: ['<rootDir>/tests/setup.js'],

    // Тайм-аут для тестов
    testTimeout: 10000,

    // Вывод подробной информации в консоль
    verbose: true
};