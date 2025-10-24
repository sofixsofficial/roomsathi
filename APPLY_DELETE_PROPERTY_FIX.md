# Fix Property Deletion Error

## Error
```
ERROR Failed to delete property: {"code": "23503", "details": "Key is not present in table \"properties\".", "hint": null, "message": "insert or update on table \"property_history\" violates foreign key constraint \"property_history_property_id_fkey\""}
```

## Cause
The trigger was trying to insert a history record AFTER the property was deleted, causing a foreign key constraint violation.

## Solution
Apply the SQL fix that creates separate triggers:
- BEFORE DELETE trigger: Logs the deletion before the property is actually deleted
- AFTER INSERT/UPDATE trigger: Logs creation and updates after they're committed

## How to Apply

### Option 1: Via Supabase Dashboard SQL Editor
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `FIX_DELETE_PROPERTY.sql`
4. Click "Run"

### Option 2: Via psql
```bash
psql -h <your-db-host> -U postgres -d postgres -f FIX_DELETE_PROPERTY.sql
```

## Verification
After applying the fix, try deleting a property again. It should work without errors and create a proper history record.
