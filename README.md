# Artist Management System

**System Overview:**
Built a multi-role admin system with three user types (super_admin, artist_manager, artist) that manages Users, Artists, and Songs through a web-based dashboard.

**Technical Requirements:**

- Language: TypeScript
- API: REST architecture
- Database: Relational database(PostgreSql) with raw SQL queries
- Required tables: User, Artist, Song (refer to provided schema diagram)

**Functional Requirements:**

**1. Authentication & Landing Page:**

- Created a login screen as the initial landing page.
- Included new user registration option on login screen.
- After successful registration, redirected to login page for authentication.
- Implemented session management: redirected already logged-in users directly to dashboard.
- Applied proper form validation for all authentication forms.

**2. Dashboard Implementation:**
Designed a tabbed dashboard interface with the following specifications:

**Tab 1 - User Management (super_admin access only):**

- Displayed paginated list of all user records
- Implemented full CRUD operations (Create, Read, Update, Delete)
- Show user types: super_admin, artist_manager, artist

**Tab 2 - Artist Management:**

- **Listing & Basic CRUD:**
    - Displayed paginated artist records (super_admin, artist_manager access)
    - Created new artist records (artist_manager access only)
    - Updated/Deleted artist records (artist_manager access only)
- **Data Management:**
    - Implemented CSV import/export functionality for artists (artist_manager access)
- **Navigation:**
    - Added "View Songs" button for each artist that redirects to artist-specific song management

**Song Management (accessed via Artist tab):**

- **Song Listing:**
    - Displayed songs for specific artist (super_admin, artist_manager, artist access)
    - Implemented pagination for song lists
- **Song CRUD:**
    - Created new songs for the artist (artist access only)
    - Updated/Deleted existing songs for the artist (artist access only)

**3. Technical Implementation Requirements:**

- Implemented comprehensive input validation for all forms and operations
- Used raw SQL queries for all database operations (strictly no ORM)
- Implemented proper error handling and user feedback
- Included a logout button accessible from all dashboard pages
- Ensured responsive design for the dashboard interface

**4. Role-Based Access Control:**
Implemented strict role-based permissions as specified:

- super_admin: Full access to users and read access to artists/songs
- artist_manager: Full access to artists, read access to songs, CSV operations
- artist: Full access to their own songs only

**Delivered:**

- Completed TypeScript application with authentication system
- Role-based dashboard with tabbed interface
- Raw SQL query implementations for all CRUD operations
- Proper validation and error handling throughout the system

