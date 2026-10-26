# Build stage
FROM node:22.20.0-alpine AS builder

WORKDIR /app

# �����㥬 package 䠩��
COPY package*.json download-fonts.js ./

# ��⠭�������� ����ᨬ���
RUN npm ci --only=production

# Production stage
FROM node:22.20.0-alpine

WORKDIR /app

# ��⠭�������� wget ��� healthcheck
RUN apk add --no-cache wget

# ������� ���짮��⥫� ��� ������᭮��
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# �����㥬 ����ᨬ��� �� builder
COPY --from=builder /app/node_modules ./node_modules

# �����㥬 ��室�� ���
COPY --chown=nodejs:nodejs . .

# ������� ����室��� ��४�ਨ
RUN mkdir -p /app/logs /app/data && \
    chown -R nodejs:nodejs /app/logs /app/data

# ��४��砥��� �� ���ਢ�����஢������ ���짮��⥫�
USER nodejs

# ���뢠�� ����
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# ����� �ਫ������
CMD ["node", "src/server.js"]
