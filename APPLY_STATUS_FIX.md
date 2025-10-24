# Fix Property Status Constraint Error

## Problem
The database constraint expects status values: `'active'`, `'pending'`, `'rejected'`, `'rented'`
But the TypeScript code uses: `'active'`, `'pending'`, `'rejected'`, `'booked'`

This causes the error:
```
ERROR Failed to update property status: {"code": "23514", "details": null, "hint": null, "message": "new row for relation \"properties\" violates check constraint \"properties_status_check\""}
```

## Solution
Run the SQL file to update the database constraint to match the TypeScript types.

## Steps to Fix

### 1. Go to Supabase Dashboard
- Open your Supabase project
- Navigate to **SQL Editor** (left sidebar)

### 2. Run the Fix
- Click **New Query**
- Copy and paste the entire content from `FIX_STATUS_CONSTRAINT.sql`
- Click **Run** button

### 3. Verify
The fix will:
- ✅ Update the `properties` table constraint to use `'booked'` instead of `'rented'`
- ✅ Update the `property_history` table constraints
- ✅ Convert any existing `'rented'` values to `'booked'`

### 4. Test
After running the SQL:
1. Try updating a property status to 'booked'
2. The error should be resolved
3. Properties with 'booked' status will be automatically removed from finder section (they're filtered to show only 'active' status)

## What This Changes

### Before:
```sql
status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected', 'rented'))
```

### After:
```sql
status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'rejected', 'booked'))
```

## Auto-filtering Behavior
- Only properties with `status = 'active'` are shown in the finder section
- When a provider changes status to `'booked'`, it automatically disappears from finder
- When a provider changes status back to `'active'`, it reappears in finder
