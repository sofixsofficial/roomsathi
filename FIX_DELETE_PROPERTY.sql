-- Fix the property deletion issue
-- The problem is the trigger tries to insert history after property is deleted

-- Drop existing triggers
DROP TRIGGER IF EXISTS property_history_trigger ON properties;
DROP TRIGGER IF EXISTS property_history_trigger_after ON properties;

-- Update the trigger function to handle DELETE properly
CREATE OR REPLACE FUNCTION log_property_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    -- For DELETE, we need to insert BEFORE the property is deleted
    -- Use OLD instead of NEW since the row is being deleted
    INSERT INTO property_history (property_id, provider_id, action, previous_status)
    VALUES (OLD.id, OLD.owner_id, 'deleted', OLD.status);
    RETURN OLD;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO property_history (property_id, provider_id, action, new_status)
    VALUES (NEW.id, NEW.owner_id, 'created', NEW.status);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO property_history (property_id, provider_id, action, previous_status, new_status)
      VALUES (NEW.id, NEW.owner_id, 'status_changed', OLD.status, NEW.status);
    ELSE
      INSERT INTO property_history (property_id, provider_id, action)
      VALUES (NEW.id, NEW.owner_id, 'edited');
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create BEFORE trigger for DELETE (so property still exists when logging)
CREATE TRIGGER property_history_delete_trigger
BEFORE DELETE ON properties
FOR EACH ROW
EXECUTE FUNCTION log_property_history();

-- Create AFTER trigger for INSERT and UPDATE (so data is committed)
CREATE TRIGGER property_history_insert_update_trigger
AFTER INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION log_property_history();
