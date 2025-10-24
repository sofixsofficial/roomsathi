-- Property Provider History Table
CREATE TABLE IF NOT EXISTS property_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'edited', 'deleted', 'reposted', 'status_changed')),
  previous_status TEXT CHECK (previous_status IN ('active', 'pending', 'rejected', 'rented')),
  new_status TEXT CHECK (new_status IN ('active', 'pending', 'rejected', 'rented')),
  view_count INTEGER DEFAULT 0,
  interested_finders TEXT[] DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_history_provider ON property_history(provider_id);
CREATE INDEX IF NOT EXISTS idx_property_history_property ON property_history(property_id);
CREATE INDEX IF NOT EXISTS idx_property_history_timestamp ON property_history(timestamp DESC);

-- Property Finder History Table
CREATE TABLE IF NOT EXISTS finder_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  finder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('viewed', 'contacted', 'favorited', 'unfavorited')),
  is_favorite BOOLEAN DEFAULT false,
  contact_details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finder_history_finder ON finder_history(finder_id);
CREATE INDEX IF NOT EXISTS idx_finder_history_property ON finder_history(property_id);
CREATE INDEX IF NOT EXISTS idx_finder_history_timestamp ON finder_history(timestamp DESC);

-- Screenshots Table
CREATE TABLE IF NOT EXISTS screenshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  image_uri TEXT NOT NULL,
  watermark TEXT DEFAULT 'Captured via RoomRent App',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screenshots_user ON screenshots(user_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_property ON screenshots(property_id);

-- Admin Actions Table
CREATE TABLE IF NOT EXISTS admin_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('block_user', 'unblock_user', 'block_property', 'unblock_property', 'approve_property', 'reject_property', 'broadcast_message', 'delete_user', 'delete_property')),
  target_type TEXT NOT NULL CHECK (target_type IN ('user', 'property')),
  target_id UUID NOT NULL,
  reason TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target ON admin_actions(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_timestamp ON admin_actions(timestamp DESC);

-- Broadcast Messages Table
CREATE TABLE IF NOT EXISTS broadcast_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  recipients TEXT NOT NULL CHECK (recipients IN ('all', 'finders', 'providers')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_broadcast_admin ON broadcast_messages(admin_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_timestamp ON broadcast_messages(timestamp DESC);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_type TEXT NOT NULL CHECK (reported_type IN ('user', 'property', 'message')),
  reported_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported ON reports(reported_type, reported_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON reports(timestamp DESC);

-- Add view_count column to properties table if not exists
ALTER TABLE properties ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS interested_finders TEXT[] DEFAULT '{}';

-- Enable Row Level Security
ALTER TABLE property_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE finder_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_history
CREATE POLICY "Providers can view their own property history"
  ON property_history FOR SELECT
  USING (provider_id = auth.uid());

CREATE POLICY "Providers can insert their own property history"
  ON property_history FOR INSERT
  WITH CHECK (provider_id = auth.uid());

CREATE POLICY "Admins can view all property history"
  ON property_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for finder_history
CREATE POLICY "Finders can view their own history"
  ON finder_history FOR SELECT
  USING (finder_id = auth.uid());

CREATE POLICY "Finders can insert their own history"
  ON finder_history FOR INSERT
  WITH CHECK (finder_id = auth.uid());

CREATE POLICY "Admins can view all finder history"
  ON finder_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for screenshots
CREATE POLICY "Users can view their own screenshots"
  ON screenshots FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own screenshots"
  ON screenshots FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own screenshots"
  ON screenshots FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all screenshots"
  ON screenshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can delete any screenshot"
  ON screenshots FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for admin_actions
CREATE POLICY "Admins can view all admin actions"
  ON admin_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can insert admin actions"
  ON admin_actions FOR INSERT
  WITH CHECK (
    admin_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for broadcast_messages
CREATE POLICY "Users can view broadcast messages"
  ON broadcast_messages FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert broadcast messages"
  ON broadcast_messages FOR INSERT
  WITH CHECK (
    admin_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports"
  ON reports FOR SELECT
  USING (reporter_id = auth.uid());

CREATE POLICY "Users can insert reports"
  ON reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Admins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update reports"
  ON reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DOUBLE PRECISION,
  lon1 DOUBLE PRECISION,
  lat2 DOUBLE PRECISION,
  lon2 DOUBLE PRECISION
) RETURNS DOUBLE PRECISION AS $$
DECLARE
  earth_radius DOUBLE PRECISION := 6371;
  d_lat DOUBLE PRECISION;
  d_lon DOUBLE PRECISION;
  a DOUBLE PRECISION;
  c DOUBLE PRECISION;
BEGIN
  d_lat := RADIANS(lat2 - lat1);
  d_lon := RADIANS(lon2 - lon1);
  
  a := SIN(d_lat / 2) * SIN(d_lat / 2) +
       COS(RADIANS(lat1)) * COS(RADIANS(lat2)) *
       SIN(d_lon / 2) * SIN(d_lon / 2);
  
  c := 2 * ATAN2(SQRT(a), SQRT(1 - a));
  
  RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to search properties within radius
CREATE OR REPLACE FUNCTION search_properties_by_location(
  search_lat DOUBLE PRECISION,
  search_lon DOUBLE PRECISION,
  max_radius DOUBLE PRECISION DEFAULT 100
) RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  price NUMERIC,
  deposit NUMERIC,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  property_type TEXT,
  category TEXT,
  bhk TEXT,
  furnishing_type TEXT,
  amenities TEXT[],
  pets_allowed BOOLEAN,
  couples_allowed BOOLEAN,
  families_allowed BOOLEAN,
  bachelors_allowed BOOLEAN,
  images TEXT[],
  owner_id UUID,
  owner_name TEXT,
  owner_phone TEXT,
  available_from TEXT,
  virtual_tour_url TEXT,
  status TEXT,
  view_count INTEGER,
  interested_finders TEXT[],
  distance DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.*,
    calculate_distance(search_lat, search_lon, p.latitude, p.longitude) as distance
  FROM properties p
  WHERE 
    p.status = 'active' AND
    calculate_distance(search_lat, search_lon, p.latitude, p.longitude) <= max_radius
  ORDER BY distance ASC;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create property history on property changes
CREATE OR REPLACE FUNCTION log_property_history()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO property_history (property_id, provider_id, action, new_status)
    VALUES (NEW.id, NEW.owner_id, 'created', NEW.status);
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != NEW.status THEN
      INSERT INTO property_history (property_id, provider_id, action, previous_status, new_status)
      VALUES (NEW.id, NEW.owner_id, 'status_changed', OLD.status, NEW.status);
    ELSE
      INSERT INTO property_history (property_id, provider_id, action)
      VALUES (NEW.id, NEW.owner_id, 'edited');
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO property_history (property_id, provider_id, action, previous_status)
    VALUES (OLD.id, OLD.owner_id, 'deleted', OLD.status);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS property_history_trigger ON properties;
CREATE TRIGGER property_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON properties
FOR EACH ROW
EXECUTE FUNCTION log_property_history();

-- Trigger to increment view count when finder views property
CREATE OR REPLACE FUNCTION increment_property_views()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action = 'viewed' THEN
    UPDATE properties
    SET view_count = view_count + 1
    WHERE id = NEW.property_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS finder_history_views_trigger ON finder_history;
CREATE TRIGGER finder_history_views_trigger
AFTER INSERT ON finder_history
FOR EACH ROW
EXECUTE FUNCTION increment_property_views();
