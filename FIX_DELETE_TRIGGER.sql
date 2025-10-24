-- Fix the property history trigger to handle DELETE operations properly
-- The issue is that AFTER DELETE tries to insert a history record with a property_id
-- that's being deleted, causing a foreign key violation

-- Drop the existing trigger
DROP TRIGGER IF EXISTS property_history_trigger ON properties;

-- Recreate the function to handle DELETE with BEFORE trigger
CREATE OR REPLACE FUNCTION log_property_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
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
  ELSIF TG_OP = 'DELETE' THEN
    -- Insert before the property is actually deleted
    INSERT INTO property_history (property_id, provider_id, action, previous_status)
    VALUES (OLD.id, OLD.owner_id, 'deleted', OLD.status);
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger with mixed timing:
-- AFTER for INSERT and UPDATE (so new data is already committed)
-- BEFORE for DELETE (so property still exists when creating history)
CREATE TRIGGER property_history_trigger
BEFORE DELETE ON properties
FOR EACH ROW
EXECUTE FUNCTION log_property_history();

CREATE TRIGGER property_history_trigger_after
AFTER INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION log_property_history();
