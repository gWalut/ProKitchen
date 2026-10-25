const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

class PdfService {
    /**
     * @param {Object} label - Данные для этикетки
     * @returns {Promise<Buffer>} Buffer с PDF документом
     */
    async generateLabel(label) {
        return new Promise((resolve, reject) => {
            try {
                const fontPath = path.join(__dirname, '../../../fonts/DejaVuSans.ttf');
                const fontBoldPath = path.join(__dirname, '../../../fonts/DejaVuSans-Bold.ttf');

                const fontsExist = fs.existsSync(fontPath) && fs.existsSync(fontBoldPath);

                const doc = new PDFDocument({
                    size: [283.46, 396.85],
                    margins: { top: 20, bottom: 20, left: 20, right: 20 }
                });

                if (fontsExist) {
                    doc.registerFont('DejaVu', fontPath);
                    doc.registerFont('DejaVuBold', fontBoldPath);
                    doc.font('DejaVu');
                } else {
                    console.warn('Шрифты DejaVu Sans не найдены, используется стандартный шрифт');
                }

                // Буфер для сохранения PDF
                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', error => reject(error));

                const pageWidth = 283.46;
                const margin = 20;
                const contentWidth = pageWidth - (margin * 2);

                // === ШАПКА ЭТИКЕТКИ ===
                doc.rect(10, 10, pageWidth - 20, 376.85).stroke();
                doc.rect(12, 12, pageWidth - 24, 372.85).stroke();

                if (fontsExist) doc.font('DejaVuBold');
                doc.fontSize(16)
                    .fillColor('#000000')
                    .text(label.dishName.toUpperCase(), margin, 25, {
                        width: contentWidth,
                        align: 'center'
                    });
                if (fontsExist) doc.font('DejaVu');

                doc.moveTo(margin + 20, 52)
                    .lineTo(pageWidth - margin - 20, 52)
                    .lineWidth(2)
                    .stroke();
                doc.lineWidth(1);

                let yPos = 65;

                // === ОСНОВНАЯ ИНФОРМАЦИЯ ===
                doc.fontSize(12)
                    .fillColor('#000000')
                    .text('ИНФОРМАЦИЯ О ПРОДУКТЕ', margin, yPos, { underline: true });
                yPos += 20;

                doc.fontSize(11)
                    .fillColor('#333333');

                doc.text(`Общий вес: ${label.weight} г`, margin + 5, yPos);
                yPos += 18;
                doc.text(`Порций: ${label.portions} шт`, margin + 5, yPos);
                yPos += 18;

                if (label.portionWeight > 0) {
                    doc.text(`Вес порции: ${label.portionWeight} г`, margin + 5, yPos);
                    yPos += 25;
                } else {
                    yPos += 10;
                }

                // === ИНГРЕДИЕНТЫ ===
                if (label.ingredients && label.ingredients.length > 0) {
                    doc.moveTo(margin, yPos)
                        .lineTo(pageWidth - margin, yPos)
                        .stroke();
                    yPos += 12;

                    doc.fontSize(12)
                        .fillColor('#000000')
                        .text('СОСТАВ', margin, yPos, { underline: true });
                    yPos += 20;

                    doc.fontSize(10)
                        .fillColor('#333333');

                    label.ingredients.forEach((ing) => {
                        doc.text(`• ${ing.name}`, margin + 5, yPos, {
                            width: contentWidth - 5
                        });
                        yPos += 15;
                    });
                    yPos += 8;
                }

                // === УСЛОВИЯ ХРАНЕНИЯ ===
                doc.moveTo(margin, yPos)
                    .lineTo(pageWidth - margin, yPos)
                    .stroke();
                yPos += 12;

                doc.fontSize(12)
                    .fillColor('#000000')
                    .text('УСЛОВИЯ ХРАНЕНИЯ', margin, yPos, { underline: true });
                yPos += 20;

                doc.fontSize(10)
                    .fillColor('#333333')
                    .text('Хранить при температуре 2-6°C', margin + 5, yPos, {
                        width: contentWidth - 5
                    });
                yPos += 30;

                // === ДАТЫ ===
                doc.moveTo(margin, yPos)
                    .lineTo(pageWidth - margin, yPos)
                    .stroke();
                yPos += 12;

                const prodDateFormatted = this.formatDate(label.prepDate);
                const expiryDateFormatted = this.formatDate(label.expiryDate);

                doc.fontSize(11)
                    .fillColor('#000000');

                doc.text(`Дата изготовления:`, margin, yPos);
                doc.fillColor('#333333')
                    .text(prodDateFormatted, margin + 120, yPos);
                yPos += 20;

                doc.fillColor('#000000')
                    .text(`Годен до:`, margin, yPos);
                doc.fillColor('#d32f2f')
                    .fontSize(12)
                    .text(expiryDateFormatted, margin + 120, yPos);

                doc.fontSize(8)
                    .fillColor('#999999')
                    .text('ProKitchen - Помощник повара', margin, 365, {
                        width: contentWidth,
                        align: 'center'
                    });

                doc.end();

            } catch (error) {
                console.error('Error generating PDF:', error);
                reject(error);
            }
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    /**
     * Генерация PDF-отчета по складу
     * @param {Object} inventory - Данные по складу
     * @returns {Promise<Buffer>} Buffer с PDF документом
     */
    async generateInventoryReport(inventory) {
        return new Promise((resolve, reject) => {
            try {
                const fontPath = path.join(__dirname, '../../../fonts/DejaVuSans.ttf');
                const fontBoldPath = path.join(__dirname, '../../../fonts/DejaVuSans-Bold.ttf');
                const fontsExist = fs.existsSync(fontPath) && fs.existsSync(fontBoldPath);

                const doc = new PDFDocument();
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));

                if (fontsExist) {
                    doc.registerFont('DejaVu', fontPath);
                    doc.registerFont('DejaVuBold', fontBoldPath);
                    doc.font('DejaVu');
                }

                if (fontsExist) doc.font('DejaVuBold');
                doc.fontSize(16)
                    .text('Отчет по складу', { align: 'center' });

                if (fontsExist) doc.font('DejaVu');
                doc.moveDown()
                    .fontSize(12);

                doc.text(`Дата отчета: ${new Date().toLocaleDateString('ru-RU')}`);
                doc.moveDown();

                const tableTop = 150;
                if (fontsExist) doc.font('DejaVuBold');

                doc.text('Наименование', 50, tableTop)
                    .text('Количество', 250, tableTop)
                    .text('Ед. изм.', 350, tableTop)
                    .text('Мин. запас', 450, tableTop);

                doc.moveDown();

                let yPosition = tableTop + 30;
                if (fontsExist) doc.font('DejaVu');

                inventory.items.forEach(item => {
                    doc.text(item.name, 50, yPosition)
                        .text(item.quantity.toString(), 250, yPosition)
                        .text(item.unit, 350, yPosition)
                        .text(item.minStock.toString(), 450, yPosition);

                    yPosition += 20;

                    if (yPosition > 700) {
                        doc.addPage();
                        yPosition = 50;
                    }
                });

                doc.end();

            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new PdfService();