# ✍️ Inkwell — Full-Stack Blog Platform

<div align="center">

### 🌐 [Live Demo → blog-platform-z8xo.vercel.app](https://blog-platform-z8xo.vercel.app/)

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-brightgreen?style=for-the-badge&logo=vercel)](https://blog-platform-z8xo.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Siraut12321/Blog-Platform)

</div>

---

A production-ready blogging platform built with **Next.js 15**, **Express**, **MongoDB**, and **TypeScript**. Features a rich text editor, image uploads via Cloudinary, JWT authentication, and a clean responsive UI.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-8-green?logo=mongodb)
![Express](https://img.shields.io/badge/Express-4-lightgrey?logo=express)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)

---

## ✨ Features

- 🔐 **Authentication** — JWT-based register/login, role-based access (Author / Reader)
- 📝 **Blog Posts** — Create, edit, delete posts with draft/publish workflow
- 🖊️ **Rich Text Editor** — TipTap editor with bold, italic, headings, lists, blockquotes, code, links, and image embeds
- 🖼️ **Image Uploads** — Cover images and inline images via Cloudinary
- 💬 **Engagement** — Like, bookmark, and nested comment threads
- 🔍 **Search & Filter** — Full-text search by title, filter by tags, pagination
- 🔥 **Trending** — Posts ranked by views in the last 7 days
- 🎨 **UI/UX** — Dark/light mode, skeleton loaders, toast notifications, fully responsive

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| 🖥️ Frontend | Next.js 15 (App Router) + TypeScript |
| 🎨 Styling | Tailwind CSS v4 + Radix UI |
| 🖊️ Rich Text | TipTap |
| ⚙️ Backend | Node.js + Express + TypeScript |
| 🗄️ Database | MongoDB + Mongoose |
| 🔑 Auth | JWT + bcryptjs |
| ☁️ Image Storage | Cloudinary |

---

## 📁 Project Structure

```
blog-platform/
├── client/                  # Next.js frontend
│   └── src/
│       ├── app/             # App Router pages
│       │   ├── blog/        # Public blog listing & post pages
│       │   ├── dashboard/   # Author dashboard (create/edit/posts)
│       │   ├── bookmarks/   # Saved posts
│       │   └── search/      # Search page
│       ├── components/
│       │   ├── blog/        # PostCard, PostEditor, CommentSection
│       │   ├── editor/      # TipTap RichTextEditor
│       │   ├── layout/      # Navbar, Footer
│       │   └── ui/          # Button, Input, Toast, Avatar, Badge...
│       ├── lib/             # Axios API client, Auth context, utils
│       └── types/           # Shared TypeScript interfaces
└── server/                  # Express backend
    └── src/
        ├── controllers/     # Auth, Post, Comment, User logic
        ├── routes/          # Express route definitions
        ├── models/          # Mongoose schemas (User, Post, Comment)
        ├── middleware/       # JWT auth middleware
        └── utils/           # Cloudinary config, DB connection, response helpers
```

---

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- [Cloudinary](https://cloudinary.com) account (free tier works)

### 1. 📥 Clone the repository

```bash
git clone https://github.com/Siraut12321/Blog-Platform.git
cd Blog-Platform
```

### 2. ⚙️ Setup the Server

```bash
cd server
cp .env.example .env
```

Fill in `server/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inkwell
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:3000
```

```bash
npm install
npm run dev
```

### 3. 🖥️ Setup the Client

```bash
cd ../client
npm install
npm run dev
```

The client already has `.env.local` configured to point to `http://localhost:5000/api`.

### 4. 🌐 Open in browser

| Service | URL |
|---|---|
| 🖥️ Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:5000/api |

---

## 📡 API Reference

### 🔐 Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Login and receive JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PATCH | `/api/auth/profile` | ✅ | Update profile |

### 📝 Posts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/posts` | — | List published posts (search, tag, paginate) |
| GET | `/api/posts/trending` | — | Top 5 trending posts (last 7 days) |
| GET | `/api/posts/:slug` | — | Single post (increments views) |
| POST | `/api/posts` | ✅ Author | Create post |
| PATCH | `/api/posts/:id` | ✅ Author | Update post |
| DELETE | `/api/posts/:id` | ✅ Author | Delete post |
| POST | `/api/posts/:id/like` | ✅ | Toggle like |
| POST | `/api/posts/:id/bookmark` | ✅ | Toggle bookmark |
| GET | `/api/posts/my-posts` | ✅ Author | Author's own posts |
| GET | `/api/posts/bookmarks` | ✅ | User's bookmarked posts |
| POST | `/api/posts/upload-image` | ✅ Author | Upload image to Cloudinary |

### 💬 Comments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/comments/:postId` | — | Get comments with replies |
| POST | `/api/comments/:postId` | ✅ | Add comment or reply |
| DELETE | `/api/comments/:id` | ✅ | Delete own comment |

---

## 🔒 Environment Variables

### Server — `server/.env`

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL for CORS |

### Client — `client/.env.local`

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |

---

## 📜 Scripts

From the root directory:

```bash
npm run dev:server      # ⚙️  Start backend in dev mode
npm run dev:client      # 🖥️  Start frontend in dev mode
npm run install:all     # 📦  Install all dependencies
npm run build:server    # 🏗️  Build server
npm run build:client    # 🏗️  Build client
```

---

## 📄 License

MIT
