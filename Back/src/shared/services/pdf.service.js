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
                const doc = new PDFDocument({ size: [283.46, 396.85], bufferPages: true,
                    margins: { top: 25, bottom: 42, left: 20, right: 20 } });
                const chunks = [];
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);
                if (fontsExist) {
                    doc.registerFont('DejaVu', fontPath);
                    doc.registerFont('DejaVuBold', fontBoldPath);
                }
                const normal = fontsExist ? 'DejaVu' : 'Helvetica';
                const bold = fontsExist ? 'DejaVuBold' : 'Helvetica-Bold';
                const width = doc.page.width - 40;
                const decoratePage = () => {
                    const { x, y } = doc;
                    // Footer lies outside the flowing content area. Explicit
                    // height prevents PDFKit from adding a page for the footer.
                    doc.save();
                    doc.rect(10, 10, doc.page.width - 20, doc.page.height - 20).stroke();
                    doc.rect(12, 12, doc.page.width - 24, doc.page.height - 24).stroke();
                    doc.font(normal).fontSize(8).fillColor('#999999')
                        .text('ProKitchen - Помощник повара', 20, doc.page.height - 32,
                            { width, height: 14, lineBreak: false, align: 'center' });
                    doc.restore();
                    doc.x = x;
                    doc.y = y;
                };

                const ensureSpace = height => {
                    if (doc.y + height > doc.page.height - doc.page.margins.bottom) doc.addPage();
                };
                const rule = () => {
                    ensureSpace(45);
                    const y = doc.y + 8;
                    doc.moveTo(20, y).lineTo(doc.page.width - 20, y).stroke();
                    doc.y = y + 10;
                    doc.x = 20;
                };
                const heading = text => {
                    ensureSpace(45);
                    doc.font(bold).fontSize(11).fillColor('#000000').text(text, { width });
                    doc.moveDown(0.5);
                    doc.font(normal).fontSize(10).fillColor('#333333');
                };

                doc.font(bold).fontSize(16).fillColor('#000000')
                    .text(label.dishName.toUpperCase(), { width, align: 'center' });
                rule();
                heading('ИНФОРМАЦИЯ О ПРОДУКТЕ');
                doc.text(`Общий вес: ${label.weight} г`, { width });
                doc.text(`Порций: ${label.portions} шт`, { width });
                if (label.portionWeight > 0) doc.text(`Вес порции: ${label.portionWeight} г`, { width });
                if (label.ingredients && label.ingredients.length > 0) {
                    rule();
                    heading('СОСТАВ');
                    for (const ingredient of label.ingredients) {
                        // PDFKit wraps names and flows long recipes onto the
                        // following page, reserving space for its border/footer.
                        doc.font(normal).fontSize(10).fillColor('#333333')
                            .text(`• ${ingredient.name}`, { width, paragraphGap: 3 });
                    }
                }
                rule();
                heading('УСЛОВИЯ ХРАНЕНИЯ');
                doc.text(label.storageConditions || 'Хранить при температуре 2-6°C', { width });
                rule();
                doc.font(normal).fontSize(10).fillColor('#000000')
                    .text(`Дата изготовления: ${this.formatDate(label.prepDate)}`, { width });
                doc.moveDown(0.5);
                doc.fillColor('#d32f2f').text(`Годен до: ${this.formatDate(label.expiryDate)}`, { width });
                const pages = doc.bufferedPageRange();
                for (let index = pages.start; index < pages.start + pages.count; index++) {
                    doc.switchToPage(index);
                    decoratePage();
                }
                doc.end();
            } catch (error) {
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