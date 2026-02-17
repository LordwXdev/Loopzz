# Loopzz

Full-stack music and live streaming platform.

## Quick Start

```bash
cd amplify
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Features

- JWT Auth with bcrypt password hashing
- Role-based access (USER / ARTIST / ADMIN)
- Video and music track uploads (Multer)
- Live sessions with WebSocket chat
- WebRTC signaling for live streaming
- Tipping with anti-fraud (no self-tipping)
- Referral tracking (5% reward)
- AI engagement-scored feed
- Artist earnings dashboard
- Dark mode, responsive UI
- Rate limiting, CORS, input validation

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Zustand, Axios
- **Backend**: NestJS, TypeScript, Prisma ORM, PostgreSQL
- **Realtime**: Socket.IO
- **DevOps**: Docker, Docker Compose
