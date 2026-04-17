CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(32) NOT NULL DEFAULT 'customer',
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(32),
  email VARCHAR(160),
  avatar_url VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_identities (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  provider VARCHAR(32) NOT NULL,
  provider_user_id VARCHAR(191) NOT NULL,
  email VARCHAR(160),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_user_identities_provider_subject UNIQUE (provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS stores (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  phone VARCHAR(32),
  line_oa_id VARCHAR(120),
  logo_url VARCHAR(255),
  description VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS auth_signup_sessions (
  id BIGSERIAL PRIMARY KEY,
  token VARCHAR(80) NOT NULL UNIQUE,
  user_id BIGINT NOT NULL REFERENCES users(id),
  store_id BIGINT REFERENCES stores(id),
  account_type VARCHAR(32) NOT NULL,
  provider VARCHAR(32) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS store_memberships (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
  display_name VARCHAR(120),
  role VARCHAR(32) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_store_memberships_store_user UNIQUE (store_id, user_id)
);

CREATE TABLE IF NOT EXISTS technician_profiles (
  id BIGSERIAL PRIMARY KEY,
  membership_id BIGINT NOT NULL UNIQUE REFERENCES store_memberships(id),
  store_id BIGINT NOT NULL REFERENCES stores(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
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

CREATE TABLE IF NOT EXISTS technician_services (
  id BIGSERIAL PRIMARY KEY,
  technician_id BIGINT NOT NULL REFERENCES technician_profiles(id),
  service_type VARCHAR(32) NOT NULL,
  label VARCHAR(140) NOT NULL,
  starting_price INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS service_areas (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id),
  technician_id BIGINT REFERENCES technician_profiles(id),
  province VARCHAR(120) NOT NULL,
  district VARCHAR(120) NOT NULL,
  label VARCHAR(160) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_profiles (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id),
  user_id BIGINT NOT NULL REFERENCES users(id),
  preferred_area VARCHAR(160),
  total_spend INT NOT NULL DEFAULT 0,
  note VARCHAR(800),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_customer_profiles_store_user UNIQUE (store_id, user_id)
);

CREATE TABLE IF NOT EXISTS user_addresses (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
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

CREATE TABLE IF NOT EXISTS leads (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id),
  customer_user_id BIGINT NOT NULL REFERENCES users(id),
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

CREATE TABLE IF NOT EXISTS lead_units (
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

CREATE TABLE IF NOT EXISTS quotations (
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

CREATE TABLE IF NOT EXISTS quotation_items (
  id BIGSERIAL PRIMARY KEY,
  quotation_id BIGINT NOT NULL REFERENCES quotations(id),
  label VARCHAR(160) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price INT NOT NULL DEFAULT 0,
  amount INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id),
  lead_id BIGINT REFERENCES leads(id),
  customer_user_id BIGINT NOT NULL REFERENCES users(id),
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

CREATE TABLE IF NOT EXISTS job_photos (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES jobs(id),
  kind VARCHAR(40) NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  caption VARCHAR(160),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_timeline_events (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT NOT NULL REFERENCES jobs(id),
  type VARCHAR(40) NOT NULL,
  label VARCHAR(120) NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  store_id BIGINT NOT NULL REFERENCES stores(id),
  technician_id BIGINT NOT NULL REFERENCES technician_profiles(id),
  customer_user_id BIGINT NOT NULL REFERENCES users(id),
  job_id BIGINT NOT NULL REFERENCES jobs(id),
  rating INT NOT NULL,
  comment VARCHAR(500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_identity_user ON user_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_identity_email ON user_identities(email);
CREATE INDEX IF NOT EXISTS idx_auth_signup_session_user ON auth_signup_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_signup_session_store ON auth_signup_sessions(store_id);
CREATE INDEX IF NOT EXISTS idx_auth_signup_session_expires ON auth_signup_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_signup_session_consumed ON auth_signup_sessions(consumed_at);
CREATE INDEX IF NOT EXISTS idx_membership_store ON store_memberships(store_id);
CREATE INDEX IF NOT EXISTS idx_membership_user ON store_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_membership_role ON store_memberships(role);
CREATE INDEX IF NOT EXISTS idx_technician_store ON technician_profiles(store_id);
CREATE INDEX IF NOT EXISTS idx_technician_user ON technician_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_technician_service_technician ON technician_services(technician_id);
CREATE INDEX IF NOT EXISTS idx_service_area_store ON service_areas(store_id);
CREATE INDEX IF NOT EXISTS idx_service_area_technician ON service_areas(technician_id);
CREATE INDEX IF NOT EXISTS idx_customer_profile_store ON customer_profiles(store_id);
CREATE INDEX IF NOT EXISTS idx_customer_profile_user ON customer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_address_user ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_store ON leads(store_id);
CREATE INDEX IF NOT EXISTS idx_lead_customer_user ON leads(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_lead_assigned_technician ON leads(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_lead_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_lead_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_lead_unit_lead ON lead_units(lead_id);
CREATE INDEX IF NOT EXISTS idx_quotation_store ON quotations(store_id);
CREATE INDEX IF NOT EXISTS idx_quotation_lead ON quotations(lead_id);
CREATE INDEX IF NOT EXISTS idx_quotation_job ON quotations(job_id);
CREATE INDEX IF NOT EXISTS idx_quotation_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotation_item_quotation ON quotation_items(quotation_id);
CREATE INDEX IF NOT EXISTS idx_job_store ON jobs(store_id);
CREATE INDEX IF NOT EXISTS idx_job_lead ON jobs(lead_id);
CREATE INDEX IF NOT EXISTS idx_job_customer_user ON jobs(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_job_assigned_technician ON jobs(assigned_technician_id);
CREATE INDEX IF NOT EXISTS idx_job_quotation ON jobs(quotation_id);
CREATE INDEX IF NOT EXISTS idx_job_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_job_photo_job ON job_photos(job_id);
CREATE INDEX IF NOT EXISTS idx_job_timeline_job ON job_timeline_events(job_id);
CREATE INDEX IF NOT EXISTS idx_review_store ON reviews(store_id);
CREATE INDEX IF NOT EXISTS idx_review_technician ON reviews(technician_id);
CREATE INDEX IF NOT EXISTS idx_review_customer_user ON reviews(customer_user_id);
CREATE INDEX IF NOT EXISTS idx_review_job ON reviews(job_id);
