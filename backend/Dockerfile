FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app
ENV PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
COPY package*.json ./
RUN npm install --include=dev
COPY prisma ./prisma/
RUN npx prisma generate
COPY . .
RUN npx nest build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=builder /app/package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
RUN mkdir -p /app/uploads
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
