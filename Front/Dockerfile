# Build stage
FROM node:22.20.0-alpine AS builder

WORKDIR /app

# �����㥬 package 䠩��
COPY package*.json ./

# ��⠭�������� ����ᨬ���
RUN npm ci

# �����㥬 ��室�� ���
COPY . .

# ����ࠥ� production build
RUN npm run build

# Production stage
FROM nginx:alpine

# �����㥬 ᮡ࠭�� 䠩��
COPY --from=builder /app/dist /usr/share/nginx/html

# �����㥬 ���䨣���� nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ���뢠�� ����
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -q --spider http://localhost:80 || exit 1

# ����� nginx
CMD ["nginx", "-g", "daemon off;"]
