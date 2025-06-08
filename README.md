# 📚 Prepilot - AI-Powered Exam Preparation Platform

> Your intelligent companion for acing exams with confidence

Prepilot is a comprehensive exam preparation platform that helps students study smarter, not harder. Built with AI-powered features, personalized study plans, and interactive learning tools designed to maximize exam success.

## ✨ Features

### 🎯 Core Features
- **AI-Generated Study Plans** - Personalized schedules that adapt to your exam dates and learning pace
- **Practice Tests & Mock Exams** - Realistic exam simulations with detailed explanations and scoring
- **Interactive Flashcards** - Smart spaced repetition system to maximize retention and recall
- **Progress Tracking** - Advanced analytics and performance insights
- **Expert Study Tips** - Proven exam strategies and learning methodologies

### 🔐 Authentication & User Management
- **Secure Authentication** - Powered by Clerk for seamless sign-up/sign-in
- **User Profiles** - Track progress across multiple subjects and exams
- **Cross-Device Sync** - Access your study materials anywhere

### 🛡️ Production Safety
- **Environment Protection** - Production deployment shows demo page until MVP completion
- **Automatic Migrations** - Database schema updates handled automatically
- **Webhook Integration** - Real-time user synchronization with secure verification

## 🏗️ Architecture

### Frontend (Web App)
- **Framework**: React + TypeScript
- **Router**: TanStack Router
- **Styling**: Tailwind CSS
- **UI Components**: Custom design system
- **Authentication**: Clerk React SDK
- **Build Tool**: Vite

### Backend (API)
- **Language**: Go 1.24
- **Framework**: Chi Router
- **Database**: PostgreSQL
- **ORM**: SQLC (SQL generation)
- **Migrations**: Custom Go-based migration system
- **Authentication**: Clerk webhooks

### Infrastructure
- **Deployment**: Railway
- **Database**: Railway PostgreSQL
- **Environment**: Production & Development modes
- **CI/CD**: Automatic deployments

## 🚀 Quick Start

### Prerequisites
- Go 1.24+
- Node.js 18+
- PostgreSQL
- Railway CLI (for deployment)

### Local Development

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/prepilot.git
cd prepilot
```

#### 2. Setup Backend
```bash
# Install dependencies
go mod download

# Setup environment variables
cp .env.example .env
# Edit .env with your database and Clerk credentials

# Run migrations
make migrate-up

# Start backend server
go run ./cmd/api
```

#### 3. Setup Frontend
```bash
cd web

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Add your Clerk publishable key

# Start development server
npm run dev
```

#### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/v1/health

## 📁 Project Structure

```
prepilot/
├── cmd/api/                    # Application entry point
│   ├── main.go                # Server initialization
│   └── api.go                 # HTTP server setup
├── internal/
│   ├── app/                   # Application layer
│   │   ├── app.go            # App configuration
│   │   ├── routes.go         # Route definitions
│   │   ├── webhook.handler.go # Clerk webhook handling
│   │   ├── auth.handler.go   # Authentication endpoints
│   │   └── debug.handler.go  # Debug utilities
│   ├── db/                   # Database layer
│   │   ├── db.go            # Connection management
│   │   ├── migrate.go       # Migration system
│   │   ├── migrations/      # SQL migration files
│   │   └── queries/         # SQLC query definitions
│   ├── store/               # Generated SQLC code
│   └── env/                 # Environment utilities
├── web/                     # Frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── routes/         # Route components
│   │   ├── lib/           # Utilities & configuration
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── scripts/               # Deployment scripts
├── Dockerfile            # Container configuration
├── docker-compose.yml    # Local development
└── Makefile             # Common commands
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/prepilot?sslmode=disable

# Server
PORT=8080
ENV=development

# Clerk Integration
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

#### Frontend (.env.local)
```bash
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# API Configuration
VITE_API_URL=http://localhost:8080
VITE_ENVIRONMENT=development
```

