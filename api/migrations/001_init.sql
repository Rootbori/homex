CREATE TABLE stores (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(32),
  line_oa_id VARCHAR(120),
  logo_url VARCHAR(255),
  description VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE store_memberships (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id),
  display_name VARCHAR(120) NOT NULL,
  phone VARCHAR(32),
  email VARCHAR(120),
  role VARCHAR(32) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE technician_profiles (
  id BIGSERIAL PRIMARY KEY,
  membership_id BIGINT NOT NULL UNIQUE REFERENCES store_memberships(id),
  store_id BIGINT NOT NULL REFERENCES stores(id),
  slug VARCHAR(140) NOT NULL UNIQUE,
  avatar_url VARCHAR(255),
  headline VARCHAR(180),
  experience_years INT NOT NULL DEFAULT 0,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  availability VARCHAR(32) NOT NULL DEFAULT 'available',
  working_hours VARCHAR(160),
  line_url VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE technician_services (
  id BIGSERIAL PRIMARY KEY,
  technician_id BIGINT NOT NULL REFERENCES technician_profiles(id),
  service_type VARCHAR(32) NOT NULL,
  label VARCHAR(140) NOT NULL,
  starting_price INT NOT NULL DEFAULT 0
);

CREATE TABLE service_areas (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id),
  technician_id BIGINT REFERENCES technician_profiles(id),
  province VARCHAR(120) NOT NULL,
  district VARCHAR(120) NOT NULL,
  label VARCHAR(160) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id),
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  line_user_id VARCHAR(120),
  preferred_area VARCHAR(160),
  total_spend INT NOT NULL DEFAULT 0,
  note VARCHAR(800),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE customer_addresses (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  label VARCHAR(80) NOT NULL,
  address_line VARCHAR(255) NOT NULL,
  district VARCHAR(120),
  province VARCHAR(120),
  postal_code VARCHAR(16),
  latitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  longitude DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE leads (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id),
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  assigned_technician_id BIGINT REFERENCES technician_profiles(id),
  source VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL,
  service_type VARCHAR(32) NOT NULL,
  area_label VARCHAR(160) NOT NULL,
  address_line VARCHAR(255) NOT NULL,
  symptom VARCHAR(800),
  preferred_date VARCHAR(40),
  preferred_time VARCHAR(40),
  quick_note VARCHAR(800),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE lead_units (
  id BIGSERIAL PRIMARY KEY,
  lead_id BIGINT NOT NULL REFERENCES leads(id),
  sequence INT NOT NULL DEFAULT 1,
  brand VARCHAR(120),
  btu VARCHAR(40),
  service_type VARCHAR(32) NOT NULL,
  symptom VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quotations (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id),
  lead_id BIGINT REFERENCES leads(id),
  job_id BIGINT,
  status VARCHAR(32) NOT NULL,
  subtotal INT NOT NULL DEFAULT 0,
  discount INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  note VARCHAR(800),
  shared_via_line BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE quotation_items (
  id BIGSERIAL PRIMARY KEY,
  quotation_id BIGINT NOT NULL REFERENCES quotations(id),
  label VARCHAR(160) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price INT NOT NULL DEFAULT 0,
  amount INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE jobs (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id),
  lead_id BIGINT REFERENCES leads(id),
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  assigned_technician_id BIGINT REFERENCES technician_profiles(id),
  quotation_id BIGINT REFERENCES quotations(id),
  job_code VARCHAR(48) NOT NULL UNIQUE,
  status VARCHAR(32) NOT NULL,
  service_type VARCHAR(32) NOT NULL,
  area_label VARCHAR(160) NOT NULL,
  address_line VARCHAR(255) NOT NULL,
  symptom VARCHAR(800),
  scheduled_date VARCHAR(40),
  scheduled_time VARCHAR(40),
  payment_status VARCHAR(40) NOT NULL DEFAULT 'pending',
  internal_note VARCHAR(1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE job_photos (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES jobs(id),
  kind VARCHAR(40) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  caption VARCHAR(160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE job_timeline_events (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES jobs(id),
  type VARCHAR(40) NOT NULL,
  label VARCHAR(120) NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id),
  technician_id BIGINT NOT NULL REFERENCES technician_profiles(id),
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  job_id BIGINT NOT NULL REFERENCES jobs(id),
  rating INT NOT NULL,
  comment VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_membership_store ON store_memberships(store_id);
CREATE INDEX idx_technician_store ON technician_profiles(store_id);
CREATE INDEX idx_customer_store ON customers(store_id);
CREATE INDEX idx_lead_store ON leads(store_id);
CREATE INDEX idx_lead_assigned_technician ON leads(assigned_technician_id);
CREATE INDEX idx_job_store ON jobs(store_id);
CREATE INDEX idx_job_assigned_technician ON jobs(assigned_technician_id);
