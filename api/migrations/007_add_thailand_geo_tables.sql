ALTER TABLE service_areas
  ADD COLUMN IF NOT EXISTS subdistrict VARCHAR(120);

CREATE TABLE IF NOT EXISTS thai_provinces (
  id BIGINT PRIMARY KEY,
  name_th VARCHAR(120) NOT NULL,
  name_en VARCHAR(120),
  geography_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS thai_districts (
  id BIGINT PRIMARY KEY,
  province_id BIGINT NOT NULL REFERENCES thai_provinces(id),
  name_th VARCHAR(120) NOT NULL,
  name_en VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS thai_subdistricts (
  id BIGINT PRIMARY KEY,
  province_id BIGINT NOT NULL REFERENCES thai_provinces(id),
  district_id BIGINT NOT NULL REFERENCES thai_districts(id),
  zip_code VARCHAR(16),
  name_th VARCHAR(120) NOT NULL,
  name_en VARCHAR(120),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_thai_province_name_th ON thai_provinces(name_th);
CREATE INDEX IF NOT EXISTS idx_thai_district_province ON thai_districts(province_id);
CREATE INDEX IF NOT EXISTS idx_thai_district_name_th ON thai_districts(name_th);
CREATE INDEX IF NOT EXISTS idx_thai_subdistrict_province ON thai_subdistricts(province_id);
CREATE INDEX IF NOT EXISTS idx_thai_subdistrict_district ON thai_subdistricts(district_id);
CREATE INDEX IF NOT EXISTS idx_thai_subdistrict_name_th ON thai_subdistricts(name_th);
