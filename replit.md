# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 + Socket.io
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (jsonwebtoken) + bcrypt (bcryptjs)
- **Validation**: Zod (`zod/v4`)
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (MongoDB, Socket.io, JWT auth)
│   └── nutterx/            # Nutterx Technologies frontend (React + Vite)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # (unused - MongoDB used instead)
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## Nutterx Technologies App

### Features
- **Public Landing Page** — Hero, services showcase (fetched from API), features, CTA
- **Authentication** — JWT-based login/register, token stored in localStorage
- **User Dashboard** — Service request form, request tracking with status, 30-day countdown
- **Real-time Chat** — Socket.io powered WhatsApp-like interface, direct + group chats
- **Admin Dashboard** — Accessible via `/admin` or `?admin=true`, manage users/requests/chats/subscriptions
- **Service Management** — Admin creates/manages services, updates request status
- **30-day Countdown** — Automatically starts when admin marks service as completed

### Default Admin Account
- Email: `admin@nutterx.com`
- Password: `admin123456`

### Services Seeded
6 default services: WhatsApp Bot Setup, Social Media Management, Website Development, SEO Optimization, Telegram Bot Development, E-commerce Setup

## API Architecture

### Routes (all at `/api`)
- `POST /api/auth/register` — Register user
- `POST /api/auth/login` — Login (returns JWT)
- `GET /api/auth/me` — Get current user (JWT required)
- `GET /api/services` — Public service catalog
- `POST /api/requests` — Submit service request (auth)
- `GET /api/requests` — Get user's requests (auth)
- `GET /api/chats` — Get user's chats (auth)
- `POST /api/chats/group` — Create group chat (admin)
- `POST /api/chats/direct/:userId` — Start direct chat (auth)
- `GET /api/chats/:chatId/messages` — Get messages (auth)
- `POST /api/chats/:chatId/messages` — Send message (auth)
- `GET /api/admin/users` — All users (admin)
- `GET /api/admin/requests` — All requests (admin)
- `PUT /api/admin/requests/:id` — Update request status (admin)
- `GET /api/admin/subscriptions` — Active subscriptions (admin)

### Socket.io Events
Path: `/api/socket.io`
- Client emits: `join_chat`, `leave_chat`, `send_message`, `typing`, `stop_typing`
- Server emits: `new_message`, `user_online`, `user_offline`, `chat_updated`, `user_typing`

## Environment Variables
- `MONGODB_URI` — MongoDB connection string (secret)
- `JWT_SECRET` — JWT signing key (shared env var)
- `PORT` — Auto-assigned by Replit

## MongoDB Models
- `User` — name, email, password (hashed), role (user/admin)
- `Service` — title, description, price, features[], icon, category, popular
- `ServiceRequest` — user, serviceName, description, status, completedAt, subscriptionEndsAt
- `Chat` — type (direct/group), name, participants[], lastMessage
- `Message` — chatId, sender, content, read

## Packages (api-server)
- `mongoose` — MongoDB ORM
- `jsonwebtoken` — JWT auth
- `bcryptjs` — Password hashing
- `socket.io` — Real-time chat
- `express` v5 — HTTP server
- `pino` / `pino-http` — Logging

## Packages (nutterx frontend)
- `react` + `vite` — Frontend framework
- `tailwindcss` — Styling
- `framer-motion` — Animations
- `socket.io-client` — Real-time chat
- `zustand` — Auth state management
- `@tanstack/react-query` — Data fetching
- `react-hook-form` — Form handling
- `date-fns` — Date formatting
- `wouter` — Routing
- `lucide-react` — Icons
