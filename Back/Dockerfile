# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package файлы
COPY package*.json download-fonts.js ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Устанавливаем wget для healthcheck
RUN apk add --no-cache wget

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Копируем зависимости из builder
COPY --from=builder /app/node_modules ./node_modules

# Копируем исходный код
COPY --chown=nodejs:nodejs . .

# Создаем необходимые директории
RUN mkdir -p /app/logs /app/data && \
    chown -R nodejs:nodejs /app/logs /app/data

# Переключаемся на непривилегированного пользователя
USER nodejs

# Открываем порт
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Запуск приложения
CMD ["node", "src/app.js"]
