# Admin Credentials

## Admin Login Details

**Email:** admin@roomrent.com  
**Password:** Admin@123

---

## How to Access Admin Dashboard

1. Open the app
2. Go to **Login** screen
3. Enter the admin credentials above
4. After login, you will be automatically redirected to your dashboard
5. Admin users can access the admin panel from the profile section or by navigating to `/admin`

---

## Admin Capabilities

### User Management (Unified Access)
- **Manage Property Finders (Renters)**: View, block, or delete property seekers
- **Manage Property Providers (Owners)**: View, block, or delete property owners
- **Block for Misconduct**: Block any user (finder or provider) for any misconduct or suspicious activities
- **Unified Dashboard**: Single admin login manages both user types with the same credentials
- **View User Stats**: Track total finders, providers, and blocked users
- **Filter by User Type**: Quickly filter between all users, finders only, or providers only

### Property Management
- View all property listings (active, pending, rejected)
- Approve or reject pending property listings
- Block/Unblock properties
- Delete properties if needed

### Communication
- Send broadcast messages to all users
- Target messages to finders only
- Target messages to providers only

### Analytics & Monitoring
- View system-wide statistics
- Monitor all activities on the platform
- Track blocked users and active users
- Review admin actions history

---

## Creating Admin Account

If you need to create an admin account in Supabase:

1. Go to your Supabase project
2. Navigate to **Authentication** → **Users**
3. Create a new user with email: `admin@roomrent.com` and password: `Admin@123`
4. Go to **Table Editor** → **users** table
5. Find the user you just created
6. Update the `user_type` field to `'admin'`
7. Save the changes

The admin can now login with these credentials!

---

## Note

- Make sure your Supabase database has a user with `user_type = 'admin'` for these credentials to work
- You can create multiple admin accounts by following the same process
- Admins have full control over the platform
