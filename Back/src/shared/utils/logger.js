const fs = require('fs');
const path = require('path');
const { format } = require('util');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, '../../logs');
        this.errorLogPath = path.join(this.logDir, 'error.log');
        this.combinedLogPath = path.join(this.logDir, 'combined.log');

        // Создание директории для логов, если она не существует
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    _writeToFile(filePath, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `${timestamp} - ${message}\n`;

        fs.appendFile(filePath, logEntry, (err) => {
            if (err) {
                console.error('Ошибка записи в лог файл:', err);
            }
        });
    }

    _formatMessage(level, message, ...args) {
        const timestamp = new Date().toISOString();
        const formattedMessage = args.length ? format(message, ...args) : message;
        return `[${level}] ${timestamp} - ${formattedMessage}`;
    }

    info(message, ...args) {
        const formattedMessage = this._formatMessage('INFO', message, ...args);
        console.log(formattedMessage);
        this._writeToFile(this.combinedLogPath, formattedMessage);
    }

    error(message, ...args) {
        const formattedMessage = this._formatMessage('ERROR', message, ...args);
        console.error(formattedMessage);
        this._writeToFile(this.errorLogPath, formattedMessage);
        this._writeToFile(this.combinedLogPath, formattedMessage);
    }

    warn(message, ...args) {
        const formattedMessage = this._formatMessage('WARN', message, ...args);
        console.warn(formattedMessage);
        this._writeToFile(this.combinedLogPath, formattedMessage);
    }

    debug(message, ...args) {
        if (process.env.NODE_ENV === 'development') {
            const formattedMessage = this._formatMessage('DEBUG', message, ...args);
            console.debug(formattedMessage);
            this._writeToFile(this.combinedLogPath, formattedMessage);
        }
    }
}

// Создаем единственный экземпляр логгера
const logger = new Logger();

module.exports = logger;