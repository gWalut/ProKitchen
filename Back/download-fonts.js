const https = require('https');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, 'fonts');

// URL для шрифтов DejaVu Sans
const fonts = [
    {
        name: 'DejaVuSans.ttf',
        url: 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans.ttf'
    },
    {
        name: 'DejaVuSans-Bold.ttf',
        url: 'https://github.com/dejavu-fonts/dejavu-fonts/raw/master/ttf/DejaVuSans-Bold.ttf'
    }
];

// Создаем директорию если её нет
if (!fs.existsSync(fontsDir)) {
    fs.mkdirSync(fontsDir, { recursive: true });
}

console.log('Загрузка шрифтов DejaVu Sans для поддержки кириллицы...');

fonts.forEach(font => {
    const filePath = path.join(fontsDir, font.name);

    if (fs.existsSync(filePath)) {
        console.log(`✓ ${font.name} уже существует`);
        return;
    }

    const file = fs.createWriteStream(filePath);

    https.get(font.url, (response) => {
        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log(`✓ ${font.name} загружен успешно`);
        });
    }).on('error', (err) => {
        fs.unlink(filePath, () => { });
        console.error(`✗ Ошибка загрузки ${font.name}:`, err.message);
    });
});

console.log('\nЖдем завершения загрузки...');
