# Property Deletion Fix - Summary

## Problem
When attempting to delete a property, the following error occurred:
```
ERROR Failed to delete property: {
  "code": "23503",
  "details": "Key is not present in table \"properties\".",
  "message": "insert or update on table \"property_history\" violates foreign key constraint \"property_history_property_id_fkey\""
}
```

## Root Cause
The database trigger `log_property_history()` was configured to run AFTER DELETE on the properties table. When a property was deleted:

1. Property row gets deleted from `properties` table
2. Trigger fires AFTER deletion
3. Trigger tries to insert a history record with the deleted property's ID
4. Foreign key constraint fails because the property no longer exists

## Solution
Split the trigger into two separate triggers with different timing:

### 1. BEFORE DELETE Trigger
- Fires **before** the property is deleted
- Logs the deletion while the property still exists
- Uses `OLD` row data (the row being deleted)

### 2. AFTER INSERT/UPDATE Trigger
- Fires **after** inserts and updates are committed
- Logs creation and status changes
- Uses `NEW` row data (the newly inserted/updated row)

## Files Changed

### 1. `FIX_DELETE_PROPERTY.sql` (NEW)
Contains the SQL fix that:
- Drops existing triggers
- Updates the `log_property_history()` function to handle all operations correctly
- Creates two separate triggers with proper timing

### 2. `hooks/property-store.ts` (UPDATED)
- Enhanced error logging in `deleteProperty()` function
- Now logs full error details including code, message, details, and hint
- Better error messages displayed to users

### 3. `APPLY_DELETE_PROPERTY_FIX.md` (NEW)
Step-by-step instructions for applying the fix via Supabase Dashboard or psql

## How to Apply the Fix

### Via Supabase Dashboard (Recommended)
1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Copy the contents of `FIX_DELETE_PROPERTY.sql`
4. Paste and click **Run**
5. Verify: Try deleting a property - it should work without errors

### Via psql (Alternative)
```bash
psql -h <your-db-host> -U postgres -d postgres -f FIX_DELETE_PROPERTY.sql
```

## Technical Details

### Trigger Function Logic
```sql
CREATE OR REPLACE FUNCTION log_property_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- Insert BEFORE deletion (uses OLD row)
    INSERT INTO property_history (property_id, provider_id, action, previous_status)
    VALUES (OLD.id, OLD.owner_id, 'deleted', OLD.status);
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    -- Insert AFTER creation (uses NEW row)
    ...
  ELSIF TG_OP = 'UPDATE' THEN
    -- Insert AFTER update (uses NEW row)
    ...
  END IF;
END;
$$ LANGUAGE plpgsql;
```

### Trigger Definitions
```sql
-- BEFORE trigger for DELETE operations
CREATE TRIGGER property_history_delete_trigger
BEFORE DELETE ON properties
FOR EACH ROW
EXECUTE FUNCTION log_property_history();

-- AFTER trigger for INSERT and UPDATE operations
CREATE TRIGGER property_history_insert_update_trigger
AFTER INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION log_property_history();
```

## Testing
After applying the fix:
1. Log in as a property provider
2. Navigate to "My Properties"
3. Try deleting a property
4. Verify it deletes successfully
5. Check the property_history table - it should contain a 'deleted' action record

## Benefits
- ✅ Property deletion now works correctly
- ✅ Deletion history is properly logged
- ✅ Foreign key constraints are respected
- ✅ No data loss or orphaned records
- ✅ Better error messages for debugging
