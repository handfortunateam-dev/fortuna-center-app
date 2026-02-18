# 🎯 Fortuna Center - Broadcast Platform

> Platform broadcast minimalis dengan design premium untuk streaming YouTube content dengan real-time analytics.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?style=for-the-badge&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)

## ✨ Features

### 🎨 **Premium Design**
- Dark mode dengan glassmorphism effects
- Smooth animations menggunakan Framer Motion
- Responsive & mobile-first design
- Modern gradient accents dengan Fortuna gold theme

### 📊 **Admin Dashboard**
- Real-time statistics & analytics
- Interactive charts (Area, Pie, Bar)
- Session management
- Viewer engagement tracking
- Quick actions panel

### 🎥 **Broadcast System**
- YouTube video integration
- Live session indicators
- Viewer count tracking
- Session history & analytics

### 🛠️ **Tech Stack**
- **Framework**: Next.js 16 with App Router
- **UI Library**: HeroUI 2.8.5
- **Styling**: Tailwind CSS 4
- **Icons**: Iconify/React (Solar icon set)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Database**: Drizzle ORM

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ atau Bun
- npm atau bun package manager

### Installation

```bash
# Clone repository
git clone <repository-url>
cd broadcast-fortuna-center-app

# Install dependencies
npm install
# atau
bun install

# Run development server
npm run dev
# atau
bun dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📁 Project Structure

```
app/
├── page.tsx              # 🏠 Landing page (public)
├── admin/                # 👨‍💼 Admin panel
│   ├── page.tsx          # Dashboard
│   ├── sessions/         # Session management
│   ├── analytics/        # Analytics & charts
│   └── settings/         # System settings
└── live/[sessionId]/     # 📺 Live broadcast viewer

features/
└── admin/components/     # 🧩 Admin-specific components

@components/              # 🌐 Global reusable components
```

Lihat [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) untuk detail lengkap.

## 🎯 Pages Overview

### Public Pages

#### **Landing Page** (`/`)
- Hero section dengan call-to-action
- Features showcase
- Modern design dengan gradient effects

### Admin Pages

#### **Dashboard** (`/admin`)
- 📈 Real-time statistics
- 📊 Viewer trends chart
- ⚡ Quick actions
- 📝 Recent sessions

#### **Sessions** (`/admin/sessions`)
- 🔍 Search & filter
- 📺 Session list dengan thumbnails
- 📊 Session statistics
- 🗑️ Session management

#### **Analytics** (`/admin/analytics`)
- 📈 Performance metrics
- 📊 Multiple chart types
- 🏆 Top performing sessions
- ⏰ Hourly distribution

#### **Settings** (`/admin/settings`)
- ⚙️ General configuration
- 🎥 Broadcast settings
- 🔔 Notifications
- ⚠️ Danger zone

## 🎨 Design System

### Colors
- **Primary**: `#fbbf24` (Amber - Fortuna gold)
- **Background**: `#0a0a0a` (Dark)
- **Foreground**: `#ededed` (Light)

### Components
- Glassmorphism panels
- Smooth hover effects
- Micro-animations
- Responsive layouts

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Database
npm run db:push      # Push schema to database

# Linting
npm run lint         # Run ESLint
```

### Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=your_database_url

# Add other environment variables as needed
```

## 📦 Dependencies

### Core
- `next` - React framework
- `react` & `react-dom` - UI library
- `typescript` - Type safety

### UI & Styling
- `@heroui/react` - UI components
- `tailwindcss` - Utility-first CSS
- `framer-motion` - Animations
- `@iconify/react` - Icon library

### Data & Charts
- `recharts` - Chart library
- `drizzle-orm` - Database ORM
- `axios` - HTTP client

### Utilities
- `clsx` - Conditional classnames
- `date-fns` - Date manipulation

## 🎯 Roadmap

- [ ] Authentication & authorization
- [ ] Real-time WebSocket integration
- [ ] YouTube API integration
- [ ] User management system
- [ ] Advanced analytics
- [ ] Export reports functionality
- [ ] Multi-language support
- [ ] Dark/Light theme toggle

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or support, please contact [your-email@example.com]

---

**Made with ❤️ using Next.js, Tailwind CSS, and HeroUI**
