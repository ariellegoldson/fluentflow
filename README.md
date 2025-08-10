# FluentFlow - School SLP Management System

A production-ready web application for school Speech-Language Pathologists to manage sessions, track student progress, and generate reports.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or cloud via Supabase/Neon)
- Git

### Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/ariellegoldson/fluentflow.git
cd fluentflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` and add your database connection string:
- For local PostgreSQL: `postgresql://username:password@localhost:5432/fluentflow`
- For Supabase: Use the connection string from your Supabase project settings
- For Neon: Use the connection string from your Neon project settings

4. **Generate NextAuth secret**
```bash
openssl rand -base64 32
```
Add this to your `.env` as `NEXTAUTH_SECRET`

5. **Set up the database**
```bash
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

6. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials
- Email: `slp@fluentflow.com`
- Password: `password123`

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js
- **State Management**: TanStack Query
- **Forms**: react-hook-form + zod
- **Calendar**: FullCalendar
- **Charts**: Recharts
- **Animations**: Framer Motion + Three.js

## 📁 Project Structure

```
fluentflow/
├── app/                    # Next.js app directory
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes
│   └── login/             # Authentication page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                   # Utility functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts          # Seed data
└── public/              # Static assets
```

## 🎯 Features

### ✅ Implemented
- ✅ Authentication system with NextAuth
- ✅ Database schema with Prisma
- ✅ Comprehensive seed data (100+ goals, 5 students, 3 teachers)
- ✅ Dashboard with KPIs and quick actions
- ✅ Responsive layout with navigation
- ✅ Brand theming with FluentFlow pink palette

### 🚧 In Progress
- 📋 Student CRUD operations
- 📋 Teacher & Classroom management
- 📋 Goal Bank with search
- 📋 Visual Schedule with drag-and-drop
- 📋 Session Sheet & note generator
- 📋 Progress Reports with charts
- 📋 Three.js header animation

## 🎨 Design System

### Colors
- Brand Pink: `#f5bcd6`
- Brand Pink Dark: `#eaa8c6`
- Brand Pink Light: `#fde5f1`
- Text: `#3a3a3a`
- Gray scale for UI elements

### Components
- All components use `rounded-2xl` for consistency
- Soft shadows throughout
- Monochrome pink theme
- Accessible color contrast ratios

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL` (from Supabase/Neon)
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)
4. Deploy!

### Deploy to other platforms

The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- AWS Amplify
- Netlify

## 📝 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Prisma commands
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database
```

## 🔒 Security

- Passwords are hashed with bcrypt
- Authentication via JWT tokens
- Protected routes with middleware
- Environment variables for sensitive data
- CSRF protection built into NextAuth

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🐛 Known Issues

- Tailwind v4 compatibility with shadcn/ui CLI (manual component setup required)
- FullCalendar CSS may need additional configuration for optimal mobile view

## 📧 Support

For issues or questions, please open an issue on [GitHub](https://github.com/ariellegoldson/fluentflow/issues).