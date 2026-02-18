# Admin Dashboard Routing & Authentication Setup

## Routes Overview

### Public Routes (No Authentication Required)
- `/` - Home page
- `/about` - About page
- `/services` - Services page
- `/contact` - Contact page
- `/registration` - User registration page
- `/login` - User login page

### Protected Routes (Authentication Required)
- `/admin` - Admin Dashboard (Admin role only)

## Navigation Bar Behavior

### For Non-Authenticated Users
- Shows: Home, About, Services, Contact, Registration, Login

### For Authenticated Regular Users
- Shows: Home, About, Services, Contact, Logout button

### For Authenticated Admin Users
- Shows: Home, Admin Dashboard, Logout button

## How It Works

1. **ProtectedRoute Component** (`/src/components/ProtectedRoute.jsx`)
   - Checks if user has valid token in localStorage
   - Verifies user has required role (e.g., "admin")
   - Redirects to login if not authenticated
   - Redirects to home if user lacks required role

2. **AdminDashboard Protection** (`/src/pages/AdminDashboard.jsx`)
   - Double-checks admin role on component mount
   - Provides additional layer of security
   - Shows statistics and user management features

3. **Navbar Navigation** (`/src/components/Navbar.jsx`)
   - Dynamically renders routes based on authentication status and role
   - Shows/hides admin dashboard link for admin users
   - Provides logout functionality with proper cleanup

## Login Flow

1. User registers at `/registration` or logs in at `/login`
2. Backend returns `token` and `role`
3. Frontend stores in localStorage:
   - `token` - JWT token for API authentication
   - `role` - User role ("user" or "admin")
   - `userID` - User's unique ID

4. Based on role:
   - Admin users see Admin Dashboard link in navbar
   - Regular users see only public pages + logout
   - Non-authenticated users see registration/login

## Admin Dashboard Features

- View all system users
- Edit user details (username, email, phone, address)
- Delete users with confirmation
- View statistics (total users, total admins, regular users)
- Admin badge display
- Secure logout

## Testing

1. Create or promote a user to admin role:
   ```bash
   # In MongoDB, update a user:
   db.users.updateOne({ email: "admin@test.com" }, { $set: { role: "admin" } })
   ```

2. Login as admin and navigate to `/admin`
3. Try accessing `/admin` as non-admin → redirects to login
4. Try accessing `/admin` without token → redirects to login

## Security

- Protected routes validate authentication AND authorization
- LocalStorage tokens checked on every protected route
- Backend verifies tokens and roles on API calls
- Admin middleware on backend enforces role-based access control
