# Fix Property Deletion Error

## Problem
When deleting a property, you're getting this error:
```
ERROR Failed to delete property: {"code": "23503", "details": "Key is not present in table \"properties\".", "message": "insert or update on table \"property_history\" violates foreign key constraint \"property_history_property_id_fkey\""}
```

This happens because the trigger tries to create a history record AFTER the property is deleted, but the foreign key constraint requires the property to still exist.

## Solution
Run the SQL fix that changes the DELETE trigger to run BEFORE the property is deleted:

### Step 1: Open Supabase SQL Editor
1. Go to https://dcsoudthcmkrficgcbio.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### Step 2: Copy and Run the Fix
Copy the entire contents of `FIX_DELETE_TRIGGER.sql` and paste it into the SQL editor, then click "RUN"

### Step 3: Verify
After running the fix:
1. Try deleting a property again
2. The deletion should now work without errors
3. The property history will still be preserved

## What Changed
- The DELETE trigger now runs BEFORE the property is deleted (instead of AFTER)
- This allows the history record to be created while the property still exists
- The history record will remain even after the property is deleted (thanks to the CASCADE constraint)

## Note
This fix only changes when the history record is created during deletion. All other functionality remains the same.
