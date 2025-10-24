# 📊 RoomRent Database Schema

## Overview
This document describes the complete database schema for the RoomRent application.

## Tables

### 1. 👤 users
Stores user profiles and authentication data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | References auth.users(id) |
| email | TEXT | Unique email address |
| name | TEXT | User's full name |
| phone | TEXT | Contact phone number |
| avatar | TEXT | Profile picture URL (optional) |
| user_type | TEXT | 'renter', 'owner', or 'admin' |
| status | TEXT | 'active', 'suspended', or 'blocked' |
| created_at | TIMESTAMPTZ | Account creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_users_email` on email
- `idx_users_user_type` on user_type

**RLS Policies:**
- Users can view/update their own profile
- Admins can view/update/delete all users
- Anyone can insert during signup

---

### 2. 🏠 properties
Stores property listings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| title | TEXT | Property title |
| description | TEXT | Detailed description |
| price | NUMERIC | Monthly rent/sale price |
| deposit | NUMERIC | Security deposit amount |
| address | TEXT | Street address |
| city | TEXT | City name |
| state | TEXT | State name |
| pincode | TEXT | Postal code |
| latitude | NUMERIC | GPS latitude |
| longitude | NUMERIC | GPS longitude |
| property_type | TEXT | Type (room-rent, flat-rent, etc.) |
| category | TEXT | 'rent', 'buy', or 'hostel' |
| bhk | TEXT | Number of bedrooms (1BHK, 2BHK, etc.) |
| furnishing_type | TEXT | 'fully', 'semi', or 'unfurnished' |
| amenities | TEXT[] | Array of amenity names |
| pets_allowed | BOOLEAN | Pets allowed flag |
| couples_allowed | BOOLEAN | Couples allowed flag |
| families_allowed | BOOLEAN | Families allowed flag |
| bachelors_allowed | BOOLEAN | Bachelors allowed flag |
| images | TEXT[] | Array of image URLs |
| owner_id | UUID (FK) | References users(id) |
| owner_name | TEXT | Owner's name |
| owner_phone | TEXT | Owner's contact |
| available_from | DATE | Availability date |
| virtual_tour_url | TEXT | 360° tour URL (optional) |
| status | TEXT | 'active', 'pending', 'rejected', 'rented' |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_properties_owner` on owner_id
- `idx_properties_city` on city
- `idx_properties_status` on status
- `idx_properties_location` on (latitude, longitude)
- `idx_properties_property_type` on property_type
- `idx_properties_category` on category
- `idx_properties_price` on price

**RLS Policies:**
- Anyone can view active properties
- Owners can view/insert/update/delete their own properties
- Admins can view/update/delete all properties

---

### 3. 💬 conversations
Stores conversation threads between users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| participants | UUID[] | Array of user IDs |
| property_id | UUID (FK) | References properties(id) (optional) |
| property_title | TEXT | Property title for context |
| last_message | TEXT | Last message content |
| last_message_time | TIMESTAMPTZ | Last message timestamp |
| unread_count | INTEGER | Number of unread messages |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_conversations_participants` on participants (GIN index)
- `idx_conversations_property` on property_id

**RLS Policies:**
- Users can view/create/update their own conversations
- Must be a participant to access

---

### 4. 📨 messages
Stores individual messages within conversations.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| conversation_id | UUID (FK) | References conversations(id) |
| sender_id | UUID (FK) | References users(id) |
| receiver_id | UUID (FK) | References users(id) |
| property_id | UUID (FK) | References properties(id) (optional) |
| content | TEXT | Message content |
| read | BOOLEAN | Read status |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Indexes:**
- `idx_messages_conversation` on conversation_id
- `idx_messages_sender` on sender_id
- `idx_messages_receiver` on receiver_id
- `idx_messages_created_at` on created_at (DESC)

**RLS Policies:**
- Users can view messages they sent or received
- Users can send messages (as sender)
- Users can update messages they received (mark as read)

---

### 5. ⭐ favorites
Stores user's favorite properties.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Auto-generated |
| user_id | UUID (FK) | References users(id) |
| property_id | UUID (FK) | References properties(id) |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Constraints:**
- UNIQUE(user_id, property_id) - Prevents duplicate favorites

**Indexes:**
- `idx_favorites_user` on user_id
- `idx_favorites_property` on property_id

**RLS Policies:**
- Users can view/add/remove their own favorites

---

## Triggers

### update_updated_at_column()
Automatically updates the `updated_at` column when a row is modified.

**Applied to:**
- users
- properties
- conversations

---

## Helper Functions

### is_admin(user_id UUID)
Returns TRUE if the user is an admin.

### get_user_type(user_id UUID)
Returns the user's type ('renter', 'owner', or 'admin').

---

## Row Level Security (RLS)

All tables have RLS enabled with comprehensive policies:

### Security Model
1. **Users**: Can only access their own data, admins can access all
2. **Properties**: Public can view active, owners manage their own, admins manage all
3. **Conversations**: Only participants can access
4. **Messages**: Only sender and receiver can access
5. **Favorites**: Users can only manage their own

---

## Relationships

```
users (1) ──< (many) properties
users (1) ──< (many) messages
users (many) ──< (many) conversations (via participants array)
users (1) ──< (many) favorites

