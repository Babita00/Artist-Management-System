#  Artist Management System

<div align="center">
  A robust, role-based administration dashboard built to manage Users, Artists, and Songs.
  <br />
  Built with <strong>React</strong>, <strong>Express</strong>, <strong>TypeScript</strong>, and <strong>PostgreSQL</strong>.
</div>

##  Features

- **Multi-Role Authentication System:** Secure login and registration with JWT-based session management and role-based access control.

- **User Management (Super Admin):** Full CRUD capabilities for system administrators. View, create, update, and delete users across all roles (Super Admin, Artist Manager, Artist).
- **Artist Management:**
  - Complete management of artist profiles.
  - **Import/Export:** Seamlessly import artist data or export existing artists to CSV format.
- **Song Management:**
  - Artists can manage their own discography.
  - Dedicated views for Managers and Admins to oversee songs for each artist.
.
- **Robust Security & Validation:** Comprehensive input validation across frontend and backend using Zod.

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18, Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, Lucide React
- **State Management:** Zustand
- **Form Handling & Validation:** React Hook Form, Zod
- **Notifications:** Sonner

### Backend
- **Framework:** Express.js (via `vite-express`)
- **Language:** TypeScript
- **Authentication:** JWT, bcrypt
- **Database:** PostgreSQL (using raw SQL queries via `pg` package)
- **Validation:** Zod
- **Utilities:** ExcelJS (for CSV exports)

## Prerequisites

- **Node.js**: `v18.x` or higher
- **PostgreSQL**: `v14.x` or higher

##  Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Babita00/Artist-Management-System

```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory based on the provided `.env.example`:

```env
PORT=3000

# Database Configurations
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_SYNCHRONIZE=false
DB_DATABASE=artist_management
AUTO_RUN_MIGRATION=true

# Authentication
JWT_SECRET_ACCESS=your_access_secret
JWT_SECRET_REFRESH=your_refresh_secret

# Frontend
VITE_API_BASE_URL="/api"
```

### 4. Database Setup
Ensure PostgreSQL is running and the database `artist_management` exists.
The application handles initial migrations via the `AUTO_RUN_MIGRATION=true` flag in your `.env` file.

### 5. Start the Development Server
This project is configured using `vite-express`, which serves both the API and the React frontend concurrently.

```bash
npm run dev
```
The application will be accessible at `http://localhost:3000`.

##  Project Structure

```text
src/
├── client/
│   ├── assets/             # Static UI assets
│   ├── components/         # Reusable UI components
│   ├── constants/          # Frontend constants
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Page layouts
│   ├── lib/                # Utility logic
│   ├── pages/              # Main functional application pages
│   ├── routes/             # Authentication routing
│   ├── services/           # Axios network services
│   └── store/              # Zustand state files
└── server/
    ├── config/             # Database connection & configurations
    ├── constants/          # Backend constants
    ├── controllers/        # Request handlers
    ├── middlewares/        # Authentication middlewares
    ├── migrations/         # Database migrations
    ├── models/             # Database models
    ├── repositories/       # Database access files
    ├── routes/             # Express routers
    ├── services/           # Business logic layer
    ├── types/              # Backend TypeScript types
    ├── utils/              # Helper utilities
    └── validators/         # Zod schemas 
```

##  Roles & Access Control

The application enforces strict Role-Based Access Control (RBAC):

| Feature | Super Admin | Artist Manager | Artist |
| :--- | :---: | :---: | :---: |
| **Manage Users** | ✅ Full Access | ❌ None | ❌ None |
| **Artist Profiles** | 👁️ Read-Only | ✅ Full Access | 👁️ Read-Only |
| **Import/Export CSV** | ❌ None | ✅ Full Access | ❌ None |
| **Manage Songs** | 👁️ Read-Only | 👁️ Read-Only | ✅ Manage Own |

## ❗ Issues Encountered

### Database Structure constraint mappings

While implementing the solution, I encountered a structural issue in the database design. The `users` table and the `artists` table are not directly linked, whereas the `songs` table is associated with the `artists` table through `artist_id` (foreign key).

Since there is no relationship between `users` and `artists`, a logged-in user with role `artist` cannot be directly mapped to an artist record when creating a song.

To address this, I considered the `artists` table as artist profile information managed separately (e.g., by an Artist Manager). The user with role `artist` is responsible for creating songs. During song creation, the user selects the artist name (retrieved from the `artists` table), and the corresponding `artist_id` is used to associate the song correctly. This ensures that each song is properly linked to an artist while keeping the two entities separate.

## Scripts

- `npm run dev`: Starts the application in development mode.
- `npm run build`: Builds both the React application and the Express API for production.
- `npm run preview`: Previews the built production application.
- `npm run lint`: Lints the codebase using ESLint.
