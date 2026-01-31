# Survey Management System

A comprehensive full-stack application for creating, managing, and submitting surveys with role-based access control.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Setup](#project-setup)
4. [Design Decisions](#design-decisions)
5. [Assumptions & Limitations](#assumptions--limitations)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)

---

## Project Overview

This application provides a complete survey management solution with two distinct user roles:

- **Admin**: Create and manage surveys, view all responses
- **Officer**: Submit survey responses, view own submissions

### Key Features

- ✅ User authentication with JWT (RS256)
- ✅ Role-based access control
- ✅ Dynamic survey creation with 4 question types
- ✅ Real-time form validation
- ✅ Survey response management
- ✅ Responsive design
- ✅ RESTful API with Swagger documentation

---

## Tech Stack

### Backend
```
├── NestJS 10              # Node.js framework
├── TypeScript 5           # Programming language
├── PostgreSQL            # Database
├── TypeORM               # ORM
├── JWT (RS256)           # Authentication
├── bcrypt                # Password hashing
├── class-validator       # Input validation
└── Swagger               # API documentation
```

### Frontend (Admin UI + Client UI)
```
├── Next.js 15            # React framework
├── TypeScript 5          # Programming language
├── Tailwind CSS          # Styling
├── shadcn/ui             # UI components (Radix UI)
└── React Hook Form       # Form handling
```

### Why These Technologies?

**NestJS**:
- Strong TypeScript support
- Built-in dependency injection
- Modular architecture
- Excellent integration with TypeORM

**PostgreSQL**:
- ACID compliance for data integrity
- Excellent JSON support for dynamic question data
- Mature ecosystem

**Next.js**:
- Server-side rendering
- Built-in routing
- Production-ready optimization

**shadcn/ui**:
- Accessible by default
- Full customization
- No runtime JavaScript overhead

---

## Project Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone and Install

```bash
# Clone repository
cd InterviewTaskInnospace

# Install backend
cd backend
npm install

# Install admin-ui
cd ../admin-ui
npm install

# Install client-ui
cd ../client-ui
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE survey_db;
\q
```

### 3. Environment Variables

Create `.env` files in each directory:

#### backend/.env
```env
PORT=5005
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=survey_db
NODE_ENV=development
```

#### admin-ui/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:5005/api
```

#### client-ui/.env.local
```env
NEXT_PUBLIC_API_URL=http://localhost:5005/api
```

### 4. Generate RSA Keys

```bash
cd backend

# Create directories if they don't exist ( I have pushed them in the repo for easy management )
mkdir -p src/resources/private-keys
mkdir -p src/resources/public-keys

# Generate private key
openssl genrsa -out src/resources/private-keys/admin.private.key 2048

# Generate public key
openssl rsa -in src/resources/private-keys/admin.private.key -pubout -out src/resources/public-keys/admin.public.key
```

### 5. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Admin UI
cd admin-ui
npm run dev

# Terminal 3 - Client UI
cd client-ui
npm run dev
```

### Access Points

- Backend API: http://localhost:5005
- Swagger Docs: http://localhost:5005/docs
- Admin Dashboard: http://localhost:3000
- Officer Portal: http://localhost:3001

---

## Design Decisions

### 1. Authentication: JWT with RS256

**Decision**: Use asymmetric encryption (RS256) instead of symmetric (HS256)

**Rationale**:
- More secure for production environments
- Public key can be safely shared
- Private key remains server-only
- Tokens cannot be forged without private key

**Implementation**:
```typescript
// Token includes: userId, email, role
// Expiration: 1 hour
// Guards validate on protected routes
```

### 2. Role-Based Access Control

**Decision**: Two distinct user roles (ADMIN, OFFICER)

**Rationale**:
- Clear separation of concerns
- Easy to extend with more roles
- Guards enforce at route level
- Prevents privilege escalation

**Example**:
```typescript
@UseGuards(AdminAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
async createSurvey() { ... }
```

### 3. Data Integrity Protection

**Decision**: Prevent editing/deleting surveys with responses

**Rationale**:
- Maintains audit trail
- Preserves meaning of existing responses
- Industry best practice
- Prevents accidental data corruption

**User Impact**:
- Cannot edit survey after responses received
- Cannot delete survey with responses
- Can deactivate to hide from officers

### 4. Question Types

**Decision**: Support 4 types (TEXT, RADIO, CHECKBOX, DROPDOWN)

**Rationale**:
- Covers 90% of survey needs
- Simple to implement and validate
- Clear UX patterns
- Easily extensible

### 5. Database Schema Design

**Decision**: Normalized schema with separate tables

**Rationale**:
- Reduces redundancy
- Foreign key constraints ensure integrity
- Easy to query specific data
- Cascade deletes handle cleanup

**Relationships**:
```
Survey (1:N) Questions
Survey (1:N) SurveyResponses
SurveyResponse (1:N) Answers
Question (1:N) Answers
User (1:N) SurveyResponses
```

### 6. API Architecture

**Decision**: RESTful API with versioning

**Rationale**:
- Industry standard
- Version prefix allows breaking changes
- Resource-based endpoints
- Standard HTTP methods

**Structure**:
```
/api/user/*           - Admin user endpoints
/api/cfa/user/*       - Officer user endpoints
/api/v1/survey/*      - Admin survey operations
/api/v1/survey-cfa/*  - Officer survey operations
```

### 7. Frontend State Management

**Decision**: React Context for auth, component state for forms

**Rationale**:
- Simple and sufficient for app scope
- No Redux complexity needed
- Context provides global auth state
- Component state keeps forms isolated

**Authentication Flow**:
1. Login returns JWT + user data
2. Store in localStorage + Context
3. Include in Authorization header
4. Protected routes check Context

### 8. Error Handling

**Decision**: Global exception filter with standardized format

**Rationale**:
- Consistent error responses
- Easy debugging
- Clear frontend messaging

**Format**:
```json
{
  "statusCode": 400,
  "message": "Clear error message",
  "timestamp": "2026-01-31T...",
  "path": "/api/v1/survey/..."
}
```

### 9. Password Security

**Decision**: Bcrypt with 10 salt rounds

**Rationale**:
- Industry standard
- Salting prevents rainbow table attacks
- 10 rounds balances security/performance
- One-way hashing (cannot decrypt)

**Security Measures**:
- Passwords never returned in responses
- Constant-time comparison
- Minimum length validation
- Confirmation password check

### 10. Frontend Validation

**Decision**: Client-side + server-side validation

**Rationale**:
- Client-side: Immediate feedback, better UX
- Server-side: Security, cannot be bypassed
- Double layer of protection

---

## Assumptions & Limitations

### Assumptions Made

1. **Single Language**: English-only interface
2. **Modern Browsers**: JavaScript enabled, ES6+ support
3. **Network Reliability**: Stable internet connection
4. **User Trust**: Officers cannot view others' responses
5. **Survey Lifecycle**: Draft (editable) → Published (immutable)
6. **Data Retention**: All data retained indefinitely
7. **Single Timezone**: No timezone conversion
8. **File Size**: Questions and answers fit in text fields

### Current Limitations

#### Not Implemented (Future Enhancements)

1. **Pagination**: All surveys/responses loaded at once
   - *Impact*: Performance with 100+ surveys
   - *Mitigation*: Suitable for MVP/demo

2. **Search/Filter**: Cannot search surveys or responses
   - *Impact*: Finding specific data in large lists
   - *Mitigation*: Browser search (Ctrl+F)

3. **Export**: No CSV/Excel export
   - *Impact*: Cannot analyze data externally
   - *Mitigation*: View in UI

4. **Analytics**: No aggregate statistics or charts
   - *Impact*: No visual data insights
   - *Mitigation*: Raw response data available

5. **Draft Responses**: Must complete in one session
   - *Impact*: Cannot save partial responses
   - *Mitigation*: Browser keeps form data temporarily

6. **Email Notifications**: No email system
   - *Impact*: Manual checking for new surveys/responses
   - *Mitigation*: Regular dashboard visits

7. **File Uploads**: Text-only responses
   - *Impact*: Cannot collect documents/images
   - *Mitigation*: External file sharing links

8. **Conditional Logic**: All questions always shown
   - *Impact*: Cannot customize based on previous answers
   - *Mitigation*: Keep surveys short and focused

9. **Survey Templates**: Create from scratch each time
   - *Impact*: Repetitive for similar surveys
   - *Mitigation*: Copy question text manually

10. **Response Editing**: Cannot edit after submission
    - *Impact*: Mistakes cannot be corrected
    - *Mitigation*: Re-submit with note to admin

#### Technical Limitations

1. **CORS**: Currently allows all origins
   - *Production Fix*: Restrict to specific domains

2. **Rate Limiting**: Not implemented
   - *Production Fix*: Add express-rate-limit

3. **Caching**: No Redis caching
   - *Production Fix*: Cache survey lists

4. **Logging**: Console only
   - *Production Fix*: Winston + log aggregation

5. **Monitoring**: No health checks
   - *Production Fix*: Add /health endpoint

### Known Issues

- **Password Recovery**: Not implemented (admin must reset)
- **Session Management**: No token refresh mechanism
- **Audit Trail**: Limited to timestamps (no detailed logs)
- **Database Migrations**: Auto-sync in dev (manual in prod)

## API Endpoints

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/user/register` | Register admin | No |
| POST | `/api/user/login` | Login admin | No |
| GET | `/api/v1/survey` | Get all surveys | Yes |
| GET | `/api/v1/survey/:id` | Get survey by ID | Yes |
| POST | `/api/v1/survey` | Create survey | Yes |
| PUT | `/api/v1/survey/:id` | Update survey* | Yes |
| PATCH | `/api/v1/survey/:id/toggle-status` | Toggle active/inactive | Yes |
| DELETE | `/api/v1/survey/:id` | Delete survey* | Yes |
| GET | `/api/v1/survey/:id/responses` | Get all responses | Yes |

*Cannot edit/delete surveys with responses

### Officer Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/cfa/user/register` | Register officer | No |
| POST | `/api/cfa/user/login` | Login officer | No |
| GET | `/api/cfa/user` | Get current user | Yes |
| GET | `/api/v1/survey-cfa/active` | Get active surveys | Yes |
| POST | `/api/v1/survey-cfa/submit` | Submit response | Yes |
| GET | `/api/v1/survey-cfa/my-submissions` | Get my submissions | Yes |
| GET | `/api/v1/survey-cfa/submission/:id` | Get submission by ID | Yes |

**Full API Documentation**: http://localhost:5005/docs (Swagger)

---

## Database Schema

### Tables

#### users
```sql
id              UUID PRIMARY KEY
name            VARCHAR
email           VARCHAR UNIQUE
password        VARCHAR (hashed)
role            ENUM ('ADMIN', 'OFFICER')
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### surveys
```sql
id              UUID PRIMARY KEY
title           VARCHAR
description     TEXT
is_active       BOOLEAN
created_by      UUID FOREIGN KEY → users(id)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### questions
```sql
id              UUID PRIMARY KEY
survey_id       UUID FOREIGN KEY → surveys(id) ON DELETE CASCADE
text            VARCHAR
type            ENUM ('TEXT', 'CHECKBOX', 'RADIO', 'DROPDOWN')
options         JSON (array of strings)
is_required     BOOLEAN
order           INTEGER
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

#### survey_responses
```sql
id              UUID PRIMARY KEY
survey_id       UUID FOREIGN KEY → surveys(id) ON DELETE CASCADE
submitted_by    UUID FOREIGN KEY → users(id)
submitted_at    TIMESTAMP
```

#### answers
```sql
id              UUID PRIMARY KEY
response_id     UUID FOREIGN KEY → survey_responses(id) ON DELETE CASCADE
question_id     UUID FOREIGN KEY → questions(id)
value           JSON (string or array)
created_at      TIMESTAMP
```

### Indexes

- `users.email` - Unique index for fast lookups
- `survey_responses.survey_id` - For filtering responses by survey
- `answers.response_id` - For fetching answers by response
- `questions.survey_id` - For fetching questions by survey

---

## Project Structure

```
InterviewTaskInnospace/
├── backend/                  # NestJS backend
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── user/            # User management
│   │   ├── survey/          # Survey logic
│   │   ├── resources/       # RSA keys
│   │   └── main.ts          # Entry point
│   ├── libs/common/         # Shared code
│   └── package.json
│
├── admin-ui/                # Admin dashboard (Next.js)
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities & API
│   └── package.json
│
├── client-ui/               # Officer portal (Next.js)
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities & API
│   └── package.json
│
└── README.md                # This file
```

---

## Testing

While comprehensive test suites are not included in this Priject, the application has been manually tested for:

- ✅ User registration and login
- ✅ Survey CRUD operations
- ✅ Response submission
- ✅ Role-based access control
- ✅ Form validation
- ✅ Error scenarios

---

### Build Commands

```bash
# Backend
cd backend
npm run build
npm run start:prod

# Admin UI
cd admin-ui
npm run build
npm start

# Client UI
cd client-ui
npm run build
npm start
```

---
