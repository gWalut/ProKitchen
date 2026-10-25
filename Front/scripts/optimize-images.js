const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');

const ASSETS_DIR = './src/assets';
const OUTPUT_DIR = './public/images';

async function optimizeImages() {
    try {
        // Создаем выходную директорию, если её нет
        await fs.mkdir(OUTPUT_DIR, { recursive: true });

        // Получаем список файлов
        const files = await fs.readdir(ASSETS_DIR);

        for (const file of files) {
            if (file.match(/\.(jpg|jpeg|png)$/i)) {
                const inputPath = path.join(ASSETS_DIR, file);
                const filename = path.parse(file).name;

                // Создаем WebP версию
                await sharp(inputPath)
                    .webp({ quality: 80 })
                    .toFile(path.join(OUTPUT_DIR, `${filename}.webp`));

                // Оптимизируем оригинальное изображение
                await sharp(inputPath)
                    .jpeg({ quality: 80, progressive: true })
                    .toFile(path.join(OUTPUT_DIR, `${filename}.jpg`));

                console.log(`Optimized: ${file}`);
            }
        }

        console.log('Image optimization completed!');
    } catch (error) {
        console.error('Error optimizing images:', error);
        process.exit(1);
    }
}

optimizeImages();