properties (1) ──< (many) conversations
properties (1) ──< (many) messages
properties (1) ──< (many) favorites

conversations (1) ──< (many) messages
```

---

## Data Flow Examples

### User Signup
1. User signs up via Supabase Auth → creates entry in `auth.users`
2. App inserts user profile into `users` table with selected role
3. RLS policy allows insert if `auth.uid() = id`

### Property Listing
1. Owner creates property → inserts into `properties` with `status='pending'`
2. Admin reviews → updates `status` to 'active' or 'rejected'
3. Active properties visible to all users
4. Owner can edit/delete their own properties

### Messaging
1. Renter contacts owner about property
2. App creates/finds conversation with both user IDs in `participants`
3. Message inserted into `messages` table
4. Conversation's `last_message` and `last_message_time` updated
5. Both users can view messages via RLS policies

### Favorites
1. User clicks favorite on property
2. App inserts into `favorites` table
3. Unique constraint prevents duplicates
4. User can view all their favorites
5. User can remove favorite (delete)

---

## Performance Optimizations

### Indexes
- **Location-based queries**: Composite index on (latitude, longitude)
- **City searches**: Index on city column
- **User lookups**: Index on email and user_type
- **Message queries**: Index on conversation_id and created_at
- **Array searches**: GIN index on participants array

### Query Patterns
- Use indexed columns in WHERE clauses
- Filter by status for properties
- Use participant array for conversation lookups
- Sort messages by created_at DESC for recent first

---

## Security Features

### Authentication
- Supabase Auth handles password hashing
- JWT tokens for session management
- Auto-refresh tokens

### Authorization
- Row Level Security on all tables
- Policies enforce user/admin access
- Foreign key constraints maintain data integrity

### Data Validation
- CHECK constraints on enum fields
- NOT NULL constraints on required fields
- UNIQUE constraints prevent duplicates
- Foreign keys ensure referential integrity

---

## Backup & Maintenance

### Recommended Practices
1. **Regular Backups**: Supabase provides automatic backups
2. **Monitor Logs**: Check query performance in Dashboard
3. **Index Maintenance**: PostgreSQL handles automatically
4. **Data Cleanup**: Consider archiving old messages/conversations

---

## Migration Notes

If you need to modify the schema:

1. **Adding Columns**: Use `ALTER TABLE ADD COLUMN`
2. **Modifying Policies**: Drop and recreate policies
3. **Data Migration**: Use SQL scripts for bulk updates
4. **Testing**: Always test in development first

---

## Support

For issues or questions:
1. Check Supabase Dashboard logs
2. Review RLS policies
3. Verify foreign key relationships
4. Test queries in SQL Editor

---

**Last Updated**: 2025-10-09
**Schema Version**: 1.0
