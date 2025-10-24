-- ============================================
-- Fix Property Status Constraint
-- ============================================
-- This updates the status check constraint to use 'booked' instead of 'rented'
-- to match the TypeScript types and user requirements
-- ============================================

-- Drop the old constraint
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_status_check;

-- Add the new constraint with 'booked' instead of 'rented'
ALTER TABLE properties ADD CONSTRAINT properties_status_check 
  CHECK (status IN ('active', 'pending', 'rejected', 'booked'));

-- Update property_history table constraint as well
ALTER TABLE property_history DROP CONSTRAINT IF EXISTS property_history_previous_status_check;
ALTER TABLE property_history DROP CONSTRAINT IF EXISTS property_history_new_status_check;

ALTER TABLE property_history ADD CONSTRAINT property_history_previous_status_check 
  CHECK (previous_status IN ('active', 'pending', 'rejected', 'booked'));

ALTER TABLE property_history ADD CONSTRAINT property_history_new_status_check 
  CHECK (new_status IN ('active', 'pending', 'rejected', 'booked'));

-- Update any existing 'rented' status to 'booked' (if any exist)
UPDATE properties SET status = 'booked' WHERE status = 'rented';
UPDATE property_history SET previous_status = 'booked' WHERE previous_status = 'rented';
UPDATE property_history SET new_status = 'booked' WHERE new_status = 'rented';

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the constraint was updated:
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conname LIKE '%status%' AND conrelid = 'properties'::regclass;
