# ElysiaJS Backend Project

A modern, type-safe backend API built with ElysiaJS, PostgreSQL, and Drizzle ORM.

## Features

- **Runtime**: Bun for fast JavaScript runtime
- **Framework**: ElysiaJS with TypeScript for type safety
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with session management
- **Documentation**: Auto-generated Swagger/OpenAPI docs
- **Architecture**: Modular controller-service pattern
- **Validation**: Built-in request/response validation
- **Logging**: Structured logging middleware
- **CORS**: Configurable CORS support

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL database running
- Node.js 18+ (for development tools)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd elysia-backend
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials and secrets
```

4. Generate and run database migrations:
```bash
bun run db:generate
bun run db:migrate
```

5. Start the development server:
```bash
bun run dev
```

The API will be available at `http://localhost:3000` with documentation at `http://localhost:3000/swagger`.

## Project Structure

```
src/
├── index.ts                    # Main application entry point
├── routes/                     # Route definitions
│   ├── indexRoute.ts          # Central route exports
│   ├── authRoute/             # Authentication routes
│   ├── userRoute/             # User management routes
│   └── systemRoute/           # System health routes
└── app/
    ├── constants/             # Application constants
    ├── controllers/           # Business logic controllers
    │   ├── authControllers/
    │   └── userControllers/
    ├── models/               # Database models (Drizzle schemas)
    ├── middlewares/          # Custom middleware
    ├── utils/                # Utility functions and types
    └── db/                   # Database configuration
        ├── connection.ts     # Database connection
        ├── schema.ts         # Drizzle schema definitions
        └── migrations/       # Database migrations
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh authentication token

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/change-password` - Change password
- `DELETE /api/users/account` - Delete user account

### System
- `GET /api/system/health` - Health check
- `GET /api/system/status` - System status
- `GET /api/system/version` - API version

### Starlink Usage
- `GET /api/starlink-usage` - Get starlink usage records
- `POST /api/starlink-usage` - Create new starlink usage record
- `PUT /api/starlink-usage` - Update existing starlink usage record
- `DELETE /api/starlink-usage` - Delete starlink usage record
- `POST /api/starlink-usage/sync` - Sync starlink usage data from external API
- `GET /api/starlink-usage/date-range` - Get starlink usage data by date range with vessel info

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `password` (String, Hashed)
- `fullName` (String, Optional)
- `username` (String, Unique, Optional)
- `role` (String, Default: 'user')
- `isActive` (Boolean, Default: true)
- `isEmailVerified` (Boolean, Default: false)
- `mfaEnabled` (Boolean, Default: false)
- `profilePicture` (String, Optional)
- `bio` (Text, Optional)
- `preferences` (JSONB, Optional)
- Timestamps: `createdAt`, `updatedAt`, `lastLoginAt`

### Sessions Table
- `id` (UUID, Primary Key)
- `userId` (UUID, Foreign Key)
- `currentDB` (String)
- `sessionData` (JSONB)
- `ipAddress` (String)
- `userAgent` (String)
- `isActive` (Boolean)
- `expiresAt` (Timestamp)
- Timestamps: `createdAt`, `updatedAt`

## Development

### Available Scripts

- `bun run dev` - Start development server with hot reload
- `bun run start` - Start production server
- `bun run build` - Build for production
- `bun run db:generate` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio (database GUI)

### Environment Variables

```env
APP_NAME=ElysiaJS Backend
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/elysia_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Session
SESSION_SECRET=your-session-secret-here
```

## Authentication & Authorization

The API uses JWT tokens for authentication with the following features:

- **JWT Tokens**: Stored as HTTP-only cookies for security
- **Session Management**: Database-backed sessions with expiration
- **Role-based Access**: Admin, user, and moderator roles
- **Permission System**: Granular permissions for different actions
- **Password Security**: Bcrypt hashing with salt rounds

## Security Features

- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Request/response validation with Elysia
- **SQL Injection Protection**: Drizzle ORM with parameterized queries
- **Password Hashing**: Bcrypt with configurable salt rounds
- **Session Security**: HTTP-only cookies, secure flags in production
- **Error Handling**: Sanitized error responses

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -am 'Add new feature'`
5. Push to the branch: `git push origin feature/new-feature`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.