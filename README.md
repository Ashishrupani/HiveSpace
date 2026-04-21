# 🐝 Hive Space

> A personalized study application designed to support both individual and collaborative learning — built with React Native and Node.js.

[![React Native](https://img.shields.io/badge/React%20Native-Expo-blue?logo=expo)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?logo=mongodb)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Deploy-Docker-blue?logo=docker)](https://www.docker.com/)

---

## 📖 Overview

Hive Space is a full-stack mobile application that brings peer collaboration, AI-powered studying, and productivity tools together in one place. Students can organize notes, set goals, track progress, form study groups, chat in real time, and generate AI-driven quizzes and summaries — all from their phone.

---

## ✨ Features

- 📝 **Local & Cloud Notes** — Store notes offline using SQLite; sync to MongoDB for cloud access
- 🤖 **AI Study Tools** — Generate quizzes, summaries, and study guides via Google Gemini API
- 👥 **Study Groups** — Create groups, share notes, and set group goals
- 💬 **Real-Time Chat** — WebSocket-powered group messaging
- 🏆 **Leaderboard** — Compete with friends and track study streaks
- 📊 **Progress Dashboard** — Track study time, sessions, and performance stats
- 🔐 **Authentication** — Secure token-based auth via Clerk (FERPA compliant)
- 🔔 **Notifications** — Get updates on group activity

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo) |
| Backend | Node.js, Express.js |
| Cloud Database | MongoDB |
| Local Database | SQLite |
| Authentication | Clerk |
| AI Features | Google Gemini API |
| Real-Time | WebSockets |
| CI/CD | GitHub Actions |
| Deployment | Docker, Render |

---

## 🚀 Getting Started

### ⚡ Quick Install (Android APK)

No setup required! The backend is already live and running.

1. Download the latest APK from the [Releases](../../releases) page
2. On your Android device, enable **Install from unknown sources** in Settings
3. Open the downloaded `.apk` file and install
4. Launch **Hive Space** — you're good to go!

> The backend is hosted at `https://hive-space-backend.onrender.com` and runs continuously — no local server needed.

---

### 🧑‍💻 Developer Setup

Only needed if you want to run or modify the source code locally.

#### Prerequisites

- Node.js v18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

---

#### Backend Setup

The live backend is already deployed on Render. If you want to run it locally:

```bash
cd backend
npm install
npm run dev
```

The local backend runs on `http://localhost:5000`. See the environment variables section below to configure it.

---

#### Mobile Setup

```bash
cd mobile
npm install

# Start the Expo dev server
npx expo start
```

Scan the QR code with **Expo Go** (iOS/Android) or run on an emulator.

> By default the mobile app points to the live backend at `https://hive-space-backend.onrender.com`.  
> To use a local backend instead, update `EXPO_PUBLIC_API_URL` in `mobile/.env`.

---

#### Running with Docker

```bash
docker build -t hive-space-backend ./backend
docker run -p 5000:5000 --env-file ./backend/.env hive-space-backend
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
CLIENT_URL=http://localhost:8081
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
MONGO_DB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

### Mobile (`mobile/.env`)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
EXPO_PUBLIC_API_URL=https://hive-space-backend.onrender.com
```

### Mobile Local Dev (`mobile/.env.local`)

```env
EXPO_PUBLIC_IP_ADDRESS=your_local_ip
EXPO_PUBLIC_BACKEND_PORT=5000
```

---

## 📱 Rebuilding the APK

The APK is already built and available in the repo (`mobile/apk-output/`). To build a new one:

```bash
cd mobile

# Install EAS CLI
npm install -g eas-cli

eas login
eas build --platform android --profile preview
```

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

---

## 📊 Performance

Average API response times measured during testing:

| Layer | Avg Response Time |
|---|---|
| API Processing | 650 ms |
| DB Query | 550 ms |
| Network | 100 ms |
| Auth | 60 ms |
| Cache | 40 ms |
| **Total** | **~1,400 ms** |

---

## 👨‍💻 Team

**001 — PANAMA-Hive** | UTA SW Senior Design

| Name | Role |
|---|---|
| Abraham Adami | Project Owner |
| Ashish Rupani | Scrum Master |
| Natalia Miranda | Developer |
| Prakriti Thapa | Developer |
| Mekdelawit Gebrewold | Developer |
| Aaron Gardner | Developer |

Faculty Advisor: **Dr. Chenxi Wang**

---

## 📄 License

See [LICENSE.txt](./LICENSE.txt) for details.