### Clerk Webhook Setup

1. **Go to Clerk Dashboard** → Webhooks
2. **Add Endpoint**: `https://your-backend.railway.app/v1/webhooks/clerk`
3. **Select Events**: `user.created`, `user.updated`, `user.deleted`, `session.created`
4. **Copy Webhook Secret** to `CLERK_WEBHOOK_SECRET` environment variable

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    name TEXT,
    image_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    last_sign_in_at TIMESTAMP,
    banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Planned Tables
- `study_plans` - Personalized study schedules
- `flashcards` - Interactive learning cards
- `practice_tests` - Mock exams and quizzes
- `user_progress` - Learning analytics
- `subjects` - Subject categorization

## 🚀 Deployment

### Railway Deployment

#### Backend
```bash
# Railway automatically deploys from main branch
# Ensure environment variables are set in Railway dashboard:
# - DATABASE_URL (auto-configured)
# - CLERK_WEBHOOK_SECRET
# - ENV=production
```

#### Frontend (Optional separate deployment)
```bash
# Build for production
cd web
npm run build

# Deploy to your preferred platform (Vercel, Netlify, etc.)
```

### Docker Deployment
```bash
# Build and run with Docker
docker build -t prepilot-api .
docker run -p 8080:8080 \
  -e DATABASE_URL="your_db_url" \
  -e CLERK_WEBHOOK_SECRET="your_secret" \
  prepilot-api
```

## 🧪 Testing & Debugging

### Debug Endpoints
```bash
# Check database connection
curl https://your-backend.railway.app/v1/debug/db

# List all users
curl https://your-backend.railway.app/v1/debug/users

# Get specific user
curl https://your-backend.railway.app/v1/debug/user/{clerkId}

# Check webhook configuration
curl https://your-backend.railway.app/v1/debug/webhook-config
```

### Manual User Sync (Development)
```bash
# Manually create user for testing
curl -X POST https://your-backend.railway.app/v1/dev/sync-user \
  -H "Content-Type: application/json" \
  -d '{
    "clerk_id": "user_test123",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "email_verified": true
  }'
```

## 📊 Available Commands

### Backend
```bash
go run ./cmd/api              # Start development server
go build -o bin/api ./cmd/api # Build binary
make migrate-up               # Run database migrations
make migrate-down             # Rollback migrations
make test                     # Run tests
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🛡️ Security Features

- **Production Mode Protection** - Demo page shown until MVP completion
- **Webhook Signature Verification** - Secure Clerk integration
- **Environment-based Configuration** - Separate dev/prod settings
- **SQL Injection Prevention** - Parameterized queries via SQLC
- **CORS Configuration** - Secure cross-origin requests

## 🎯 Roadmap

### Phase 1: MVP (Current)
- [x] User authentication and management
- [x] Database schema and migrations
- [x] Webhook integration
- [x] Production deployment setup
- [ ] Basic study plan creation
- [ ] Simple flashcard system

### Phase 2: Core Features
- [ ] AI-powered study plan generation
- [ ] Practice test creation and taking
- [ ] Spaced repetition algorithm
- [ ] Progress tracking and analytics

### Phase 3: Advanced Features
- [ ] Collaborative study groups
- [ ] Expert content and tips
- [ ] Mobile app (React Native)
- [ ] AI tutoring assistant

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Development Guidelines
- Follow Go conventions for backend code
- Use TypeScript for all frontend code
- Write tests for new features
- Update documentation for API changes
- Ensure migrations are reversible

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: hello@prepilot.com
- **Documentation**: [docs.prepilot.com](https://docs.prepilot.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/prepilot/issues)

## 🙏 Acknowledgments

- **Clerk** - Authentication infrastructure
- **Railway** - Deployment platform
- **TanStack** - Router and state management
- **Tailwind CSS** - Styling framework

---

**Built with ❤️ for students who want to excel in their exams**

*Prepilot - Because success is a journey, not a destination* 🎓